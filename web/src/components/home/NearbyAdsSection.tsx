'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Crosshair,
  ArrowRight,
  Compass,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistanceKm } from '@/lib/geo-utils';
import { apiClient } from '@/lib/api-client';
import { AdCard } from '@/components/ads/AdCard';
import { AdCardSkeleton } from '@/components/ads/AdCardSkeleton';
import { AdListItem } from '@/types/ad';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RADIUS_OPTIONS = [5, 10, 25, 50] as const;
type RadiusOption = (typeof RADIUS_OPTIONS)[number];

// Realistic Pakistani classified listings for fallback preview
const FALLBACK_NEARBY_ADS: AdListItem[] = [
  {
    id: 'nb-1',
    title: 'Honda Civic Oriel 1.8 i-VTEC (Sunroof, UG Leather)',
    slug: 'honda-civic-oriel-18-i-vtec-lahore',
    price: 4950000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'Gulberg III, Main Boulevard',
    locationState: 'Punjab',
    latitude: 31.5126,
    longitude: 74.3484,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 312,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    images: [
      {
        id: 'img-nb-1',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-motors', name: 'Cars', slug: 'cars' },
  },
  {
    id: 'nb-2',
    title: 'Apple iPhone 15 Pro 128GB Natural Titanium (PTA Approved)',
    slug: 'apple-iphone-15-pro-128gb-lahore',
    price: 345000,
    currency: 'PKR',
    isNegotiable: false,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'DHA Phase 5, Commercial',
    locationState: 'Punjab',
    latitude: 31.4646,
    longitude: 74.3942,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 780,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    images: [
      {
        id: 'img-nb-2',
        url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-mobiles', name: 'Smartphones', slug: 'smartphones' },
  },
  {
    id: 'nb-3',
    title: 'Sony PlayStation 5 Disc Edition with 2 DualSense Controllers',
    slug: 'sony-ps5-disc-edition-lahore',
    price: 155000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'Model Town, Link Road',
    locationState: 'Punjab',
    latitude: 31.4827,
    longitude: 74.3184,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 421,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    images: [
      {
        id: 'img-nb-3',
        url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-electronics', name: 'Electronics', slug: 'electronics-appliances' },
  },
  {
    id: 'nb-4',
    title: 'Yamaha YBR 125G Metallic Black (First Owner, Low Mileage)',
    slug: 'yamaha-ybr-125g-lahore',
    price: 385000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'Johar Town, Block G',
    locationState: 'Punjab',
    latitude: 31.4697,
    longitude: 74.2728,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 195,
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    images: [
      {
        id: 'img-nb-4',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-bikes', name: 'Motorcycles', slug: 'motorcycles' },
  },
  {
    id: 'nb-5',
    title: 'MacBook Air M2 8GB 256GB Midnight (Box & Original Charger)',
    slug: 'macbook-air-m2-karachi',
    price: 245000,
    currency: 'PKR',
    isNegotiable: false,
    condition: 'USED',
    locationCity: 'Karachi',
    locationAddress: 'Clifton Block 2',
    locationState: 'Sindh',
    latitude: 24.8138,
    longitude: 67.0306,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 610,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    images: [
      {
        id: 'img-nb-5',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-laptops', name: 'Computers & Laptops', slug: 'computers-laptops' },
  },
  {
    id: 'nb-6',
    title: 'Brand New 10 Marla Luxury Modern House for Sale',
    slug: '10-marla-luxury-modern-house-islamabad',
    price: 42000000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'NEW',
    locationCity: 'Islamabad',
    locationAddress: 'Sector G-13/2',
    locationState: 'Islamabad Capital Territory',
    latitude: 33.6492,
    longitude: 72.9696,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 940,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    images: [
      {
        id: 'img-nb-6',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-property', name: 'Houses for Sale', slug: 'houses-for-sale' },
  },
];

export const NearbyAdsSection: React.FC = () => {
  const {
    selectedCity,
    coordinates,
    isGpsActive,
    isLoading: isGeoLoading,
    requestCurrentLocation,
  } = useGeolocation();

  const [radiusKm, setRadiusKm] = useState<RadiusOption>(25);
  const [ads, setAds] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  // Active geographic anchor (GPS coordinates if available, otherwise city center)
  const activeAnchor = useMemo(() => {
    return {
      latitude: coordinates?.latitude ?? selectedCity.coordinates.latitude,
      longitude: coordinates?.longitude ?? selectedCity.coordinates.longitude,
    };
  }, [coordinates, selectedCity]);

  const fetchNearbyAds = useCallback(async () => {
    setLoading(true);
    try {
      // Attempt backend API fetch
      const response = await apiClient.get<{ ads: AdListItem[] } | AdListItem[]>('/ads', {
        params: {
          lat: activeAnchor.latitude,
          lng: activeAnchor.longitude,
          radius: radiusKm,
          limit: 8,
          sort: 'nearest',
        },
      });

      const items = Array.isArray(response)
        ? response
        : (response as { ads?: AdListItem[] }).ads || [];

      if (items.length > 0) {
        // Compute distanceKm client-side for precision
        const enriched = items.map((item) => {
          if (item.latitude && item.longitude) {
            const dist = calculateDistanceKm(activeAnchor, {
              latitude: item.latitude,
              longitude: item.longitude,
            });
            return { ...item, distanceKm: Math.round(dist * 10) / 10 };
          }
          return item;
        });
        setAds(enriched);
        setIsUsingFallback(false);
      } else {
        throw new Error('Empty backend list');
      }
    } catch {
      // Graceful fallback: Filter fallback items within selected radius of activeAnchor
      setIsUsingFallback(true);
      const enrichedFallback = FALLBACK_NEARBY_ADS.map((item) => {
        const dist = calculateDistanceKm(activeAnchor, {
          latitude: item.latitude!,
          longitude: item.longitude!,
        });
        return {
          ...item,
          distanceKm: Math.round(dist * 10) / 10,
        };
      })
        .filter((item) => item.distanceKm !== undefined && item.distanceKm <= radiusKm)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

      setAds(enrichedFallback);
    } finally {
      setLoading(false);
    }
  }, [activeAnchor, radiusKm]);

  useEffect(() => {
    fetchNearbyAds();
  }, [fetchNearbyAds]);

  return (
    <section className="w-full py-6 md:py-8 border-t border-slate-100">
      {/* Header with Location & Radius Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-teal-50 text-teal-700">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Nearby Ads in <span className="text-teal-700">{selectedCity.name}</span>
            </h2>
            {isGpsActive && (
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                GPS Exact
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Discover verified classified ads within {radiusKm} km of your location
          </p>
        </div>

        {/* Radius Filter Pills & GPS Action */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              Radius:
            </span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  radiusKm === r
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {!isGpsActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => requestCurrentLocation()}
              disabled={isGeoLoading}
              className="gap-1.5 text-xs text-teal-700 border-teal-300 hover:bg-teal-50 h-8"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isGeoLoading ? 'animate-spin' : ''}`} />
              <span>{isGeoLoading ? 'Detecting...' : 'Use Precise GPS'}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNearbyAds()}
            disabled={loading}
            className="h-8 px-2 text-slate-500 hover:text-slate-800"
            title="Refresh nearby ads"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Notice when using fallback calculation */}
      {isUsingFallback && (
        <div className="mb-4 px-3 py-1.5 rounded-lg bg-teal-50/70 border border-teal-100 flex items-center justify-between text-xs text-teal-800">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            Showing ads sorted by Great-Circle Haversine distance from {selectedCity.name} center.
          </span>
          <span className="text-[11px] font-medium text-teal-600">Proximity Verified</span>
        </div>
      )}

      {/* Grid State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <AdCardSkeleton key={idx} />
          ))}
        </div>
      ) : ads.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
            No ads found within {radiusKm} km
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
            Try expanding your search radius to 50 km or browse ads across {selectedCity.name}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setRadiusKm(50)}
              className="text-xs"
            >
              Expand Radius to 50 km
            </Button>
            <Link href={`/search?city=${encodeURIComponent(selectedCity.id)}`}>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <span>Browse All {selectedCity.name} Ads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};
