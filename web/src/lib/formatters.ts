/**
 * Utility Formatters for Currency, Dates, and Relative Time in Pakistan
 */

/**
 * Formats numeric price into standard Pakistani Rupee representation (e.g. "Rs 45,000")
 */
export const formatPKR = (price: number | null | undefined): string => {
  if (price === 0) return 'Free';
  if (price === null || price === undefined || isNaN(price)) return 'Rs 0';

  const formatted = Math.round(price).toLocaleString('en-PK');
  return `Rs ${formatted}`;
};

/**
 * Formats large amounts into Pakistani Lakh / Crore notation
 */
export const formatCompactPKR = (price: number | null | undefined): string => {
  if (price === 0) return 'Free';
  if (!price || isNaN(price)) return 'Rs 0';

  const absPrice = Math.abs(price);
  if (absPrice >= 10000000) {
    const crore = parseFloat((price / 10000000).toFixed(2));
    return `Rs ${crore} Crore`;
  }
  if (absPrice >= 100000) {
    const lakh = parseFloat((price / 100000).toFixed(2));
    return `Rs ${lakh} Lakh`;
  }

  return formatPKR(price);
};

/**
 * Formats ISO date string into human-readable relative time (e.g. "2 hours ago", "Yesterday")
 */
export const formatRelativeTime = (
  dateInput: string | number | Date | null | undefined
): string => {
  if (!dateInput) return '';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks}w ago`;
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
