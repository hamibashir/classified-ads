import {
  ApiResponse,
  ApiErrorResponse,
  RequestOptions,
} from '@/types/api';

/**
 * Structured API Error class providing HTTP status, platform code, and validation details
 */
export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: unknown;
  public raw?: unknown;

  constructor(
    status: number,
    message: string,
    code = 'API_ERROR',
    details?: unknown,
    raw?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.raw = raw;
  }
}

import {
  getStoredAccessToken,
  getStoredRefreshToken,
  saveAuthTokens,
  clearAuthTokens,
} from '@/lib/auth-storage';

/**
 * Global token storage with synchronized cookie and localStorage persistence
 */
let inMemoryToken: string | null = null;

export const getAuthToken = (): string | null => {
  if (inMemoryToken) return inMemoryToken;
  const stored = getStoredAccessToken();
  if (stored) {
    inMemoryToken = stored;
    return stored;
  }
  return null;
};

export const setAuthToken = (token: string | null): void => {
  inMemoryToken = token;
  if (token) {
    saveAuthTokens({
      accessToken: token,
      refreshToken: getStoredRefreshToken() || '',
    });
  } else {
    clearAuthTokens();
  }
};

export const clearAuthToken = (): void => {
  inMemoryToken = null;
  clearAuthTokens();
};

/**
 * Helper to build clean query strings from parameter dictionary
 */
export const buildQueryString = (
  params?: Record<string, string | number | boolean | undefined | null>
): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Resolves the backend API base URL
 */
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  return (envUrl || 'http://localhost:5000/api/v1').replace(/\/+$/, '');
};

/**
 * Core type-safe request function
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, body, token, skipAuth, headers = {}, ...customConfig } = options;

  // Build target URL
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const queryString = buildQueryString(params);
  const url = `${baseUrl}${cleanEndpoint}${queryString}`;

  // Configure headers
  const requestHeaders = new Headers(headers);

  // Auto-attach authorization token if available and not skipped
  if (!skipAuth) {
    const activeToken = token ?? getAuthToken();
    if (activeToken && !requestHeaders.has('Authorization')) {
      requestHeaders.set('Authorization', `Bearer ${activeToken}`);
    }
  }

  // Handle body format (JSON vs FormData)
  let requestBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      requestBody = body;
      // Fetch automatically sets multipart boundary when Content-Type is omitted
    } else {
      if (!requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
      requestBody = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: requestHeaders,
      body: requestBody,
    });

    const isJson = response.headers
      .get('content-type')
      ?.includes('application/json');

    const responseData = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorData: ApiErrorResponse | undefined = responseData?.error;
      const errorCode = errorData?.code || `HTTP_${response.status}`;
      const errorMessage =
        errorData?.message ||
        responseData?.message ||
        response.statusText ||
        'An unexpected API error occurred.';

      throw new ApiError(
        response.status,
        errorMessage,
        errorCode,
        errorData?.details,
        responseData
      );
    }

    return responseData as ApiResponse<T>;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }

    // Network, DNS, or parsing errors
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(0, message, 'NETWORK_ERROR');
  }
}

/**
 * Shorthand API client methods
 */
export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  getAuthToken,
  setAuthToken,
  clearAuthToken,
  buildQueryString,
  getApiBaseUrl,
};

export default apiClient;
