import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../utils/validator.js';

const router = Router();

/**
 * POST /api/auth/register
 * Validation: email format, password min 8 chars, fullName required.
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.'),
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required.')
      .isLength({ max: 150 })
      .withMessage('Full name must not exceed 150 characters.'),
    validate,
  ],
  (req, res, next) => authController.register(req, res, next)
);

/**
 * POST /api/auth/login
 * Validation: email and password required.
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required.')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required.'),
    validate,
  ],
  (req, res, next) => authController.login(req, res, next)
);

/**
 * POST /api/auth/refresh
 * Validation: refreshToken required.
 */
router.post(
  '/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required.'),
    validate,
  ],
  (req, res, next) => authController.refresh(req, res, next)
);

/**
 * POST /api/auth/logout
 * Validation: refreshToken required.
 */
router.post(
  '/logout',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required.'),
    validate,
  ],
  (req, res, next) => authController.logout(req, res, next)
);

/**
 * GET /api/auth/profile
 * Protected: requires valid access token.
 */
router.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));

export default router;
