const bcrypt = require('bcryptjs');
const { query, getClient } = require('../../config/database');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');

const SALT_ROUNDS = 12;

/**
 * Register user baru.
 * @param {object} p
 * @param {string} p.email
 * @param {string} p.password
 * @param {string} p.fullName
 * @param {string} [p.phone]
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
 */
async function register({ email, password, fullName, phone }) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    const err = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, full_name, phone, role, created_at`,
    [email, passwordHash, fullName, phone || null],
  );

  const user = result.rows[0];
  const tokenPayload = { userId: user.id, email: user.email, role: user.role };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Simpan refresh token
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, expiresAt],
  );

  return { user, accessToken, refreshToken };
}

/**
 * Login user.
 * @param {object} p
 * @param {string} p.email
 * @param {string} p.password
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
 */
async function login({ email, password }) {
  const result = await query(
    'SELECT id, email, password_hash, full_name, phone, role, is_active FROM users WHERE email = $1',
    [email],
  );

  if (result.rowCount === 0) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const user = result.rows[0];

  if (!user.is_active) {
    const err = new Error('Account is deactivated.');
    err.statusCode = 403;
    throw err;
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  delete user.password_hash;

  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, expiresAt],
  );

  return { user, accessToken, refreshToken };
}

/**
 * Refresh access token menggunakan refresh token.
 * @param {string} token - Refresh token
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
async function refreshAccessToken(token) {
  const result = await query(
    `SELECT rt.token, rt.expires_at, u.id, u.email, u.role, u.is_active
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token = $1`,
    [token],
  );

  if (result.rowCount === 0) {
    const err = new Error('Invalid refresh token.');
    err.statusCode = 401;
    throw err;
  }

  const row = result.rows[0];

  if (!row.is_active) {
    const err = new Error('Account is deactivated.');
    err.statusCode = 403;
    throw err;
  }

  if (new Date(row.expires_at) < new Date()) {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    const err = new Error('Refresh token expired.');
    err.statusCode = 401;
    throw err;
  }

  // Hapus token lama, generate baru (rotation)
  await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);

  const tokenPayload = { userId: row.id, email: row.email, role: row.role };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [row.id, newRefreshToken, expiresAt],
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/**
 * Logout — hapus refresh token.
 * @param {string} token - Refresh token yang akan dihapus
 */
async function logout(token) {
  await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

/**
 * Ambil profile user by ID.
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getProfile(userId) {
  const result = await query(
    'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1',
    [userId],
  );
  if (result.rowCount === 0) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
}

module.exports = { register, login, refreshAccessToken, logout, getProfile };
