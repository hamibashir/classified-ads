'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AdListItem } from '@/types/ad';
import { apiClient } from '@/lib/api-client';
import { AdCard } from './AdCard';
import { AdCardSkeleton } from './AdCardSkeleton';

interface SimilarAdsSectionProps {
  currentAdId: string;
  categorySlug?: string;
  categoryName?: string;
  cityName?: string;
}

const FALLBACK_SIMILAR: AdListItem[] = [
  {
    id: 'sim-1',
    title: 'Honda City 1.2L CVT 2022 (Super White, 1st Owner)',
    slug: 'honda-city-12l-cvt-2022-lahore',
    price: 4350000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'Model Town',
    locationState: 'Punjab',
    latitude: 31.4826,
    longitude: 74.3214,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 680,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    images: [
      {
        id: 'img-sim-1',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-motors', name: 'Cars', slug: 'motors-vehicles' },
  },
  {
    id: 'sim-2',
    title: 'Toyota Yaris ATIV 1.3 CVT 2021 (Genuine Paint, Dealership Maintained)',
    slug: 'toyota-yaris-ativ-13-cvt-2021-lahore',
    price: 3950000,
    currency: 'PKR',
    isNegotiable: false,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'DHA Phase 3',
    locationState: 'Punjab',
    latitude: 31.4746,
    longitude: 74.3742,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 540,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    images: [
      {
        id: 'img-sim-2',
        url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-motors', name: 'Cars', slug: 'motors-vehicles' },
  },
  {
    id: 'sim-3',
    title: 'Suzuki Swift GLX CVT 2023 (Zero Meter Delivery)',
    slug: 'suzuki-swift-glx-cvt-2023-islamabad',
    price: 4700000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'NEW',
    locationCity: 'Islamabad',
    locationAddress: 'Blue Area',
    locationState: 'Islamabad Capital Territory',
    latitude: 33.7115,
    longitude: 73.0645,
    showPhone: true,
    allowWhatsapp: false,
    viewsCount: 910,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    images: [
      {
        id: 'img-sim-3',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-motors', name: 'Cars', slug: 'motors-vehicles' },
  },
];

export const SimilarAdsSection: React.FC<SimilarAdsSectionProps> = ({
  currentAdId,
  categorySlug,
  categoryName = 'Similar Listings',
  cityName,
}) => {
  const [ads, setAds] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSimilar() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (categorySlug) queryParams.set('category', categorySlug);
        queryParams.set('limit', '4');

        const res = await apiClient.get<AdListItem[]>(
          `/ads?${queryParams.toString()}`
        );

        const list: AdListItem[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : (res as { data?: { ads?: AdListItem[] } })?.data?.ads || [];
        const filtered = list.filter((item) => item.id !== currentAdId);

        if (isMounted) {
          setAds(filtered.length > 0 ? filtered : FALLBACK_SIMILAR.filter((f) => f.id !== currentAdId));
        }
      } catch {
        if (isMounted) {
          setAds(FALLBACK_SIMILAR.filter((f) => f.id !== currentAdId));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSimilar();
    return () => {
      isMounted = false;
    };
  }, [currentAdId, categorySlug]);

  if (!loading && ads.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-teal-50 text-teal-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              More Listings You May Like
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Similar verified ads in {categoryName} {cityName ? `across ${cityName}` : 'across Pakistan'}
          </p>
        </div>

        {categorySlug && (
          <Link
            href={`/search?category=${encodeURIComponent(categorySlug)}`}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors group self-start sm:self-auto"
          >
            <span>View all in {categoryName}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <AdCardSkeleton key={i} />
            ))
          : ads.slice(0, 3).map((ad) => <AdCard key={ad.id} ad={ad} />)}
      </div>
    </section>
  );
};
