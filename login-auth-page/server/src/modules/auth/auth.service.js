import { getDb } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/jwt.js';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_DAYS = 30;

/**
 * AuthService — business logic for authentication.
 * Handles register, login, refresh, logout, and profile operations.
 */
class AuthService {
  /**
   * Register a new user.
   * @param {object} params
   * @param {string} params.email - User email
   * @param {string} params.password - Plaintext password (min 8 chars)
   * @param {string} params.fullName - User's full name
   * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
   * @throws {Error} 409 if email already registered
   */
  async register({ email, password, fullName }) {
    const db = getDb();
    const normalizedEmail = email.toLowerCase().trim();

    const existing = db.findUserByEmail(normalizedEmail);
    if (existing) {
      const err = new Error('Email already registered.');
      err.statusCode = 409;
      throw err;
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const now = new Date().toISOString();

    db.insertUser({
      id,
      email: normalizedEmail,
      password_hash: passwordHash,
      full_name: fullName,
      role: 'user',
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    const user = {
      id,
      email: normalizedEmail,
      full_name: fullName,
      role: 'user',
      created_at: now,
    };

    const accessToken = generateAccessToken({ userId: id, email: normalizedEmail, role: 'user' });
    const refreshToken = generateRefreshToken({ userId: id, email: normalizedEmail, role: 'user' });

    this._storeRefreshToken(id, refreshToken);

    return { user, accessToken, refreshToken };
  }

  /**
   * Authenticate a user with email and password.
   * @param {object} params
   * @param {string} params.email - User email
   * @param {string} params.password - Plaintext password
   * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>}
   * @throws {Error} 401 if credentials invalid
   * @throws {Error} 403 if account is deactivated
   */
  async login({ email, password }) {
    const db = getDb();
    const normalizedEmail = email.toLowerCase().trim();

    const row = db.findUserByEmail(normalizedEmail);

    if (!row) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    if (!row.is_active) {
      const err = new Error('Account is deactivated.');
      err.statusCode = 403;
      throw err;
    }

    const isValid = await bcrypt.compare(password, row.password_hash);
    if (!isValid) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const user = {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      role: row.role,
      created_at: row.created_at,
    };

    const accessToken = generateAccessToken({ userId: row.id, email: row.email, role: row.role });
    const refreshToken = generateRefreshToken({ userId: row.id, email: row.email, role: row.role });

    this._storeRefreshToken(row.id, refreshToken);

    return { user, accessToken, refreshToken };
  }

  /**
   * Rotate refresh token: invalidate old, issue new pair.
   * @param {string} oldRefreshToken - The refresh token to rotate
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   * @throws {Error} 401 if token invalid/expired
   */
  async refresh(oldRefreshToken) {
    const db = getDb();

    const payload = verifyToken(oldRefreshToken);
    if (!payload) {
      const err = new Error('Invalid refresh token.');
      err.statusCode = 401;
      throw err;
    }

    const stored = db.findRefreshToken(oldRefreshToken);
    if (!stored) {
      const err = new Error('Invalid refresh token.');
      err.statusCode = 401;
      throw err;
    }

    db.deleteRefreshToken(stored.id);

    const user = db.findUserById(stored.user_id);
    if (!user || !user.is_active) {
      const err = new Error('Account not available.');
      err.statusCode = 403;
      throw err;
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    this._storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Logout: invalidate refresh token.
   * @param {string} refreshToken - The refresh token to invalidate
   * @returns {Promise<void>}
   */
  async logout(refreshToken) {
    const db = getDb();
    db.deleteRefreshTokenByValue(refreshToken);
  }

  /**
   * Get user profile by ID.
   * @param {string} userId - User UUID
   * @returns {Promise<object|null>} User profile or null if not found
   */
  async getProfile(userId) {
    const db = getDb();
    const row = db.findUserById(userId);
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      role: row.role,
      created_at: row.created_at,
    };
  }

  /**
   * Store a refresh token in the database.
   * @private
   * @param {string} userId - User UUID
   * @param {string} token - JWT refresh token
   */
  _storeRefreshToken(userId, token) {
    const db = getDb();
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000).toISOString();
    db.insertRefreshToken({ id, user_id: userId, token, expires_at: expiresAt, created_at: new Date().toISOString() });
  }
}

export const authService = new AuthService();
export default AuthService;
