const authService = require('./auth.service');
const { success, error } = require('../../utils/response');

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, fullName, phone } = req.body;
    const result = await authService.register({ email, password, fullName, phone });
    return success(res, result, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return success(res, result, 'Login successful.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    return success(res, result, 'Token refreshed.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return success(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/profile
 */
async function profile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, profile };
