'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { AdListItem } from '@/types/ad';
import { FavoriteAdCard } from '@/components/favorites/FavoriteAdCard';
import { FavoritesEmptyState } from '@/components/favorites/FavoritesEmptyState';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';

interface FavoritesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FavoritesApiResponse {
  ads: AdListItem[];
  pagination: FavoritesPagination;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [ads, setAds] = useState<AdListItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination, setPagination] = useState<FavoritesPagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [removingAdId, setRemovingAdId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?returnUrl=/favorites');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // 2. Fetch User's Favorited Ads
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.get<FavoritesApiResponse>('/ads/favorites', {
        params: {
          page: currentPage,
          limit: 12,
        },
      });

      if (res.data) {
        setAds(res.data.ads || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to load saved listings. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  // 3. 1-Click Remove / Unfavorite
  const handleRemoveFavorite = async (adId: string) => {
    setRemovingAdId(adId);
    setErrorMessage(null);

    try {
      await apiClient.post(`/ads/${adId}/favorite`);

      // Optimistically remove from list
      setAds((prev) => prev.filter((a) => a.id !== adId));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to remove from saved listings.';
      setErrorMessage(msg);
    } finally {
      setRemovingAdId(null);
    }
  };

  // Auth loading screen
  if (isAuthLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Saved Listings
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Keep track of prices, availability, and contact sellers when you are ready to buy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/search">
            <Button variant="outline" className="h-10 px-4 font-semibold gap-2 border-border text-xs sm:text-sm">
              <Search className="w-4 h-4" />
              <span>Explore More</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchFavorites()}
            className="h-8 text-xs gap-1 border-destructive/30 hover:bg-destructive/10"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </Button>
        </div>
      )}

      {/* Content Feed */}
      {isLoading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse flex flex-col justify-between"
            >
              <div className="aspect-[4/3] w-full bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-5 bg-muted rounded w-4/5" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
              <div className="p-4 pt-0">
                <div className="h-8 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : ads.length === 0 ? (
        /* Empty State */
        <FavoritesEmptyState />
      ) : (
        /* Favorites Grid */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>
              You have <span className="font-bold text-foreground">{pagination.total}</span> saved listing{pagination.total === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {ads.map((ad) => (
              <FavoriteAdCard
                key={ad.id}
                ad={ad}
                onRemove={handleRemoveFavorite}
                isRemoving={removingAdId === ad.id}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <span className="text-xs text-muted-foreground font-medium">
                Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
                <span className="font-semibold text-foreground">{pagination.totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 gap-1 border-border font-medium text-xs"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 gap-1 border-border font-medium text-xs"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
