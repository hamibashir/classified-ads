import { Coordinates, PakistaniCity } from '@/types/location';
import { PAKISTANI_CITIES, DEFAULT_CITY } from '@/constants/cities';

/**
 * Calculates Great-Circle distance in kilometers between two GPS coordinates using Haversine formula
 */
export const calculateDistanceKm = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const EARTH_RADIUS_KM = 6371;

  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lon1Rad = (coord1.longitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const lon2Rad = (coord2.longitude * Math.PI) / 180;

  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

/**
 * Resolves the closest supported Pakistani city to the provided coordinates
 */
export const findClosestCity = (coords: Coordinates): PakistaniCity => {
  if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
    return DEFAULT_CITY;
  }

  let minDistance = Infinity;
  let closest: PakistaniCity = DEFAULT_CITY;

  for (const city of PAKISTANI_CITIES) {
    const dist = calculateDistanceKm(coords, city.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  return closest;
};

/**
 * Formats distance in km into user-friendly localized string
 */
export const formatDistance = (km: number | null | undefined): string => {
  if (km === null || km === undefined || isNaN(km)) return '';

  if (km < 1) {
    return '< 1 km away';
  }
  if (km < 10) {
    return `${km.toFixed(1)} km away`;
  }
  return `${Math.round(km)} km away`;
};
