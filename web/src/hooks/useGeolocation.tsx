'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  Coordinates,
  PakistaniCity,
  GeolocationPermission,
  GeolocationContextType,
} from '@/types/location';
import { DEFAULT_CITY, findCityByIdOrName } from '@/constants/cities';
import {
  calculateDistanceKm,
  findClosestCity,
  formatDistance,
} from '@/lib/geo-utils';
import {
  getStoredCityId,
  saveStoredCityId,
  getStoredCoordinates,
  saveStoredCoordinates,
} from '@/lib/location-storage';

const GeolocationContext = createContext<GeolocationContextType | undefined>(
  undefined
);

interface GeolocationProviderProps {
  children: ReactNode;
}

export const GeolocationProvider: React.FC<GeolocationProviderProps> = ({
  children,
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [selectedCity, setSelectedCity] = useState<PakistaniCity>(DEFAULT_CITY);
  const [permissionStatus, setPermissionStatus] =
    useState<GeolocationPermission>('prompt');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Bootstrap initial location from cookies or localStorage
  useEffect(() => {
    const bootstrapLocation = () => {
      try {
        const storedCityId = getStoredCityId();
        if (storedCityId) {
          const matchedCity = findCityByIdOrName(storedCityId);
          setSelectedCity(matchedCity);
        }

        const storedCoords = getStoredCoordinates();
        if (storedCoords) {
          setCoordinates(storedCoords);
        }

        // Query browser permission status if supported
        if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
          navigator.permissions
            .query({ name: 'geolocation' as PermissionName })
            .then((result) => {
              setPermissionStatus(result.state as GeolocationPermission);
              result.onchange = () => {
                setPermissionStatus(result.state as GeolocationPermission);
              };
            })
            .catch(() => {
              // Permission API not supported or restricted
            });
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapLocation();
  }, []);

  const selectCity = useCallback((cityIdOrName: string) => {
    const city = findCityByIdOrName(cityIdOrName);
    setSelectedCity(city);
    saveStoredCityId(city.id);
    setError(null);
  }, []);

  const requestCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setPermissionStatus('unavailable');
      setError('Geolocation is not supported by your browser.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          const closest = findClosestCity(newCoords);

          setCoordinates(newCoords);
          setSelectedCity(closest);
          setPermissionStatus('granted');
          setIsLoading(false);

          saveStoredCoordinates(newCoords);
          saveStoredCityId(closest.id);

          resolve(newCoords);
        },
        (geoError) => {
          setIsLoading(false);

          if (geoError.code === geoError.PERMISSION_DENIED) {
            setPermissionStatus('denied');
            setError(`Location permission denied. Showing ads for ${selectedCity.name}.`);
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            setPermissionStatus('unavailable');
            setError('Current GPS position is unavailable.');
          } else {
            setError('Geolocation request timed out. Please try again.');
          }

          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, [selectedCity.name]);

  const resetToDefaultLocation = useCallback(() => {
    setCoordinates(null);
    setSelectedCity(DEFAULT_CITY);
    saveStoredCoordinates(null);
    saveStoredCityId(DEFAULT_CITY.id);
    setError(null);
  }, []);

  const calculateDistanceTo = useCallback(
    (target: Coordinates): number | null => {
      const origin = coordinates || selectedCity.coordinates;
      if (!origin || !target) return null;
      return calculateDistanceKm(origin, target);
    },
    [coordinates, selectedCity.coordinates]
  );

  const formatDistanceTo = useCallback(
    (target: Coordinates): string | null => {
      const dist = calculateDistanceTo(target);
      return dist !== null ? formatDistance(dist) : null;
    },
    [calculateDistanceTo]
  );

  const value: GeolocationContextType = {
    coordinates,
    selectedCity,
    isGpsActive: coordinates !== null,
    permissionStatus,
    isLoading,
    error,
    requestCurrentLocation,
    selectCity,
    resetToDefaultLocation,
    calculateDistanceTo,
    formatDistanceTo,
  };

  return (
    <GeolocationContext.Provider value={value}>
      {children}
    </GeolocationContext.Provider>
  );
};

/**
 * Custom hook to access Geolocation context
 */
export const useGeolocation = (): GeolocationContextType => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
};
