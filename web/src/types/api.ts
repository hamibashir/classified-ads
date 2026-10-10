/**
 * Shared API Types & Envelopes for Classified Ads PK Web Client
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: ApiErrorDetail[] | unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  status?: string;
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
  error?: ApiErrorResponse;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  data: T[];
  pagination: PaginationMeta;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  token?: string | null;
  skipAuth?: boolean;
}
