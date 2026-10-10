import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  icon: z.string().trim().max(50).optional(),
  order: z.number().int().min(0).optional(),
  parentId: z.string().uuid('Invalid parent category ID format').nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  icon: z.string().trim().max(50).nullable().optional(),
  order: z.number().int().min(0).optional(),
  parentId: z.string().uuid('Invalid parent category ID format').nullable().optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
