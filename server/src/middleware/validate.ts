import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/apiResponse';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Express middleware for validating request body, query, or params with Zod schemas
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        req.query = parsedQuery as Request['query'];
      }
      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params);
        req.params = parsedParams as Request['params'];
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.') || 'root',
          message: issue.message,
        }));

        sendError(
          res,
          'VALIDATION_ERROR',
          'Invalid request payload.',
          details,
          400
        );
        return;
      }

      next(error);
    }
  };
};
