import { z } from 'zod';
import { AdCondition } from '@/types/ad';

export const adConditionEnum = z.enum(['NEW', 'LIKE_NEW', 'USED_GOOD', 'USED_FAIR']);

/**
 * Step 1: Category & Subcategory Selection Validation Schema
 */
export const postAdStep1Schema = z.object({
  categoryId: z.string().trim().min(1, 'Please select a parent category'),
  subcategoryId: z.string().trim().min(1, 'Please select a subcategory'),
});

export type PostAdStep1Input = z.infer<typeof postAdStep1Schema>;

/**
 * Step 2: Basic Info (Title, Description, Condition, PKR Price, Negotiable)
 */
export const postAdStep2Schema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5,000 characters'),
  price: z.coerce
    .number()
    .min(0, 'Price cannot be negative')
    .max(1000000000, 'Price cannot exceed 1 Billion PKR'),
  currency: z.string().trim().default('PKR'),
  isNegotiable: z.boolean().default(false),
  condition: adConditionEnum.default('USED_GOOD'),
});

export type PostAdStep2Input = z.infer<typeof postAdStep2Schema>;

/**
 * Combined Schema for Steps 1 & 2
 */
export const postAdBasicSchema = postAdStep1Schema.merge(postAdStep2Schema);
export type PostAdBasicInput = z.infer<typeof postAdBasicSchema>;

export type ValidPostAdCondition = z.infer<typeof adConditionEnum>;

/**
 * Human-readable condition helpers
 */
export const CONDITION_OPTIONS: {
  value: ValidPostAdCondition;
  label: string;
  badge: string;
  description: string;
}[] = [
  {
    value: 'NEW',
    label: 'Brand New',
    badge: '100% Sealed',
    description: 'Unopened, sealed in original box or packaging, never used.',
  },
  {
    value: 'LIKE_NEW',
    label: 'Like New',
    badge: 'Flawless',
    description: 'Barely used, zero scratches or cosmetic wear, looks like brand new.',
  },
  {
    value: 'USED_GOOD',
    label: 'Used (Good)',
    badge: 'Standard',
    description: 'Normal signs of gentle use, fully working and well maintained.',
  },
  {
    value: 'USED_FAIR',
    label: 'Used (Fair)',
    badge: 'Visible Wear',
    description: 'Shows noticeable cosmetic wear or scratches, but fully functional.',
  },
];

export const getConditionLabel = (cond: AdCondition): string => {
  const opt = CONDITION_OPTIONS.find((c) => c.value === cond);
  return opt ? opt.label : 'Used';
};

/**
 * Image Upload Constraints
 */
export const MAX_AD_IMAGES = 8;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface AdImageItem {
  url: string;
  order: number;
  publicId?: string | null;
}

/**
 * Step 3: Photos Validation Schema
 */
export const postAdStep3Schema = z.object({
  images: z
    .array(
      z.object({
        url: z.string().min(1, 'Image URL cannot be empty'),
        order: z.number().int().min(0),
        publicId: z.string().optional().nullable(),
      })
    )
    .min(1, 'Please add at least 1 photo of your item')
    .max(MAX_AD_IMAGES, `Maximum ${MAX_AD_IMAGES} photos allowed per ad`),
});

export type PostAdStep3Input = z.infer<typeof postAdStep3Schema>;

/**
 * Reorders an array of images and normalizes their order indices.
 */
export function reorderImages(
  images: AdImageItem[],
  fromIndex: number,
  toIndex: number
): AdImageItem[] {
  if (
    fromIndex < 0 ||
    fromIndex >= images.length ||
    toIndex < 0 ||
    toIndex >= images.length ||
    fromIndex === toIndex
  ) {
    return images;
  }
  const result = [...images];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result.map((img, idx) => ({ ...img, order: idx }));
}

/**
 * Sets the image at the given index as the primary cover photo (order: 0).
 */
export function setCoverImage(images: AdImageItem[], index: number): AdImageItem[] {
  return reorderImages(images, index, 0);
}

/**
 * Pakistani City to Province Mapping
 */
export const CITY_PROVINCE_MAP: Record<string, string> = {
  karachi: 'Sindh',
  lahore: 'Punjab',
  islamabad: 'Islamabad Capital Territory',
  rawalpindi: 'Punjab',
  faisalabad: 'Punjab',
  multan: 'Punjab',
  peshawar: 'Khyber Pakhtunkhwa',
  quetta: 'Balochistan',
  gujranwala: 'Punjab',
  hyderabad: 'Sindh',
  sialkot: 'Punjab',
  bahawalpur: 'Punjab',
  sargodha: 'Punjab',
};

export const getProvinceForCity = (cityName: string): string => {
  const normalized = cityName.trim().toLowerCase();
  return CITY_PROVINCE_MAP[normalized] || 'Punjab';
};

/**
 * Step 4: Location & Contact Preferences Validation Schema
 */
export const postAdStep4Schema = z.object({
  locationCity: z
    .string()
    .trim()
    .min(2, 'City is required')
    .max(100, 'City name cannot exceed 100 characters'),
  locationState: z
    .string()
    .trim()
    .max(100, 'Province/State cannot exceed 100 characters')
    .default('Punjab'),
  locationAddress: z
    .string()
    .trim()
    .max(255, 'Neighborhood/Area cannot exceed 255 characters')
    .optional()
    .default(''),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  sellerPhone: z
    .string()
    .trim()
    .optional(),
  showPhone: z.boolean().default(true),
  allowWhatsapp: z.boolean().default(true),
});

export type PostAdStep4Input = z.infer<typeof postAdStep4Schema>;

/**
 * Step 5 / Final Submission Validation Schema
 * Matches server schema for POST /api/v1/ads
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
    .array(
      z.union([
        z.string().min(1, 'Image URL cannot be empty'),
        z.object({
          url: z.string().min(1, 'Image URL cannot be empty'),
          publicId: z.string().optional().nullable(),
          order: z.number().int().min(0).optional(),
        }),
      ])
    )
    .max(8, 'Maximum 8 images allowed per ad')
    .optional()
    .default([]),
});

export type CreateAdInput = z.infer<typeof createAdSchema>;
export const updateAdSchema = createAdSchema.partial();
export type UpdateAdInput = z.infer<typeof updateAdSchema>;
