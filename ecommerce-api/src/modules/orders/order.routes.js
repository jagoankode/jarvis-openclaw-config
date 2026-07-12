const { Router } = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../../utils/validator');
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./order.controller');

const router = Router();

// --- CART ---
// GET /api/cart
router.get('/cart', authenticate, ctrl.getCart);

// POST /api/cart
router.post(
  '/cart',
  authenticate,
  [
    body('productId').isUUID().withMessage('Valid product ID is required.'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be >= 1.'),
    validate,
  ],
  ctrl.addToCart,
);

// PUT /api/cart/:cartItemId
router.put(
  '/cart/:cartItemId',
  authenticate,
  [
    param('cartItemId').isUUID().withMessage('Invalid cart item ID.'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1.'),
    validate,
  ],
  ctrl.updateCartItem,
);

// DELETE /api/cart/:cartItemId
router.delete(
  '/cart/:cartItemId',
  authenticate,
  [param('cartItemId').isUUID().withMessage('Invalid cart item ID.'), validate],
  ctrl.removeFromCart,
);

// --- CHECKOUT ---
// POST /api/checkout
router.post(
  '/checkout',
  authenticate,
  [
    body('shippingAddress').optional().isObject().withMessage('Invalid shipping address.'),
    body('notes').optional().isString(),
    validate,
  ],
  ctrl.checkout,
);

// --- ORDERS ---
// GET /api/orders
router.get(
  '/orders',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  ctrl.listOrders,
);

// GET /api/orders/:id
router.get(
  '/orders/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid order ID.'), validate],
  ctrl.getOrder,
);

// PUT /api/orders/:id/status (admin only)
router.put(
  '/orders/:id/status',
  authenticate,
  authorize('admin'),
  [
    param('id').isUUID().withMessage('Invalid order ID.'),
    body('status').isIn(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status.'),
    validate,
  ],
  ctrl.updateOrderStatus,
);

module.exports = router;
