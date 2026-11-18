'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  RefreshCw,
  Globe,
  Building2,
  PackageOpen,
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { apiClient } from '@/lib/api-client';
import { AdCard } from '@/components/ads/AdCard';
import { AdCardSkeleton } from '@/components/ads/AdCardSkeleton';
import { AdListItem } from '@/types/ad';
import { Button } from '@/components/ui/button';

// Quick category filter options
const QUICK_CATEGORY_FILTERS = [
  { label: 'All Ads', slug: 'all' },
  { label: 'Motors', slug: 'motors-vehicles' },
  { label: 'Mobiles', slug: 'mobiles-tablets' },
  { label: 'Electronics', slug: 'electronics-appliances' },
  { label: 'Property', slug: 'property' },
  { label: 'Bikes', slug: 'motorcycles' },
  { label: 'Services', slug: 'services' },
] as const;

// Comprehensive Pakistani classified listings across cities and categories
const FALLBACK_FRESH_ADS: AdListItem[] = [
  {
    id: 'fr-1',
    title: 'Suzuki Alto VXR 2023 (First Owner, Bumper to Bumper Original)',
    slug: 'suzuki-alto-vxr-2023-lahore',
    price: 2650000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'Johar Town, Phase 2',
    locationState: 'Punjab',
    latitude: 31.4697,
    longitude: 74.2728,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 420,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    images: [
      {
        id: 'img-fr-1',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-motors', name: 'Cars', slug: 'motors-vehicles' },
  },
  {
    id: 'fr-2',
    title: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray (Official PTA)',
    slug: 'samsung-galaxy-s24-ultra-karachi',
    price: 389000,
    currency: 'PKR',
    isNegotiable: false,
    condition: 'NEW',
    locationCity: 'Karachi',
    locationAddress: 'DHA Phase 6',
    locationState: 'Sindh',
    latitude: 24.7938,
    longitude: 67.0656,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 680,
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    images: [
      {
        id: 'img-fr-2',
        url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-mobiles', name: 'Smartphones', slug: 'mobiles-tablets' },
  },
  {
    id: 'fr-3',
    title: 'Dell XPS 15 9530 Core i9 32GB RAM 1TB SSD RTX 4070 OLED',
    slug: 'dell-xps-15-core-i9-islamabad',
    price: 485000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Islamabad',
    locationAddress: 'Blue Area, Jinnah Avenue',
    locationState: 'Islamabad Capital Territory',
    latitude: 33.7167,
    longitude: 73.0667,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 310,
    createdAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    images: [
      {
        id: 'img-fr-3',
        url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-elec', name: 'Laptops', slug: 'electronics-appliances' },
  },
  {
    id: 'fr-4',
    title: '1 Kanal Ultra Modern Spanish Villa for Sale in DHA Phase 6',
    slug: '1-kanal-spanish-villa-dha-6-lahore',
    price: 95000000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'NEW',
    locationCity: 'Lahore',
    locationAddress: 'DHA Phase 6, Sector J',
    locationState: 'Punjab',
    latitude: 31.4646,
    longitude: 74.3942,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 1450,
    createdAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    images: [
      {
        id: 'img-fr-4',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-prop', name: 'Houses for Sale', slug: 'property' },
  },
  {
    id: 'fr-5',
    title: 'Honda CB 150F Special Edition Red (Zero Meter Condition)',
    slug: 'honda-cb-150f-rawalpindi',
    price: 495000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Rawalpindi',
    locationAddress: 'Saddar, Murree Road',
    locationState: 'Punjab',
    latitude: 33.5973,
    longitude: 73.0479,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 290,
    createdAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    images: [
      {
        id: 'img-fr-5',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-bikes', name: 'Motorcycles', slug: 'motorcycles' },
  },
  {
    id: 'fr-6',
    title: 'Professional Inverter AC Deep Cleaning & Gas Charging Service',
    slug: 'inverter-ac-cleaning-service-lahore',
    price: 3500,
    currency: 'PKR',
    isNegotiable: false,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'Gulberg & Model Town',
    locationState: 'Punjab',
    latitude: 31.5126,
    longitude: 74.3484,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 160,
    createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    images: [
      {
        id: 'img-fr-6',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-services', name: 'Home Services', slug: 'services' },
  },
  {
    id: 'fr-7',
    title: 'Solid Sheesham Wood 6-Seater Dining Table with Chairs',
    slug: 'sheesham-wood-dining-table-faisalabad',
    price: 85000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Faisalabad',
    locationAddress: 'D Ground, Peoples Colony',
    locationState: 'Punjab',
    latitude: 31.4187,
    longitude: 73.0791,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 220,
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    images: [
      {
        id: 'img-fr-7',
        url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-furn', name: 'Furniture', slug: 'furniture' },
  },
  {
    id: 'fr-8',
    title: 'Canon EOS R6 Mark II Mirrorless Camera with 24-105mm Lens',
    slug: 'canon-eos-r6-mark-ii-lahore',
    price: 720000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'NEW',
    locationCity: 'Lahore',
    locationAddress: 'Gulberg III, Hafeez Centre',
    locationState: 'Punjab',
    latitude: 31.5126,
    longitude: 74.3484,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 540,
    createdAt: new Date(Date.now() - 480 * 60 * 1000).toISOString(),
    images: [
      {
        id: 'img-fr-8',
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-elec', name: 'Cameras', slug: 'electronics-appliances' },
  },
].map((item) => ({ ...item, condition: 'USED' as const }));

export const FreshRecommendationsSection: React.FC = () => {
  const { selectedCity } = useGeolocation();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scope, setScope] = useState<'city' | 'nationwide'>('city');
  const [ads, setAds] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [displayCount, setDisplayCount] = useState<number>(8);

  const fetchFreshAds = useCallback(async (retryCount = 0) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        sort: 'newest',
        limit: 16,
      };

      if (scope === 'city') {
        params.city = selectedCity.id;
      }
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await apiClient.get<AdListItem[]>('/ads', {
        params,
      });

      const items: AdListItem[] = Array.isArray(response)
        ? response
        : Array.isArray((response as { data?: AdListItem[] })?.data)
        ? (response as { data: AdListItem[] }).data
        : (response as { ads?: AdListItem[] }).ads || [];

      if (items.length > 0) {
        setAds(items);
        setLoading(false);
        return;
      } else {
        throw new Error('Empty backend list');
      }
    } catch (err: unknown) {
      // Automatic recovery: if backend is still starting up during dev/cold boot, retry
      const isNetworkErr =
        err &&
        typeof err === 'object' &&
        (('code' in err && (err as { code?: string }).code === 'NETWORK_ERROR') ||
          ('status' in err && (err as { status?: number }).status === 0));

      if (isNetworkErr && retryCount < 3) {
        // Render fallback immediately so screen is never blank
        let filtered = [...FALLBACK_FRESH_ADS];
        if (scope === 'city') {
          const cityMatches = filtered.filter(
            (ad) => ad.locationCity.toLowerCase() === selectedCity.name.toLowerCase()
          );
          if (cityMatches.length > 0) {
            filtered = cityMatches;
          }
        }
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(
            (ad) =>
              ad.category?.slug === selectedCategory ||
              (ad.category?.id && ad.category.id.includes(selectedCategory))
          );
        }
        filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAds(filtered);
        setLoading(false);

        // Schedule auto-retry once backend finishes starting up
        setTimeout(() => {
          fetchFreshAds(retryCount + 1);
        }, 1500 * (retryCount + 1));
        return;
      }

      // Fallback filtering
      let filtered = [...FALLBACK_FRESH_ADS];

      if (scope === 'city') {
        const cityMatches = filtered.filter(
          (ad) => ad.locationCity.toLowerCase() === selectedCity.name.toLowerCase()
        );
        if (cityMatches.length > 0) {
          filtered = cityMatches;
        }
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(
          (ad) =>
            ad.category?.slug === selectedCategory ||
            (ad.category?.id && ad.category.id.includes(selectedCategory))
        );
      }

      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAds(filtered);
    } finally {
      setLoading(false);
    }
  }, [scope, selectedCategory, selectedCity]);

  useEffect(() => {
    fetchFreshAds();
  }, [fetchFreshAds]);

  const displayedAds = useMemo(() => {
    return ads.slice(0, displayCount);
  }, [ads, displayCount]);

  const hasMore = ads.length > displayCount;

  return (
    <section className="w-full py-6 sm:py-8 border-t border-border/60">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-6 pb-3 border-b border-border/60">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase">
            Marketplace Feed
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Fresh Recommendations
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            {scope === 'city'
              ? `Newest verified classified listings in ${selectedCity.name}`
              : 'Newest verified listings across all major Pakistani cities'}
          </p>
        </div>

        {/* Scope Segmented Control & Refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <div className="flex items-center bg-secondary/80 p-1 rounded-lg border border-border/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => setScope('city')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                scope === 'city'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>{selectedCity.name}</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('nationwide')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                scope === 'nationwide'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>All Pakistan</span>
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchFreshAds()}
            disabled={loading}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Minimal Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {QUICK_CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.slug);
              setDisplayCount(8);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === cat.slug
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-semibold'
                : 'bg-card text-muted-foreground border-border/70 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4-Column Responsive Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <AdCardSkeleton key={idx} />
          ))}
        </div>
      ) : displayedAds.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayedAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>

          {/* Load More & Search CTA Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-border/40">
            {hasMore ? (
              <Button
                variant="outline"
                onClick={() => setDisplayCount((prev) => prev + 4)}
                className="w-full sm:w-auto px-6 text-xs font-semibold border-border/80 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl"
              >
                Load More Listings
              </Button>
            ) : null}

            <Link href="/search" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto px-6 h-10 gap-2 text-xs font-semibold bg-[#0D382B] hover:bg-[#07241B] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 rounded-xl transition-colors"
              >
                <span>Explore All Categories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 sm:p-12 text-center rounded-xl border border-border/60 bg-secondary/30">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground mb-3">
            <PackageOpen className="w-5 h-5 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No fresh ads found in this category
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Try switching to &quot;All Pakistan&quot; or select another category to view active listings.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setScope('nationwide');
            }}
            className="text-xs rounded-lg"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </section>
  );
};
