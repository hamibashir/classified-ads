import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';
import {
  AdminUsersQueryParams,
  BanUserInput,
  VerifyUserInput,
} from '../schemas/adminSchemas';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Get paginated users for admin management table
 * GET /api/v1/admin/users
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as unknown as AdminUsersQueryParams;
    const {
      search,
      role,
      isBanned,
      isPhoneVerified,
      page = 1,
      limit = 20,
    } = query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const where: Prisma.UserWhereInput = {};

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Filter by ban status
    if (isBanned !== undefined) {
      where.isBanned = isBanned === 'true';
    }

    // Filter by phone verification status
    if (isPhoneVerified !== undefined) {
      where.isPhoneVerified = isPhoneVerified === 'true';
    }

    // Search by name, email, or phone
    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
          isPhoneVerified: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              ads: true,
              reportsFiled: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };

    sendSuccess(
      res,
      { users, pagination },
      'Users retrieved successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update user ban status
 * PATCH /api/v1/admin/users/:id/ban
 */
export const updateUserBanStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBanned, reason }: BanUserInput = req.body;

    // 1. Prevent admin from banning themselves
    if (req.user?.userId === id) {
      sendError(
        res,
        'BAD_REQUEST',
        'You cannot ban your own administrator account.',
        undefined,
        400
      );
      return;
    }

    // 2. Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      sendError(res, 'USER_NOT_FOUND', 'User account not found.', undefined, 404);
      return;
    }

    // 3. Update ban status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBanned },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isPhoneVerified: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ads: true,
            reportsFiled: true,
          },
        },
      },
    });

    sendSuccess(
      res,
      {
        user: updatedUser,
        banReason: reason || null,
      },
      isBanned
        ? `User "${updatedUser.name}" has been suspended.`
        : `User "${updatedUser.name}" suspension has been lifted.`,
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user phone verification status
 * PATCH /api/v1/admin/users/:id/verify
 */
export const updateUserVerificationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPhoneVerified }: VerifyUserInput = req.body;

    // 1. Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      sendError(res, 'USER_NOT_FOUND', 'User account not found.', undefined, 404);
      return;
    }

    // 2. Update verification status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isPhoneVerified },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isPhoneVerified: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ads: true,
            reportsFiled: true,
          },
        },
      },
    });

    sendSuccess(
      res,
      { user: updatedUser },
      isPhoneVerified
        ? `User "${updatedUser.name}" marked as verified.`
        : `User "${updatedUser.name}" verification removed.`,
      200
    );
  } catch (error) {
    next(error);
  }
};
