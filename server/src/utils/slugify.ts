import crypto from 'crypto';

/**
 * Converts a raw text string into a clean, URL-friendly lowercase slug
 */
export const slugify = (text: string): string => {
  if (!text) return '';

  return text
    .normalize('NFKD') // Separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // Strip diacritic marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '') // Trim leading and trailing hyphens
    .replace(/-{2,}/g, '-'); // Collapse multiple hyphens
};

/**
 * Generates a short, collision-resistant random alphanumeric suffix
 */
export const generateRandomSuffix = (length = 6): string => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};

/**
 * Generates a unique, URL-friendly ad slug formatted as:
 * <base-title-slug>-<random-suffix> (e.g. toyota-corolla-gl-2022-x8k2a9)
 * Ensures final slug fits safely within MySQL VARCHAR(255) column limit.
 */
export const generateAdSlug = (title: string, customSuffix?: string): string => {
  const baseSlug = slugify(title);
  const suffix = (customSuffix || generateRandomSuffix(6)).toLowerCase();

  // If title had no Latin alphanumeric characters (e.g. pure Urdu or symbols), fallback to 'ad'
  const prefix = baseSlug.length > 0 ? baseSlug : 'ad';

  // Ensure total length <= 255 characters (suffix is ~5 chars including hyphen)
  const maxPrefixLength = 255 - (suffix.length + 1);
  const safePrefix = prefix.slice(0, maxPrefixLength).replace(/-+$/, '');

  return `${safePrefix}-${suffix}`;
};
