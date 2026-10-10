import jwt, { SignOptions, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { TokenPayload, AuthTokens, TokenVerificationResult } from '../types/auth';

const getAccessSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_ACCESS_SECRET must be configured in production.');
  }
  return secret || 'super-secret-access-key-change-in-production';
};

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_REFRESH_SECRET must be configured in production.');
  }
  return secret || 'super-secret-refresh-key-change-in-production';
};

/**
 * Generate short-lived Access Token (15m default)
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = getAccessSecret();
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
    algorithm: 'HS256',
  };
  return jwt.sign(payload, secret, options);
};

/**
 * Generate long-lived Refresh Token (7d default)
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = getRefreshSecret();
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
    algorithm: 'HS256',
  };
  return jwt.sign(payload, secret, options);
};

/**
 * Generate both Access and Refresh tokens
 */
export const generateAuthTokens = (payload: TokenPayload): AuthTokens => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify Access Token and parse payload or return error code
 */
export const verifyAccessToken = (token: string): TokenVerificationResult => {
  if (!token) {
    return {
      valid: false,
      error: 'NO_TOKEN_PROVIDED',
      message: 'No authorization token was provided.',
    };
  }

  try {
    const decoded = jwt.verify(token, getAccessSecret(), { algorithms: ['HS256'] });
    const payload = decoded as TokenPayload;
    return {
      valid: true,
      payload,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        valid: false,
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired. Please refresh your session.',
      };
    }
    if (error instanceof JsonWebTokenError) {
      return {
        valid: false,
        error: 'TOKEN_INVALID',
        message: 'Invalid or malformed token.',
      };
    }
    const message = error instanceof Error ? error.message : 'Token verification failed.';
    return {
      valid: false,
      error: 'TOKEN_INVALID',
      message,
    };
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): TokenVerificationResult => {
  if (!token) {
    return {
      valid: false,
      error: 'NO_TOKEN_PROVIDED',
      message: 'No refresh token was provided.',
    };
  }

  try {
    const decoded = jwt.verify(token, getRefreshSecret(), { algorithms: ['HS256'] });
    const payload = decoded as TokenPayload;
    return {
      valid: true,
      payload,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return {
        valid: false,
        error: 'TOKEN_EXPIRED',
        message: 'Refresh token has expired. Please log in again.',
      };
    }
    if (error instanceof JsonWebTokenError) {
      return {
        valid: false,
        error: 'TOKEN_INVALID',
        message: 'Invalid or malformed refresh token.',
      };
    }
    const message = error instanceof Error ? error.message : 'Refresh token verification failed.';
    return {
      valid: false,
      error: 'TOKEN_INVALID',
      message,
    };
  }
};
