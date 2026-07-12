/**
 * Global error handler middleware.
 * Catches all errors thrown from route handlers and returns a consistent response.
 * Distinguishes between known application errors (with statusCode) and unexpected errors.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, _next) {
  // Validation errors from express-validator
  if (err.type === 'validation' && err.errors) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path || e.param,
        message: e.msg,
      })),
    });
  }

  // Known application errors (with custom statusCode)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown errors
  console.error('[ERROR]', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
}

export default { errorHandler };
