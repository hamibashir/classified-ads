'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AdListItem } from '@/types/ad';
import { apiClient } from '@/lib/api-client';
import { SEARCH_FALLBACK_ADS } from '@/constants/fallbackSearchAds';
import { POPULAR_CATEGORIES } from '@/constants/categories';
import { AdCard } from './AdCard';
import { AdCardSkeleton } from './AdCardSkeleton';

interface SimilarAdsSectionProps {
  currentAdId: string;
  categorySlug?: string;
  categoryName?: string;
  cityName?: string;
}

/**
 * Resolves the parent category slug from subcategories
 */
function getParentCategorySlug(slug?: string): string | null {
  if (!slug) return null;
  const s = slug.toLowerCase();
  for (const cat of POPULAR_CATEGORIES) {
    if (cat.slug === s) return cat.slug;
    if (cat.subcategories?.some((sub) => sub.slug === s)) {
      return cat.slug;
    }
  }
  return null;
}

/**
 * Selects category-accurate fallback listings matching the current ad's niche
 */
function getCategoryFallbackAds(
  categorySlug?: string,
  currentAdId?: string,
  cityName?: string
): AdListItem[] {
  if (!categorySlug) return [];
  const targetSlug = categorySlug.toLowerCase();
  const parentSlug = getParentCategorySlug(targetSlug);

  // 1. Exact subcategory or category slug match
  const exact = SEARCH_FALLBACK_ADS.filter((item) => {
    if (item.id === currentAdId) return false;
    return item.subcatSlug === targetSlug || item.category?.slug === targetSlug;
  });

  // 2. Parent category matches (e.g., if looking at laptops, include other electronics/gadgets)
  const parentMatches = parentSlug
    ? SEARCH_FALLBACK_ADS.filter((item) => {
        if (item.id === currentAdId) return false;
        return (
          (item.category?.slug === parentSlug || item.subcatSlug === parentSlug) &&
          !exact.some((e) => e.id === item.id)
        );
      })
    : [];

  const combined = [...exact, ...parentMatches];

  // 3. Prioritize same city if available
  if (cityName) {
    const cityLower = cityName.toLowerCase();
    combined.sort((a, b) => {
      const aCity = (a.locationCity || '').toLowerCase() === cityLower ? 1 : 0;
      const bCity = (b.locationCity || '').toLowerCase() === cityLower ? 1 : 0;
      return bCity - aCity;
    });
  }

  return combined;
}

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
        let dbAds: AdListItem[] = [];

        // 1. Fetch matching ads from DB for this subcategory
        if (categorySlug) {
          try {
            const res = await apiClient.get<{ ads?: AdListItem[] } | AdListItem[]>(`/ads?category=${encodeURIComponent(categorySlug)}&limit=8`);
            const raw = res?.data || res;
            const list: AdListItem[] = Array.isArray(raw)
              ? raw
              : Array.isArray((raw as { ads?: AdListItem[] })?.ads)
              ? (raw as { ads?: AdListItem[] }).ads || []
              : [];
            dbAds = list.filter((item) => item.id !== currentAdId);
          } catch {
            dbAds = [];
          }
        }

        // 2. If fewer than 3 ads in subcategory, query parent category in DB
        const parentSlug = getParentCategorySlug(categorySlug);
        if (dbAds.length < 3 && parentSlug && parentSlug !== categorySlug) {
          try {
            const parentRes = await apiClient.get<{ ads?: AdListItem[] } | AdListItem[]>(`/ads?category=${encodeURIComponent(parentSlug)}&limit=8`);
            const parentRaw = parentRes?.data || parentRes;
            const parentList: AdListItem[] = Array.isArray(parentRaw)
              ? parentRaw
              : Array.isArray((parentRaw as { ads?: AdListItem[] })?.ads)
              ? (parentRaw as { ads?: AdListItem[] }).ads || []
              : [];
            const extra = parentList.filter(
              (item) => item.id !== currentAdId && !dbAds.some((d) => d.id === item.id)
            );
            dbAds = [...dbAds, ...extra];
          } catch {
            // Ignore
          }
        }

        // 3. If still fewer than 3 ads, supplement with category-accurate fallbacks from SEARCH_FALLBACK_ADS
        if (dbAds.length < 3) {
          const fallbackMatches = getCategoryFallbackAds(categorySlug, currentAdId, cityName);
          const needed = fallbackMatches.filter(
            (fb) => !dbAds.some((d) => d.id === fb.id || d.slug === fb.slug)
          );
          dbAds = [...dbAds, ...needed];
        }

        // 4. Prioritize same city if present
        if (cityName) {
          const cityLower = cityName.toLowerCase();
          dbAds.sort((a, b) => {
            const aInCity = (a.locationCity || '').toLowerCase() === cityLower ? 1 : 0;
            const bInCity = (b.locationCity || '').toLowerCase() === cityLower ? 1 : 0;
            return bInCity - aInCity;
          });
        }

        if (isMounted) {
          setAds(dbAds.slice(0, 3));
        }
      } catch {
        if (isMounted) {
          const fallbackMatches = getCategoryFallbackAds(categorySlug, currentAdId, cityName);
          setAds(fallbackMatches.slice(0, 3));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSimilar();
    return () => {
      isMounted = false;
    };
  }, [currentAdId, categorySlug, cityName]);

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
