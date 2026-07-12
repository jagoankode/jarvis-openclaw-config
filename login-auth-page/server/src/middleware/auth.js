import { verifyToken } from '../utils/jwt.js';
import { error } from '../utils/response.js';

/**
 * Authentication middleware.
 * Verifies Bearer token from Authorization header.
 * On success, attaches decoded user payload to `req.user`.
 * On failure, returns 401 response.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return error(res, 'Invalid or expired token.', 401);
  }

  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  };

  next();
}

export default { authenticate };
