const productService = require('./product.service');
const { success, paginated } = require('../../utils/response');

/**
 * GET /api/products
 * Query: page, limit, search, categoryId, minPrice, maxPrice, sortBy, sortOrder
 */
async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, search, categoryId, minPrice, maxPrice, sortBy, sortOrder } = req.query;
    const { rows, total } = await productService.list({
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 100),
      search,
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder,
    });
    return paginated(res, rows, total, parseInt(page, 10), parseInt(limit, 10));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:id
 */
async function getById(req, res, next) {
  try {
    const product = await productService.getById(req.params.id);
    return success(res, product);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products (admin only)
 */
async function create(req, res, next) {
  try {
    const product = await productService.create(req.body);
    return success(res, product, 'Product created.', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/products/:id (admin only)
 */
async function update(req, res, next) {
  try {
    const product = await productService.update(req.params.id, req.body);
    return success(res, product, 'Product updated.');
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id (admin only)
 */
async function remove(req, res, next) {
  try {
    await productService.remove(req.params.id);
    return success(res, null, 'Product deleted.');
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
