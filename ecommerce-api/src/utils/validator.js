const { validationResult } = require('express-validator');
const { error } = require('./response');

/**
 * Middleware: cek hasil validasi express-validator.
 * Return 422 jika ada field yang gagal validasi.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return error(res, 'Validation failed', 422, extracted);
  }
  next();
}

module.exports = { validate };
