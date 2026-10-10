import { Request, Response, NextFunction } from 'express';

/**
 * Lightweight request logger middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    console.log(`[${timestamp}] ${method} ${url} ${status} - ${duration}ms`);
  });

  next();
};
