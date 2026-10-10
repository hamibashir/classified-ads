import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/db';
import { RegisterInput, LoginInput, RefreshTokenInput, GoogleAuthInput } from '../schemas/authSchemas';
import { generateAuthTokens, generateAccessToken, verifyRefreshToken } from '../utils/jwt';
import { verifyGoogleIdToken } from '../utils/googleAuth';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone }: RegisterInput = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      sendError(
        res,
        'EMAIL_ALREADY_EXISTS',
        'An account with this email address already exists.',
        undefined,
        409
      );
      return;
    }

    // 2. Hash password with bcrypt (min 10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create user record in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        phone: phone || null,
        role: Role.USER,
        isPhoneVerified: false,
        isBanned: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isPhoneVerified: true,
        createdAt: true,
      },
    });

    // 4. Generate Access and Refresh tokens
    const tokens = generateAuthTokens({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // 5. Send standard 201 Created response
    sendSuccess(
      res,
      {
        user: newUser,
        tokens,
      },
      'User registered successfully.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 * POST /api/v1/auth/login
 */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 2. Validate user exists and has a passwordHash (not OAuth only)
    if (!user || !user.passwordHash) {
      sendError(
        res,
        'INVALID_CREDENTIALS',
        'Invalid email or password.',
        undefined,
        401
      );
      return;
    }

    // 3. Verify password via bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      sendError(
        res,
        'INVALID_CREDENTIALS',
        'Invalid email or password.',
        undefined,
        401
      );
      return;
    }

    // 4. Check if account is suspended / banned
    if (user.isBanned) {
      sendError(
        res,
        'USER_BANNED',
        'Your account has been suspended. Please contact support.',
        undefined,
        403
      );
      return;
    }

    // 5. Generate dual JWT tokens
    const tokens = generateAuthTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 6. Return sanitized user profile (excluding passwordHash)
    const { passwordHash: _, ...sanitizedUser } = user;

    sendSuccess(
      res,
      {
        user: sanitizedUser,
        tokens,
      },
      'Login successful.',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      sendError(
        res,
        'UNAUTHORIZED',
        'Authentication required.',
        undefined,
        401
      );
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      sendError(
        res,
        'USER_NOT_FOUND',
        'User account not found.',
        undefined,
        404
      );
      return;
    }

    if (user.isBanned) {
      sendError(
        res,
        'USER_BANNED',
        'Your account has been suspended. Please contact support.',
        undefined,
        403
      );
      return;
    }

    const { passwordHash: _, ...sanitizedUser } = user;

    sendSuccess(
      res,
      { user: sanitizedUser },
      'User profile retrieved successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using a valid refresh token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract refresh token from body or cookies
    let token = req.body?.refreshToken;

    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      for (const cookie of cookies) {
        const [name, ...rest] = cookie.trim().split('=');
        if (name === 'refreshToken') {
          const val = rest.join('=');
          if (val) token = decodeURIComponent(val.trim());
          break;
        }
      }
    }

    if (!token) {
      sendError(
        res,
        'NO_REFRESH_TOKEN',
        'Refresh token is required.',
        undefined,
        401
      );
      return;
    }

    // 2. Verify refresh token cryptographic validity
    const result = verifyRefreshToken(token);
    if (!result.valid || !result.payload) {
      sendError(
        res,
        result.error || 'INVALID_TOKEN',
        result.message || 'Invalid or expired refresh token.',
        undefined,
        401
      );
      return;
    }

    // 3. Confirm user still exists and is not banned
    const user = await prisma.user.findUnique({
      where: { id: result.payload.userId },
    });

    if (!user) {
      sendError(
        res,
        'USER_NOT_FOUND',
        'User account not found.',
        undefined,
        401
      );
      return;
    }

    if (user.isBanned) {
      sendError(
        res,
        'USER_BANNED',
        'Your account has been suspended. Please contact support.',
        undefined,
        403
      );
      return;
    }

    // 4. Issue new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    sendSuccess(
      res,
      { accessToken: newAccessToken },
      'Access token refreshed successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Sign in or register using Google OAuth ID token
 * POST /api/v1/auth/google
 */
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken }: GoogleAuthInput = req.body;

    // 1. Verify Google ID token
    const googlePayload = await verifyGoogleIdToken(idToken);
    if (!googlePayload || !googlePayload.email) {
      sendError(
        res,
        'INVALID_GOOGLE_TOKEN',
        'Invalid or expired Google authentication token.',
        undefined,
        401
      );
      return;
    }

    if (!googlePayload.emailVerified) {
      sendError(
        res,
        'EMAIL_NOT_VERIFIED',
        'Your Google account email is not verified.',
        undefined,
        400
      );
      return;
    }

    const normalizedEmail = googlePayload.email.trim().toLowerCase();

    // 2. Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let isNewUser = false;

    if (user) {
      // 3. Reject banned users
      if (user.isBanned) {
        sendError(
          res,
          'USER_BANNED',
          'Your account has been suspended. Please contact support.',
          undefined,
          403
        );
        return;
      }

      // Update avatarUrl if not present
      if (!user.avatarUrl && googlePayload.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: googlePayload.avatarUrl },
        });
      }
    } else {
      // 4. Auto-provision new user account
      user = await prisma.user.create({
        data: {
          name: googlePayload.name,
          email: normalizedEmail,
          passwordHash: null,
          avatarUrl: googlePayload.avatarUrl || null,
          role: Role.USER,
          isPhoneVerified: false,
          isBanned: false,
        },
      });
      isNewUser = true;
    }

    // 5. Generate dual JWT tokens
    const tokens = generateAuthTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 6. Return sanitized user profile (excluding passwordHash)
    const { passwordHash: _, ...sanitizedUser } = user;

    sendSuccess(
      res,
      {
        user: sanitizedUser,
        tokens,
      },
      isNewUser ? 'User registered and authenticated via Google.' : 'Login successful via Google.',
      isNewUser ? 201 : 200
    );
  } catch (error) {
    next(error);
  }
};


