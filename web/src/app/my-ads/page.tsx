'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { MyAdListItem, MyAdsFilterTab, MyAdsPagination, MyAdsResponse } from '@/types/ad';
import { MyAdsStatsBar } from '@/components/my-ads/MyAdsStatsBar';
import { MyAdsTabs } from '@/components/my-ads/MyAdsTabs';
import { MyAdCard } from '@/components/my-ads/MyAdCard';
import { MyAdsEmptyState } from '@/components/my-ads/MyAdsEmptyState';
import { DeleteAdDialog } from '@/components/my-ads/DeleteAdDialog';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export default function MyAdsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<MyAdsFilterTab>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ads, setAds] = useState<MyAdListItem[]>([]);
  const [pagination, setPagination] = useState<MyAdsPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    pending: 0,
    sold: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Action states
  const [updatingAdId, setUpdatingAdId] = useState<string | null>(null);
  const [adToDelete, setAdToDelete] = useState<MyAdListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 1. Auth Gate: Redirect to login if unauthenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?returnUrl=/my-ads');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // 2. Fetch Stats Summary Counts
  const fetchStatsCounts = useCallback(async () => {
    try {
      const [allRes, activeRes, pendingRes, soldRes] = await Promise.all([
        apiClient.get<MyAdsResponse>('/ads/my-ads', { params: { limit: 1 } }),
        apiClient.get<MyAdsResponse>('/ads/my-ads', { params: { status: 'ACTIVE', limit: 1 } }),
        apiClient.get<MyAdsResponse>('/ads/my-ads', { params: { status: 'PENDING', limit: 1 } }),
        apiClient.get<MyAdsResponse>('/ads/my-ads', { params: { status: 'SOLD', limit: 1 } }),
      ]);

      setCounts({
        all: allRes.data?.pagination?.total ?? 0,
        active: activeRes.data?.pagination?.total ?? 0,
        pending: pendingRes.data?.pagination?.total ?? 0,
        sold: soldRes.data?.pagination?.total ?? 0,
      });
    } catch {
      // Non-critical background count error
    }
  }, []);

  // 3. Fetch Listings for current tab & page
  const fetchAds = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 10,
      };

      if (currentTab !== 'ALL') {
        params.status = currentTab;
      }

      const res = await apiClient.get<MyAdsResponse>('/ads/my-ads', { params });

      if (res.data) {
        setAds(res.data.ads || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to load listings. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentTab, currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatsCounts();
    }
  }, [isAuthenticated, fetchStatsCounts]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAds();
    }
  }, [isAuthenticated, fetchAds]);

  const handleTabChange = (newTab: MyAdsFilterTab) => {
    setCurrentTab(newTab);
    setCurrentPage(1);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // 4. Update Ad Status (Mark as Sold or Reactivate)
  const handleUpdateStatus = async (adId: string, newStatus: 'ACTIVE' | 'SOLD') => {
    setUpdatingAdId(adId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiClient.patch(`/ads/${adId}/status`, { status: newStatus });

      // Optimistically update local ads list
      setAds((prev) =>
        prev.map((item) =>
          item.id === adId ? { ...item, status: newStatus } : item
        )
      );

      const statusText = newStatus === 'SOLD' ? 'marked as Sold' : 'reactivated as Active';
      setSuccessMessage(`Listing successfully ${statusText}.`);

      // Refresh aggregate counts
      fetchStatsCounts();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update listing status.';
      setErrorMessage(msg);
    } finally {
      setUpdatingAdId(null);
    }
  };

  // 5. Delete Ad execution
  const handleConfirmDelete = async () => {
    if (!adToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiClient.delete(`/ads/${adToDelete.id}`);

      // Remove from current view
      setAds((prev) => prev.filter((item) => item.id !== adToDelete.id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));

      setSuccessMessage(`Listing "${adToDelete.title}" has been permanently deleted.`);
      setAdToDelete(null);

      // Refresh aggregate counts
      fetchStatsCounts();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to delete listing.';
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Auth Loading Screen
  if (isAuthLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Handled by router.replace
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 sm:py-10 px-4 sm:px-6 space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            My Listings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your active classified ads, view responses, and track buyer engagement.
          </p>
        </div>

        <Link href="/post-ad" className="shrink-0">
          <Button className="h-10 px-4 sm:px-5 font-semibold gap-2 shadow-xs w-full sm:w-auto">
            <PlusCircle className="w-4 h-4" />
            <span>Post New Ad</span>
          </Button>
        </Link>
      </div>

      {/* Stats Bar */}
      <MyAdsStatsBar
        total={counts.all}
        activeCount={counts.active}
        pendingCount={counts.pending}
        soldCount={counts.sold}
        currentTab={currentTab}
        onSelectTab={handleTabChange}
      />

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Status Filter Tabs */}
        <MyAdsTabs
          currentTab={currentTab}
          counts={counts}
          onTabChange={handleTabChange}
        />

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccessMessage(null)}
              className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-100"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAds()}
              className="h-8 text-xs gap-1 border-destructive/30 hover:bg-destructive/10"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 animate-pulse"
              >
                <div className="w-full sm:w-56 h-44 sm:h-36 bg-muted rounded-xl shrink-0" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-muted rounded-md w-1/4" />
                  <div className="h-6 bg-muted rounded-md w-3/4" />
                  <div className="h-4 bg-muted rounded-md w-1/3" />
                  <div className="h-8 bg-muted rounded-md w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : ads.length === 0 ? (
          /* Empty State */
          <div className="pt-2">
            <MyAdsEmptyState
              currentTab={currentTab}
              onResetTab={() => handleTabChange('ALL')}
            />
          </div>
        ) : (
          /* Ads Feed */
          <div className="space-y-3 pt-2">
            {ads.map((ad) => (
              <MyAdCard
                key={ad.id}
                ad={ad}
                onUpdateStatus={handleUpdateStatus}
                onRequestDelete={(item) => setAdToDelete(item)}
                isUpdatingStatus={updatingAdId === ad.id}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteAdDialog
          isOpen={Boolean(adToDelete)}
          adTitle={adToDelete?.title || ''}
          isDeleting={isDeleting}
          onClose={() => setAdToDelete(null)}
          onConfirm={handleConfirmDelete}
        />

        {/* Pagination Controls */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground font-medium">
              Showing page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
              <span className="font-semibold text-foreground">{pagination.totalPages}</span> ({pagination.total} ads)
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
    </div>
  );
}
