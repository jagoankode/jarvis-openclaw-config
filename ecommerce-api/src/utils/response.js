/**
 * Standardized API response helpers.
 */

/**
 * Success response.
 * @param {import('express').Response} res
 * @param {object} [data={}]
 * @param {string} [message='Success']
 * @param {number} [statusCode=200]
 */
function success(res, data = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Paginated list response.
 * @param {import('express').Response} res
 * @param {Array} rows - Data rows
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
function paginated(res, rows, total, page, limit) {
  return res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * Error response.
 * @param {import('express').Response} res
 * @param {string} [message='Internal Server Error']
 * @param {number} [statusCode=500]
 * @param {*} [errors=null]
 */
function error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { success, paginated, error };
