import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Factory for creating custom rate limiters with platform standard error response
 */
export const createRateLimiter = (options: Partial<Options> = {}) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes default
    limit: 30, // 30 requests per window default
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      sendError(
        res,
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please try again later.',
        undefined,
        429
      );
    },
    ...options,
  });
};

/**
 * Dedicated rate limiter for click-to-reveal phone numbers to block scrapers
 * Limit: 30 requests per 15 minutes per IP (5 requests in test environment)
 */
export const revealPhoneLimiter = createRateLimiter({
  windowMs: process.env.NODE_ENV === 'test' ? 60 * 1000 : 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'test' ? 5 : 30,
  message: undefined,
  handler: (_req: Request, res: Response) => {
    sendError(
      res,
      'RATE_LIMIT_EXCEEDED',
      'Too many phone reveal requests. Please try again later.',
      undefined,
      429
    );
  },
});
