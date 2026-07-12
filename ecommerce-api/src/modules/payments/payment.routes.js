const { Router } = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../../utils/validator');
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./payment.controller');

const router = Router();

// POST /api/payments/create/:orderId — authenticated
router.post(
  '/create/:orderId',
  authenticate,
  [param('orderId').isUUID().withMessage('Invalid order ID.'), validate],
  ctrl.createPayment,
);

// POST /api/payments/notification — webhook (NO auth, dari Midtrans)
router.post('/notification', ctrl.handleNotification);

// GET /api/payments/status/:orderId — authenticated
router.get(
  '/status/:orderId',
  authenticate,
  [param('orderId').isUUID().withMessage('Invalid order ID.'), validate],
  ctrl.getPaymentStatus,
);

module.exports = router;
