import { authService } from './auth.service.js';
import { success, error } from '../../utils/response.js';

/**
 * AuthController — Express request handlers for auth endpoints.
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user.
   */
  async register(req, res, next) {
    try {
      const { email, password, fullName } = req.body;
      const result = await authService.register({ email, password, fullName });
      return success(res, result, 'Registration successful.', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user and return tokens.
   */
  async login(req, res, next) {
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
   * Refresh access token using refresh token.
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return error(res, 'Refresh token is required.', 400);
      }
      const result = await authService.refresh(refreshToken);
      return success(res, result, 'Token refreshed.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/logout
   * Invalidate refresh token.
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return error(res, 'Refresh token is required.', 400);
      }
      await authService.logout(refreshToken);
      return success(res, null, 'Logged out successfully.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/profile
   * Get authenticated user profile.
   */
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.userId);
      if (!user) {
        return error(res, 'User not found.', 404);
      }
      return success(res, user);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
export default AuthController;
