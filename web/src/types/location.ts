/**
 * Geolocation and Pakistani Cities Type Definitions
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PakistaniCity {
  id: string;
  name: string;
  province: string;
  coordinates: Coordinates;
  isPopular: boolean;
}

export type GeolocationPermission = 'prompt' | 'granted' | 'denied' | 'unavailable';

export interface GeolocationState {
  coordinates: Coordinates | null;
  selectedCity: PakistaniCity;
  isGpsActive: boolean;
  permissionStatus: GeolocationPermission;
  isLoading: boolean;
  error: string | null;
}

export interface GeolocationContextType extends GeolocationState {
  requestCurrentLocation: () => Promise<Coordinates | null>;
  selectCity: (cityIdOrName: string) => void;
  resetToDefaultLocation: () => void;
  calculateDistanceTo: (target: Coordinates) => number | null;
  formatDistanceTo: (target: Coordinates) => string | null;
}
