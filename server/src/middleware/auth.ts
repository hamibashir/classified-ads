import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';

/**
 * Extracts JWT token from Authorization header or HTTP cookies
 */
export const extractTokenFromRequest = (req: Request): string | null => {
  // 1. Check Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && /^Bearer\s+/i.test(authHeader)) {
    const parts = authHeader.split(/\s+/);
    if (parts.length === 2 && parts[1]) {
      return parts[1].trim();
    }
  }

  // 2. Check Cookie header for accessToken=<token>
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.trim().split('=');
      if (name === 'accessToken') {
        const val = rest.join('=');
        if (val) return decodeURIComponent(val.trim());
      }
    }
  }

  return null;
};

/**
 * Middleware: Requires a valid Access Token
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    sendError(
      res,
      'UNAUTHORIZED',
      'Authentication token required. Please log in.',
      undefined,
      401
    );
    return;
  }

  const result = verifyAccessToken(token);

  if (!result.valid || !result.payload) {
    sendError(
      res,
      result.error || 'INVALID_TOKEN',
      result.message || 'Invalid or expired authentication token.',
      undefined,
      401
    );
    return;
  }

  req.user = result.payload;
  next();
};

/**
 * Middleware: Optional Authentication (attaches user if valid token present, allows guest otherwise)
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractTokenFromRequest(req);

  if (token) {
    const result = verifyAccessToken(token);
    if (result.valid && result.payload) {
      req.user = result.payload;
    }
  }

  next();
};
