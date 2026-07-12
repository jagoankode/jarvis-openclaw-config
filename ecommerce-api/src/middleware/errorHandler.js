const { error } = require('../utils/response');

/**
 * Global error handling middleware.
 * Tangkap semua error yang tidak tertangani di route.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  console.error('Unhandled Error:', err);

  // Postgres unique violation
  if (err.code === '23505') {
    return error(res, 'Duplicate entry. Resource already exists.', 409);
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return error(res, 'Referenced resource does not exist.', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal Server Error';

  return error(res, message, statusCode);
}

module.exports = { errorHandler };
