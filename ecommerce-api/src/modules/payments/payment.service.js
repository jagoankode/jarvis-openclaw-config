const midtransClient = require('midtrans-client');
const { query } = require('../../config/database');

/**
 * Inisialisasi Midtrans Core API.
 * Gunakan server key dari environment.
 */
let snap;

function _getSnap() {
  if (!snap) {
    snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  }
  return snap;
}

/**
 * Buat payment / dapatkan Snap token dari Midtrans.
 * @param {object} order - Order object dari database
 * @param {object} user - User object (id, email, full_name)
 * @returns {Promise<{payment: object, snapToken: string, redirectUrl: string}>}
 */
async function createPayment(order, user) {
  // Cek apakah sudah ada payment pending untuk order ini
  const existingPayment = await query(
    `SELECT id, payment_status, midtrans_order_id FROM payments
     WHERE order_id = $1 AND payment_status = 'pending'
     ORDER BY created_at DESC LIMIT 1`,
    [order.id],
  );

  // Kalau ada pending payment yang belum expired, return yang existing
  if (existingPayment.rowCount > 0) {
    const payment = existingPayment.rows[0];
    // Coba dapatkan status transaksi dari Midtrans
    try {
      const coreApi = new midtransClient.CoreApi({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });
      const txStatus = await coreApi.transaction.status(payment.midtrans_order_id);
      // Kalau masih pending, return existing
      if (txStatus.transaction_status === 'pending') {
        return {
          payment,
          snapToken: null, // existing tx, gak perlu Snap token baru
          redirectUrl: null,
        };
      }
    } catch {
      // Kalau gagal cek status, bikin transaksi baru
    }
  }

  // Generate order ID unik untuk Midtrans
  const midtransOrderId = `ORDER-${order.order_number}-${Date.now()}`;

  // Hitung item details untuk Midtrans
  const itemDetails = (order.items || []).map((item) => ({
    id: item.product_id,
    price: Math.round(parseFloat(item.product_price)),
    quantity: item.quantity,
    name: item.product_name.substring(0, 50),
  }));

  // Tambah shipping cost
  if (parseFloat(order.shipping_cost) > 0) {
    itemDetails.push({
      id: 'SHIPPING',
      price: Math.round(parseFloat(order.shipping_cost)),
      quantity: 1,
      name: 'Shipping Cost',
    });
  }

  // Tambah tax
  if (parseFloat(order.tax_amount) > 0) {
    itemDetails.push({
      id: 'TAX',
      price: Math.round(parseFloat(order.tax_amount)),
      quantity: 1,
      name: 'Tax (PPN 11%)',
    });
  }

  const parameters = {
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: Math.round(parseFloat(order.total_amount)),
    },
    item_details: itemDetails,
    customer_details: {
      first_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
    },
    callbacks: {
      finish: process.env.FRONTEND_URL || 'http://localhost:3000',
    },
  };

  const snapInstance = _getSnap();
  const transaction = await snapInstance.createTransaction(parameters);

  // Simpan payment record
  const paymentResult = await query(
    `INSERT INTO payments (order_id, payment_method, payment_status, amount, midtrans_order_id, midtrans_payment_type)
     VALUES ($1, 'midtrans', 'pending', $2, $3, $4)
     RETURNING *`,
    [order.id, order.total_amount, midtransOrderId, 'snap'],
  );

  return {
    payment: paymentResult.rows[0],
    snapToken: transaction.token,
    redirectUrl: transaction.redirect_url,
  };
}

/**
 * Handle Midtrans notification callback (webhook).
 * @param {object} notification - Midtrans notification JSON
 * @returns {Promise<{orderId: string, status: string}>}
 */
async function handleNotification(notification) {
  const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
  });

  // Verifikasi notifikasi
  let statusResponse;
  try {
    statusResponse = await coreApi.transaction.notification(notification);
  } catch {
    const err = new Error('Invalid Midtrans notification.');
    err.statusCode = 400;
    throw err;
  }

  const orderId = statusResponse.order_id;
  const transactionStatus = statusResponse.transaction_status;
  const fraudStatus = statusResponse.fraud_status;

  // Map Midtrans status ke payment_status kita
  let paymentStatus;
  if (transactionStatus === 'capture') {
    paymentStatus = fraudStatus === 'accept' ? 'settlement' : 'deny';
  } else if (transactionStatus === 'settlement') {
    paymentStatus = 'settlement';
  } else if (transactionStatus === 'pending') {
    paymentStatus = 'pending';
  } else if (['deny', 'cancel', 'expire'].includes(transactionStatus)) {
    paymentStatus = transactionStatus;
  } else if (transactionStatus === 'failure') {
    paymentStatus = 'failure';
  } else {
    paymentStatus = 'pending';
  }

  // Update payment record
  const paymentResult = await query(
    `UPDATE payments
     SET payment_status = $1,
         midtrans_raw_response = $2,
         paid_at = CASE WHEN $1 = 'settlement' THEN NOW() ELSE paid_at END,
         updated_at = NOW()
     WHERE midtrans_order_id = $3
     RETURNING *`,
    [paymentStatus, JSON.stringify(statusResponse), orderId],
  );

  if (paymentResult.rowCount === 0) {
    const err = new Error('Payment record not found.');
    err.statusCode = 404;
    throw err;
  }

  const payment = paymentResult.rows[0];

  // Update order status berdasarkan payment
  if (paymentStatus === 'settlement') {
    await query(
      "UPDATE orders SET status = 'paid' WHERE id = $1",
      [payment.order_id],
    );
  } else if (['expire', 'cancel', 'deny', 'failure'].includes(paymentStatus)) {
    // Order tetap pending, bisa dicoba payment ulang
    // Tapi kalau mau auto-cancel: UPDATE orders SET status = 'cancelled'
  }

  return {
    orderId: payment.order_id,
    status: paymentStatus,
  };
}

/**
 * Cek status payment.
 * @param {string} orderId
 * @returns {Promise<object>}
 */
async function getPaymentStatus(orderId) {
  const result = await query(
    `SELECT id, payment_method, payment_status, amount, midtrans_order_id,
            midtrans_payment_type, paid_at, created_at
     FROM payments
     WHERE order_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [orderId],
  );

  if (result.rowCount === 0) {
    const err = new Error('No payment found for this order.');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

module.exports = { createPayment, handleNotification, getPaymentStatus };
