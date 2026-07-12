const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../../utils/validator');
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./auth.controller');

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.'),
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number.'),
    validate,
  ],
  ctrl.register,
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
    validate,
  ],
  ctrl.login,
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required.'), validate],
  ctrl.refresh,
);

// POST /api/auth/logout
router.post(
  '/logout',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required.'), validate],
  ctrl.logout,
);

// GET /api/auth/profile
router.get('/profile', authenticate, ctrl.profile);

module.exports = router;
