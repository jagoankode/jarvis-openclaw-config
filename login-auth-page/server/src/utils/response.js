/**
 * Standard success response helper.
 * @param {object} res - Express response object
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {object} Express response
 */
export function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Standard error response helper.
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Array} [errors] - Validation error details
 * @returns {object} Express response
 */
export function error(res, message = 'Something went wrong', statusCode = 500, errors = null) {
  const body = {
    success: false,
    message,
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

export default { success, error };
