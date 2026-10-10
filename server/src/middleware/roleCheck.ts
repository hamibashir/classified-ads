import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { sendError } from '../utils/apiResponse';

/**
 * Middleware Factory: Enforces user has one of the required roles
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(
        res,
        'UNAUTHORIZED',
        'Authentication required. Please log in.',
        undefined,
        401
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        'FORBIDDEN',
        'Access forbidden: insufficient permissions.',
        undefined,
        403
      );
      return;
    }

    next();
  };
};

/**
 * Convenience Middleware: Requires ADMIN role
 */
export const requireAdmin = requireRole(Role.ADMIN);
