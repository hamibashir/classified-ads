import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().optional(),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const googleAuthSchema = z.object({
  idToken: z.string().trim().min(1, 'Google ID token is required'),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
