/**
 * Utility functions for Pakistani phone number normalization and WhatsApp deep links
 */

/**
 * Normalizes a Pakistani phone number to WhatsApp international standard format (e.g. 923001234567)
 * Handles:
 * - Local prefix: 03001234567 -> 923001234567
 * - International prefix: +923001234567 -> 923001234567
 * - Double zero prefix: 00923001234567 -> 923001234567
 * - 10-digit format without leading zero: 3001234567 -> 923001234567
 * - Strips formatting dashes, spaces, brackets
 */
export const normalizePakistaniPhone = (phone: string): string => {
  if (!phone) return '';

  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0092')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = '92' + digits.slice(1);
  } else if (digits.length === 10 && digits.startsWith('3')) {
    digits = '92' + digits;
  }

  return digits;
};

/**
 * Formats a raw Pakistani phone number for human-friendly display
 * e.g. 03001234567 -> 0300 1234567
 */
export const formatDisplayPhone = (phone: string): string => {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11 && clean.startsWith('0')) {
    return `${clean.slice(0, 4)} ${clean.slice(4)}`;
  }
  if (clean.length === 12 && clean.startsWith('92')) {
    return `0${clean.slice(2, 5)} ${clean.slice(5)}`;
  }
  return phone;
};

/**
 * Generates courteous default greeting message for buyer inquiries
 */
export const formatAdWhatsAppMessage = (
  adTitle: string,
  adSlug?: string,
  siteUrl?: string
): string => {
  const cleanTitle = adTitle.trim();
  let message = `Assalam-o-Alaikum, I saw your ad "${cleanTitle}" on Zaaz B. Is it still available?`;

  if (adSlug && siteUrl) {
    const cleanUrl = siteUrl.replace(/\/+$/, '');
    message += ` Link: ${cleanUrl}/ads/${adSlug}`;
  }

  return message;
};

/**
 * Builds direct WhatsApp click URL (https://wa.me/<phone>?text=...)
 */
export const buildWhatsAppUrl = (phone: string, message?: string): string => {
  const normalized = normalizePakistaniPhone(phone);
  if (!normalized) return '';

  if (message && message.trim()) {
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message.trim())}`;
  }

  return `https://wa.me/${normalized}`;
};
