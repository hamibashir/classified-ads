import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type TokenVerificationError = 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'NO_TOKEN_PROVIDED';

export interface TokenVerificationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: TokenVerificationError;
  message?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
