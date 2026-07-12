const { query, getClient } = require('../../config/database');
const productService = require('../products/product.service');

/**
 * Generate order number: format ORD-YYYYMMDD-XXXX
 * @param {import('pg').PoolClient} client
 * @returns {Promise<string>}
 */
async function _generateOrderNumber(client) {
  const date = new Date();
  const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

  const result = await client.query(
    `SELECT order_number FROM orders
     WHERE order_number LIKE $1
     ORDER BY order_number DESC LIMIT 1`,
    [`${prefix}-%`],
  );

  let seq = 1;
  if (result.rowCount > 0) {
    const lastSeq = parseInt(result.rows[0].order_number.split('-')[2], 10);
    seq = lastSeq + 1;
  }

  return `${prefix}-${String(seq).padStart(4, '0')}`;
}

// ============================================================
// CART
// ============================================================

/**
 * Ambil cart items user.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
async function getCart(userId) {
  const result = await query(
    `SELECT ci.id, ci.quantity, ci.updated_at,
            p.id AS product_id, p.name AS product_name, p.price, p.image_url, p.stock, p.is_active
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
    [userId],
  );
  return result.rows;
}

/**
 * Tambah item ke cart (upsert).
 * @param {string} userId
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<object>}
 */
async function addToCart(userId, productId, quantity) {
  // Cek produk exists & active
  const product = await query(
    'SELECT id, stock, is_active FROM products WHERE id = $1',
    [productId],
  );
  if (product.rowCount === 0 || !product.rows[0].is_active) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  const result = await query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = NOW()
     RETURNING *`,
    [userId, productId, quantity],
  );
  return result.rows[0];
}

/**
 * Update quantity cart item.
 * @param {string} userId
 * @param {string} cartItemId
 * @param {number} quantity
 */
async function updateCartItem(userId, cartItemId, quantity) {
  const result = await query(
    `UPDATE cart_items SET quantity = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [quantity, cartItemId, userId],
  );
  if (result.rowCount === 0) {
    const err = new Error('Cart item not found.');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
}

/**
 * Hapus item dari cart.
 * @param {string} userId
 * @param {string} cartItemId
 */
async function removeFromCart(userId, cartItemId) {
  const result = await query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
    [cartItemId, userId],
  );
  if (result.rowCount === 0) {
    const err = new Error('Cart item not found.');
    err.statusCode = 404;
    throw err;
  }
}

/**
 * Kosongkan cart user.
 * @param {string} userId
 */
async function clearCart(userId) {
  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
}

// ============================================================
// CHECKOUT & ORDERS
// ============================================================

/**
 * Checkout: cart → order (dalam transaction).
 * @param {string} userId
 * @param {object} [shippingAddress]
 * @param {string} [notes]
 * @returns {Promise<object>} Order yang baru dibuat
 */
async function checkout(userId, shippingAddress, notes) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Ambil cart items dengan lock produk
    const cartResult = await client.query(
      `SELECT ci.id AS cart_item_id, ci.quantity,
              p.id AS product_id, p.name AS product_name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id AND p.is_active = true
       WHERE ci.user_id = $1
       FOR UPDATE OF p`,
      [userId],
    );

    if (cartResult.rowCount === 0) {
      const err = new Error('Cart is empty.');
      err.statusCode = 400;
      throw err;
    }

    // 2. Validasi stok & hitung subtotal
    const items = cartResult.rows;
    let subtotal = 0;

    for (const item of items) {
      if (item.stock < item.quantity) {
        const err = new Error(`Insufficient stock for "${item.product_name}". Available: ${item.stock}.`);
        err.statusCode = 400;
        throw err;
      }
      subtotal += parseFloat(item.price) * item.quantity;
    }

    // 3. Kurangi stok
    for (const item of items) {
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id],
      );
    }

    // 4. Hitung tax & shipping
    const taxRate = 0.11; // PPN 11%
    const taxAmount = Math.round(subtotal * taxRate);
    const shippingCost = subtotal >= 500000 ? 0 : 25000; // Free shipping di atas 500rb
    const totalAmount = subtotal + taxAmount + shippingCost;

    // 5. Generate order number & insert order
    const orderNumber = await _generateOrderNumber(client);

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, user_id, status, subtotal, shipping_cost, tax_amount, total_amount, shipping_address, notes)
       VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [orderNumber, userId, subtotal, shippingCost, taxAmount, totalAmount, shippingAddress ? JSON.stringify(shippingAddress) : null, notes || null],
    );

    const order = orderResult.rows[0];

    // 6. Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.product_name, item.price, item.quantity, parseFloat(item.price) * item.quantity],
      );
    }

    // 7. Kosongkan cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    // Ambil order lengkap
    const fullOrder = await _getOrderWithItems(order.id);
    return fullOrder;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Ambil order dengan items.
 * @param {string} orderId
 * @returns {Promise<object>}
 */
async function _getOrderWithItems(orderId) {
  const orderResult = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (orderResult.rowCount === 0) return null;

  const itemsResult = await query(
    'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at',
    [orderId],
  );

  return { ...orderResult.rows[0], items: itemsResult.rows };
}

/**
 * List orders user (atau semua untuk admin).
 * @param {string} userId
 * @param {string} role
 * @param {object} p
 * @returns {Promise<{rows: Array, total: number}>}
 */
async function listOrders(userId, role, { page = 1, limit = 20, status }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (role !== 'admin') {
    conditions.push(`o.user_id = $${idx++}`);
    params.push(userId);
  }

  if (status) {
    conditions.push(`o.status = $${idx++}`);
    params.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    query(
      `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) FROM orders o ${where}`, params),
  ]);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

/**
 * Ambil satu order by ID.
 * @param {string} orderId
 * @param {string} userId
 * @param {string} role
 * @returns {Promise<object>}
 */
async function getOrder(orderId, userId, role) {
  let condition = 'o.id = $1';
  const params = [orderId];

  if (role !== 'admin') {
    condition += ' AND o.user_id = $2';
    params.push(userId);
  }

  const order = await _getOrderWithItems(orderId);

  if (!order) {
    const err = new Error('Order not found.');
    err.statusCode = 404;
    throw err;
  }

  // Check ownership
  if (role !== 'admin' && order.user_id !== userId) {
    const err = new Error('Order not found.');
    err.statusCode = 404;
    throw err;
  }

  return order;
}

/**
 * Update status order (admin only).
 * @param {string} orderId
 * @param {string} status
 * @returns {Promise<object>}
 */
async function updateOrderStatus(orderId, status) {
  const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}.`);
    err.statusCode = 400;
    throw err;
  }

  // Cancel → kembalikan stok
  if (status === 'cancelled') {
    await _restoreStockOnCancel(orderId);
  }

  const result = await query(
    'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
    [status, orderId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Order not found.');
    err.statusCode = 404;
    throw err;
  }

  return _getOrderWithItems(orderId);
}

/**
 * Kembalikan stok saat order dicancel.
 * @param {string} orderId
 */
async function _restoreStockOnCancel(orderId) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const order = await client.query(
      "SELECT status FROM orders WHERE id = $1 FOR UPDATE",
      [orderId],
    );

    if (order.rowCount === 0 || order.rows[0].status === 'cancelled') {
      await client.query('ROLLBACK');
      return;
    }

    const items = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId],
    );

    for (const item of items.rows) {
      await client.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id],
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  // Cart
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  // Orders
  checkout,
  listOrders,
  getOrder,
  updateOrderStatus,
};
