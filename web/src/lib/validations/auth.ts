import { z } from 'zod';

/**
 * Normalizes a Pakistani phone number string (removing spaces, dashes, parentheses).
 */
export const normalizePakistaniPhone = (phone?: string | null): string | undefined => {
  if (!phone) return undefined;
  const cleaned = phone.replace(/[\s-()]/g, '');
  if (!cleaned) return undefined;
  return cleaned;
};

/**
 * Validates a cleaned phone number against standard Pakistani mobile networks (03XX XXXXXXX or +923XX XXXXXXX).
 */
export const isValidPakistaniMobile = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s-()]/g, '');
  return /^(?:\+92|0)?3[0-9]{9}$/.test(cleaned);
};

/**
 * Client-side Zod Schema for User Login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Client-side Zod Schema for User Registration
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address')
      .toLowerCase(),
    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => {
          if (!val || val.trim() === '') return true;
          return isValidPakistaniMobile(val);
        },
        {
          message: 'Enter a valid Pakistani mobile number (e.g. 0300 1234567 or +92 300 1234567)',
        }
      ),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the terms & conditions to create an account',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Sanitizes redirect URLs to guard against Open Redirect attacks.
 * Only allows relative paths starting with a single '/' and disallows protocol-relative or backslash paths.
 */
export const getSafeRedirectUrl = (url: string | null | undefined): string => {
  if (!url) return '/';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\') &&
    !trimmed.includes(':')
  ) {
    return trimmed;
  }
  return '/';
};
