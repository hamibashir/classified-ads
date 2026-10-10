import Cookies from 'js-cookie';
import { AuthTokens } from '@/types/auth';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const ACCESS_TOKEN_STORAGE = 'classified_ads_token';
export const REFRESH_TOKEN_STORAGE = 'classified_ads_refresh_token';

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Retrieves the stored access token from cookies or localStorage
 */
export const getStoredAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 1. Try Cookie
  try {
    const cookieToken = Cookies.get(ACCESS_TOKEN_COOKIE);
    if (cookieToken) return cookieToken;
  } catch {
    // Cookie access may fail in restricted sandbox
  }

  // 2. Try LocalStorage fallback
  try {
    const localToken = localStorage.getItem(ACCESS_TOKEN_STORAGE);
    if (localToken) return localToken;
  } catch {
    // LocalStorage access may fail in private mode
  }

  return null;
};

/**
 * Retrieves the stored refresh token from cookies or localStorage
 */
export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cookieToken = Cookies.get(REFRESH_TOKEN_COOKIE);
    if (cookieToken) return cookieToken;
  } catch {
    // Ignore
  }

  try {
    const localToken = localStorage.getItem(REFRESH_TOKEN_STORAGE);
    if (localToken) return localToken;
  } catch {
    // Ignore
  }

  return null;
};

/**
 * Retrieves both stored tokens
 */
export const getStoredTokens = (): AuthTokens | null => {
  const accessToken = getStoredAccessToken();
  const refreshToken = getStoredRefreshToken();

  if (!accessToken) return null;

  return {
    accessToken,
    refreshToken: refreshToken || '',
  };
};

/**
 * Persists dual auth tokens in cookies and localStorage
 */
export const saveAuthTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;

  try {
    // Save cookies (7 days for access token, 30 days for refresh token)
    Cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, { ...COOKIE_OPTIONS, expires: 7 });
    if (tokens.refreshToken) {
      Cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, { ...COOKIE_OPTIONS, expires: 30 });
    }

    // Save in localStorage for immediate client reads
    localStorage.setItem(ACCESS_TOKEN_STORAGE, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE, tokens.refreshToken);
    }
  } catch {
    // Ignore storage errors
  }
};

/**
 * Clears all authentication credentials from cookies and localStorage
 */
export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return;

  try {
    Cookies.remove(ACCESS_TOKEN_COOKIE, { path: '/' });
    Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
    localStorage.removeItem(ACCESS_TOKEN_STORAGE);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE);
  } catch {
    // Ignore storage errors
  }
};
