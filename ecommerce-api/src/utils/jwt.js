const jwt = require('jsonwebtoken');

/**
 * Generate access token.
 * @param {object} payload - Data yang disimpan di token (mis: { userId, email, role })
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Generate refresh token (longer-lived, untuk rotasi).
 * @param {object} payload - Data yang disimpan di token
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
}

/**
 * Verify a JWT token.
 * @param {string} token - JWT token string
 * @returns {object|null} Decoded payload atau null jika invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
