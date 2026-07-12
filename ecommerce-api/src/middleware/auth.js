const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

/**
 * Middleware: wajibkan user sudah login (JWT valid).
 * Token diambil dari header: Authorization: Bearer <token>
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return error(res, 'Invalid or expired token.', 401);
  }

  // Simpan user info ke request
  req.user = {
    id: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };

  next();
}

/**
 * Middleware: hanya role tertentu yang boleh akses.
 * @param  {...string} roles - Role yang diizinkan
 * @returns {import('express').RequestHandler}
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return error(res, 'Forbidden. Insufficient permissions.', 403);
    }
    next();
  };
}

module.exports = { authenticate, authorize };
