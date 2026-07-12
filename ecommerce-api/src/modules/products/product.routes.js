const { Router } = require('express');
const { body, query, param } = require('express-validator');
const { validate } = require('../../utils/validator');
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./product.controller');

const router = Router();

// GET /api/products — public
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit 1-100'),
    query('sortBy').optional().isIn(['name', 'price', 'stock', 'created_at']),
    query('sortOrder').optional().isIn(['ASC', 'DESC', 'asc', 'desc']),
    validate,
  ],
  ctrl.list,
);

// GET /api/products/:id — public
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid product ID.'), validate],
  ctrl.getById,
);

// POST /api/products — admin only
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('slug').trim().notEmpty().withMessage('Slug is required.'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0.'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be >= 0.'),
    validate,
  ],
  ctrl.create,
);

// PUT /api/products/:id — admin only
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isUUID().withMessage('Invalid product ID.'), validate],
  ctrl.update,
);

// DELETE /api/products/:id — admin only
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isUUID().withMessage('Invalid product ID.'), validate],
  ctrl.remove,
);

module.exports = router;
