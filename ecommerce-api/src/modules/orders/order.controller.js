const orderService = require('./order.service');
const { success, paginated, error } = require('../../utils/response');

// ============================================================
// CART
// ============================================================

/**
 * GET /api/cart
 */
async function getCart(req, res, next) {
  try {
    const items = await orderService.getCart(req.user.id);
    return success(res, items);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/cart
 */
async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    const item = await orderService.addToCart(req.user.id, productId, quantity);
    return success(res, item, 'Added to cart.', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/cart/:cartItemId
 */
async function updateCartItem(req, res, next) {
  try {
    const item = await orderService.updateCartItem(req.user.id, req.params.cartItemId, req.body.quantity);
    return success(res, item, 'Cart updated.');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/cart/:cartItemId
 */
async function removeFromCart(req, res, next) {
  try {
    await orderService.removeFromCart(req.user.id, req.params.cartItemId);
    return success(res, null, 'Removed from cart.');
  } catch (err) {
    next(err);
  }
}

// ============================================================
// CHECKOUT
// ============================================================

/**
 * POST /api/checkout
 */
async function checkout(req, res, next) {
  try {
    const { shippingAddress, notes } = req.body;
    const order = await orderService.checkout(req.user.id, shippingAddress, notes);
    return success(res, order, 'Checkout successful. Please complete payment.', 201);
  } catch (err) {
    next(err);
  }
}

// ============================================================
// ORDERS
// ============================================================

/**
 * GET /api/orders
 */
async function listOrders(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { rows, total } = await orderService.listOrders(req.user.id, req.user.role, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
    });
    return paginated(res, rows, total, parseInt(page, 10), parseInt(limit, 10));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/:id
 */
async function getOrder(req, res, next) {
  try {
    const order = await orderService.getOrder(req.params.id, req.user.id, req.user.role);
    return success(res, order);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/orders/:id/status (admin only)
 */
async function updateOrderStatus(req, res, next) {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    return success(res, order, 'Order status updated.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  checkout,
  listOrders,
  getOrder,
  updateOrderStatus,
};
