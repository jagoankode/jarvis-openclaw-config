import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate an access token for a user.
 * @param {object} payload - User data to embed in token
 * @param {string} payload.userId - User UUID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @returns {string} Signed JWT access token
 */
export function generateAccessToken(payload) {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Generate a refresh token for a user.
 * @param {object} payload - User data to embed in token
 * @param {string} payload.userId - User UUID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role
 * @returns {string} Signed JWT refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
}

/**
 * Verify a JWT token and return decoded payload.
 * @param {string} token - JWT string
 * @returns {object|null} Decoded payload or null if invalid/expired
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Decode a JWT token without verifying signature (for inspection only).
 * @param {string} token - JWT string
 * @returns {object|null} Decoded payload
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};
