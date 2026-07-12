const { query } = require('../../config/database');

/**
 * List produk dengan pagination, search, dan filter.
 * @param {object} p
 * @param {number} [p.page=1]
 * @param {number} [p.limit=20]
 * @param {string} [p.search]
 * @param {string} [p.categoryId]
 * @param {number} [p.minPrice]
 * @param {number} [p.maxPrice]
 * @param {string} [p.sortBy='created_at']
 * @param {string} [p.sortOrder='DESC']
 * @returns {Promise<{rows: Array, total: number}>}
 */
async function list({ page = 1, limit = 20, search, categoryId, minPrice, maxPrice, sortBy = 'created_at', sortOrder = 'DESC' }) {
  const conditions = ['p.is_active = true'];
  const params = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (categoryId) {
    conditions.push(`p.category_id = $${paramIndex}`);
    params.push(categoryId);
    paramIndex++;
  }

  if (minPrice !== undefined) {
    conditions.push(`p.price >= $${paramIndex}`);
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== undefined) {
    conditions.push(`p.price <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  // Whitelist sort column
  const allowedSort = ['name', 'price', 'stock', 'created_at'];
  const sortCol = allowedSort.includes(sortBy) ? sortBy : 'created_at';
  const sortDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${where}
       ORDER BY p.${sortCol} ${sortDir}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    ),
    query(`SELECT COUNT(*) FROM products p ${where}`, params),
  ]);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

/**
 * Ambil satu produk by ID.
 * @param {string} id
 * @returns {Promise<object>}
 */
async function getById(id) {
  const result = await query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1 AND p.is_active = true`,
    [id],
  );
  if (result.rowCount === 0) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
}

/**
 * Buat produk baru (admin only).
 * @param {object} p
 * @returns {Promise<object>}
 */
async function create({ name, slug, description, price, stock, sku, categoryId, imageUrl, compareAtPrice }) {
  const result = await query(
    `INSERT INTO products (name, slug, description, price, compare_at_price, stock, sku, category_id, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, slug, description, price, compareAtPrice || null, stock || 0, sku || null, categoryId || null, imageUrl || null],
  );
  return result.rows[0];
}

/**
 * Update produk (admin only).
 * @param {string} id
 * @param {object} p
 * @returns {Promise<object>}
 */
async function update(id, { name, slug, description, price, compareAtPrice, stock, sku, categoryId, imageUrl, isActive }) {
  const fields = [];
  const params = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); params.push(name); }
  if (slug !== undefined) { fields.push(`slug = $${idx++}`); params.push(slug); }
  if (description !== undefined) { fields.push(`description = $${idx++}`); params.push(description); }
  if (price !== undefined) { fields.push(`price = $${idx++}`); params.push(price); }
  if (compareAtPrice !== undefined) { fields.push(`compare_at_price = $${idx++}`); params.push(compareAtPrice); }
  if (stock !== undefined) { fields.push(`stock = $${idx++}`); params.push(stock); }
  if (sku !== undefined) { fields.push(`sku = $${idx++}`); params.push(sku); }
  if (categoryId !== undefined) { fields.push(`category_id = $${idx++}`); params.push(categoryId); }
  if (imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); params.push(imageUrl); }
  if (isActive !== undefined) { fields.push(`is_active = $${idx++}`); params.push(isActive); }

  if (fields.length === 0) {
    const err = new Error('No fields to update.');
    err.statusCode = 400;
    throw err;
  }

  params.push(id);
  const result = await query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    params,
  );

  if (result.rowCount === 0) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Soft-delete produk (admin only).
 * @param {string} id
 */
async function remove(id) {
  const result = await query(
    'UPDATE products SET is_active = false WHERE id = $1 RETURNING id',
    [id],
  );
  if (result.rowCount === 0) {
    const err = new Error('Product not found.');
    err.statusCode = 404;
    throw err;
  }
}

/**
 * Cek stok & kurangi (untuk order).
 * @param {import('pg').PoolClient} client - Transaction client
 * @param {string} productId
 * @param {number} quantity
 */
async function _decrementStock(client, productId, quantity) {
  const result = await client.query(
    'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING id, name, price, stock',
    [quantity, productId],
  );
  if (result.rowCount === 0) {
    const err = new Error(`Insufficient stock for product ${productId}.`);
    err.statusCode = 400;
    throw err;
  }
  return result.rows[0];
}

module.exports = { list, getById, create, update, remove, _decrementStock };
