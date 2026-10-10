import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  status?: string;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Standardized success response envelope
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  extra: Record<string, unknown> = {}
): Response => {
  return res.status(statusCode).json({
    success: true,
    ...extra,
    ...(data !== undefined && { data }),
    ...(message && { message })
  });
};

/**
 * Standardized error response envelope
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  details?: unknown,
  statusCode = 500
): Response => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details })
    }
  });
};
