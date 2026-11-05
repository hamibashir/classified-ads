import { z } from 'zod';

export const adConditionEnum = z.enum(['NEW', 'LIKE_NEW', 'USED_GOOD', 'USED_FAIR']);
export const adStatusEnum = z.enum(['PENDING', 'ACTIVE', 'REJECTED', 'SOLD', 'EXPIRED']);

export const adImageItemSchema = z.union([
  z.string().min(1, 'Image URL cannot be empty'),
  z.object({
    url: z.string().min(1, 'Image URL cannot be empty'),
    publicId: z.string().optional().nullable(),
    order: z.number().int().min(0).optional(),
  }),
]);

/**
 * Validation schema for creating a new ad
 */
export const createAdSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description cannot exceed 10,000 characters'),
  categoryId: z.string().uuid('Invalid category ID format'),
  price: z.coerce
    .number()
    .min(0, 'Price cannot be negative'),
  currency: z.string().trim().default('PKR'),
  isNegotiable: z.boolean().optional().default(false),
  condition: adConditionEnum.optional().default('USED_GOOD'),
  locationCity: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City cannot exceed 100 characters'),
  locationState: z.string().trim().max(100).optional().default('Punjab'),
  locationAddress: z.string().trim().max(255).optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  showPhone: z.boolean().optional().default(true),
  allowWhatsapp: z.boolean().optional().default(true),
  images: z
    .array(adImageItemSchema)
    .max(8, 'Maximum 8 images allowed per ad')
    .optional()
    .default([]),
});

export type CreateAdInput = z.infer<typeof createAdSchema>;

/**
 * Validation schema for updating an existing ad
 */
export const updateAdSchema = createAdSchema.partial();
export type UpdateAdInput = z.infer<typeof updateAdSchema>;

/**
 * Validation schema for updating ad status (e.g. marking as SOLD or ACTIVE)
 */
export const adStatusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'SOLD'], {
    message: 'Status must be either ACTIVE or SOLD',
  }),
});

export type AdStatusUpdateInput = z.infer<typeof adStatusUpdateSchema>;

/**
 * Validation schema for ad feed and search filters
 */
export const adFilterQuerySchema = z.object({
  search: z.string().trim().optional(),
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  subcat: z.string().trim().optional(),
  categoryId: z.string().optional(),
  city: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  condition: adConditionEnum.optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().optional().default(50),
  sortBy: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'views']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type AdFilterQueryParams = z.infer<typeof adFilterQuerySchema>;

/**
 * Validation schema for ad ID URL parameter
 */
export const adIdParamSchema = z.object({
  id: z.string().uuid('Invalid ad ID format'),
});
export type AdIdParam = z.infer<typeof adIdParamSchema>;

/**
 * Validation schema for seller's own ads query
 */
export const myAdsQuerySchema = z.object({
  status: adStatusEnum.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type MyAdsQueryParams = z.infer<typeof myAdsQuerySchema>;

/**
 * Report reason enum and validation schema for reporting an ad
 */
export const reportReasonEnum = z.enum([
  'SPAM',
  'FRAUD',
  'INAPPROPRIATE',
  'DUPLICATE',
  'PROHIBITED_ITEM',
  'OTHER',
]);
export type ReportReason = z.infer<typeof reportReasonEnum>;

export const createReportSchema = z.object({
  reason: reportReasonEnum,
  details: z.string().trim().max(1000, 'Details cannot exceed 1000 characters').optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

/**
 * Validation schema for user's favorite ads query
 */
export const favoritesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type FavoritesQueryParams = z.infer<typeof favoritesQuerySchema>;

