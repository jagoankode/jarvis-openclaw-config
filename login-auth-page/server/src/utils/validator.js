import { validationResult } from 'express-validator';

/**
 * Middleware to check express-validator results.
 * If validation errors exist, formats and returns them.
 * Otherwise, passes to next handler.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.type = 'validation';
    err.errors = errors.array();
    return next(err);
  }
  next();
}

export default { validate };
