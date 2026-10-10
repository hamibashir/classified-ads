import { z } from 'zod';

export const updateSettingsSchema = z
  .object({
    settings: z.record(z.string(), z.any()).optional(),
  })
  .passthrough();

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

/**
 * Report status enum
 */
export const reportStatusEnum = z.enum(['PENDING', 'RESOLVED', 'DISMISSED']);
export type ReportStatus = z.infer<typeof reportStatusEnum>;

/**
 * Schema for moderating an ad (Approve or Reject)
 */
export const moderateAdSchema = z
  .object({
    action: z.enum(['APPROVE', 'REJECT']),
    rejectionReason: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) => data.action !== 'REJECT' || (data.rejectionReason && data.rejectionReason.length > 0),
    {
      message: 'Rejection reason is required when rejecting an ad',
      path: ['rejectionReason'],
    }
  );

export type ModerateAdInput = z.infer<typeof moderateAdSchema>;

/**
 * Schema for updating report status
 */
export const updateReportStatusSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED']),
  takeDownAd: z.boolean().optional(),
});

export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;

/**
 * Schema for querying pending ads queue
 */
export const pendingAdsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type PendingAdsQueryParams = z.infer<typeof pendingAdsQuerySchema>;

/**
 * Schema for querying reports queue
 */
export const reportsQuerySchema = z.object({
  status: reportStatusEnum.optional().default('PENDING'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ReportsQueryParams = z.infer<typeof reportsQuerySchema>;

/**
 * Schema for querying admin users list
 */
export const adminUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isBanned: z.enum(['true', 'false']).optional(),
  isPhoneVerified: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type AdminUsersQueryParams = z.infer<typeof adminUsersQuerySchema>;

/**
 * Schema for banning or unbanning a user
 */
export const banUserSchema = z.object({
  isBanned: z.boolean(),
  reason: z.string().trim().max(500).optional(),
});

export type BanUserInput = z.infer<typeof banUserSchema>;

/**
 * Schema for toggling user verification status
 */
export const verifyUserSchema = z.object({
  isPhoneVerified: z.boolean(),
});

export type VerifyUserInput = z.infer<typeof verifyUserSchema>;

/**
 * Schema for validating user ID URL parameter
 */
export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;

