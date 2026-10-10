import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { sendError } from '../utils/apiResponse';
import { handleMulterError } from './upload';

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(
    res,
    'ROUTE_NOT_FOUND',
    `Endpoint not found: ${req.method} ${req.originalUrl}`,
    undefined,
    404
  );
};

/**
 * Centralized Global Error Handler Middleware
 */
export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof multer.MulterError || (err as any).name === 'MulterFilterError') {
    handleMulterError(err, res);
    return;
  }

  console.error('[Unhandled Error]', err);

  const statusCode = (err as { status?: number; statusCode?: number }).statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message || 'An unexpected error occurred';

  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    message,
    process.env.NODE_ENV !== 'production' ? { stack: err.stack } : undefined,
    statusCode
  );
};
