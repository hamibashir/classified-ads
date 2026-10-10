import Cookies from 'js-cookie';
import { Coordinates } from '@/types/location';

export const CITY_COOKIE_KEY = 'selected_city_id';
export const COORDS_COOKIE_KEY = 'user_coords';

export const CITY_STORAGE_KEY = 'classified_ads_city_id';
export const COORDS_STORAGE_KEY = 'classified_ads_coords';

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Retrieves the stored city ID from cookies or localStorage
 */
export const getStoredCityId = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cookieVal = Cookies.get(CITY_COOKIE_KEY);
    if (cookieVal) return cookieVal;
  } catch {
    // Ignore
  }

  try {
    const localVal = localStorage.getItem(CITY_STORAGE_KEY);
    if (localVal) return localVal;
  } catch {
    // Ignore
  }

  return null;
};

/**
 * Persists the selected city ID in cookies and localStorage
 */
export const saveStoredCityId = (cityId: string): void => {
  if (typeof window === 'undefined') return;

  try {
    Cookies.set(CITY_COOKIE_KEY, cityId, { ...COOKIE_OPTIONS, expires: 365 });
    localStorage.setItem(CITY_STORAGE_KEY, cityId);
  } catch {
    // Ignore
  }
};

/**
 * Retrieves stored GPS coordinates from cookies or localStorage
 */
export const getStoredCoordinates = (): Coordinates | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cookieVal = Cookies.get(COORDS_COOKIE_KEY);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  try {
    const localVal = localStorage.getItem(COORDS_STORAGE_KEY);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return null;
};

/**
 * Persists or clears stored GPS coordinates
 */
export const saveStoredCoordinates = (coords: Coordinates | null): void => {
  if (typeof window === 'undefined') return;

  try {
    if (coords) {
      const val = JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      });
      Cookies.set(COORDS_COOKIE_KEY, val, { ...COOKIE_OPTIONS, expires: 1 });
      localStorage.setItem(COORDS_STORAGE_KEY, val);
    } else {
      Cookies.remove(COORDS_COOKIE_KEY, { path: '/' });
      localStorage.removeItem(COORDS_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
};

/**
 * Clears stored location data
 */
export const clearStoredLocation = (): void => {
  if (typeof window === 'undefined') return;

  try {
    Cookies.remove(CITY_COOKIE_KEY, { path: '/' });
    Cookies.remove(COORDS_COOKIE_KEY, { path: '/' });
    localStorage.removeItem(CITY_STORAGE_KEY);
    localStorage.removeItem(COORDS_STORAGE_KEY);
  } catch {
    // Ignore
  }
};
