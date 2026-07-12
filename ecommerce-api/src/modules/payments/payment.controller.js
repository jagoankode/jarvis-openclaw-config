const paymentService = require('./payment.service');
const orderService = require('../orders/order.service');
const authService = require('../auth/auth.service');
const { success } = require('../../utils/response');

/**
 * POST /api/payments/create/:orderId
 * Buat payment untuk order & dapatkan Snap token.
 */
async function createPayment(req, res, next) {
  try {
    // Ambil order + user
    const order = await orderService.getOrder(req.params.orderId, req.user.id, req.user.role);
    const user = await authService.getProfile(req.user.id);

    const result = await paymentService.createPayment(order, user);
    return success(res, result, 'Payment created.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/notification
 * Midtrans webhook callback (no auth).
 */
async function handleNotification(req, res, next) {
  try {
    const result = await paymentService.handleNotification(req.body);
    return success(res, result, 'Notification processed.');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/payments/status/:orderId
 * Cek status payment order.
 */
async function getPaymentStatus(req, res, next) {
  try {
    const payment = await paymentService.getPaymentStatus(req.params.orderId);
    return success(res, payment);
  } catch (err) {
    next(err);
  }
}

module.exports = { createPayment, handleNotification, getPaymentStatus };
