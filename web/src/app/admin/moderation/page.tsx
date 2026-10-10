'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToastBanner, ToastMessage } from '@/components/ui/toast-banner';
import { apiClient } from '@/lib/api-client';
import { PendingAdDetail, PendingAdsResponseData } from '@/types/admin';
import { ModerationQueueTable } from '@/components/admin/ModerationQueueTable';
import { ModerationQueueEmptyState } from '@/components/admin/ModerationQueueEmptyState';
import { RejectAdModal } from '@/components/admin/RejectAdModal';

export default function AdminModerationPage() {
  const [ads, setAds] = useState<PendingAdDetail[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Reject modal state
  const [selectedAdForReject, setSelectedAdForReject] = useState<PendingAdDetail | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const fetchPendingAds = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const res = await apiClient.get<PendingAdsResponseData>('/admin/ads/pending', {
        params: { page, limit: 15 },
      });

      if (res.data) {
        setAds(res.data.ads || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
        setLastUpdated(new Date());
      }
    } catch (err: unknown) {
      console.error('Failed to load pending ads queue:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to connect to moderation service. Please verify server status.';
      setError(message || 'Failed to connect to moderation service.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingAds(1);
  }, [fetchPendingAds]);

  // Handle Approve Action
  const handleApprove = async (ad: PendingAdDetail) => {
    try {
      setActioningId(ad.id);
      await apiClient.patch(`/admin/ads/${ad.id}/moderate`, {
        action: 'APPROVE',
      });

      // Remove from active pending table state
      setAds((prev) => prev.filter((item) => item.id !== ad.id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));

      setToast({
        id: Date.now().toString(),
        title: 'Listing Approved',
        message: `"${ad.title}" has been published and is now live on the public marketplace.`,
        variant: 'success',
      });
    } catch (err: unknown) {
      console.error('Failed to approve ad:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to approve listing.';
      setToast({
        id: Date.now().toString(),
        title: 'Approval Failed',
        message: message || 'Failed to approve listing.',
        variant: 'destructive',
      });
    } finally {
      setActioningId(null);
    }
  };

  // Open Rejection Modal
  const handleOpenReject = (ad: PendingAdDetail) => {
    setSelectedAdForReject(ad);
    setIsRejectModalOpen(true);
  };

  // Handle Confirm Rejection Action
  const handleConfirmReject = async (reason: string) => {
    if (!selectedAdForReject) return;
    const ad = selectedAdForReject;

    try {
      setIsSubmittingReject(true);
      await apiClient.patch(`/admin/ads/${ad.id}/moderate`, {
        action: 'REJECT',
        rejectionReason: reason,
      });

      // Remove from active pending table state
      setAds((prev) => prev.filter((item) => item.id !== ad.id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));

      setIsRejectModalOpen(false);
      setSelectedAdForReject(null);

      setToast({
        id: Date.now().toString(),
        title: 'Listing Rejected',
        message: `"${ad.title}" has been marked as REJECTED with reason recorded.`,
        variant: 'destructive',
      });
    } catch (err: unknown) {
      console.error('Failed to reject ad:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to reject listing.';
      setToast({
        id: Date.now().toString(),
        title: 'Rejection Failed',
        message: message || 'Failed to reject listing.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReject(false);
    }
  };

  // Client-side filtering across ad title, seller name, email, and city
  const filteredAds = ads.filter((ad) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = ad.title?.toLowerCase().includes(query);
    const sellerMatch = ad.user?.name?.toLowerCase().includes(query) || ad.user?.email?.toLowerCase().includes(query);
    const cityMatch = ad.locationCity?.toLowerCase().includes(query);
    return titleMatch || sellerMatch || cityMatch;
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPendingAds(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />

      {/* Reject Ad Modal */}
      <RejectAdModal
        ad={selectedAdForReject}
        isOpen={isRejectModalOpen}
        onClose={() => {
          if (!isSubmittingReject) {
            setIsRejectModalOpen(false);
            setSelectedAdForReject(null);
          }
        }}
        onConfirmReject={handleConfirmReject}
        isSubmitting={isSubmittingReject}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
              <span>Ad Moderation Queue</span>
            </h2>
            <Badge
              variant="outline"
              className="font-mono text-xs font-semibold px-2 py-0.5 border-amber-500/30 text-amber-600 bg-amber-500/10"
            >
              {pagination.total} Pending
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review user-submitted listings, verify details, and uphold platform policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {lastUpdated && (
            <span className="text-[11px] font-mono text-muted-foreground hidden md:inline-block">
              Synced: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPendingAds(pagination.page, true)}
            disabled={isLoading || isRefreshing}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Queue'}</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchPendingAds(pagination.page)}
            className="shrink-0 text-xs border-destructive/30 hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-xl shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, seller name, or city..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>
            Showing <strong>{filteredAds.length}</strong> of <strong>{pagination.total}</strong> pending
          </span>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="h-7 text-[11px] px-2 text-primary"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Queue Content Area */}
      {isLoading ? (
        <ModerationQueueTable ads={[]} isLoading={true} />
      ) : filteredAds.length > 0 ? (
        <ModerationQueueTable
          ads={filteredAds}
          isLoading={false}
          onApprove={handleApprove}
          onReject={handleOpenReject}
          actioningId={actioningId}
        />
      ) : (
        <ModerationQueueEmptyState
          isFiltered={!!searchQuery.trim() && ads.length > 0}
          onClearFilters={() => setSearchQuery('')}
        />
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
            <span className="font-semibold text-foreground">{pagination.totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage || isLoading}
              className="h-8 text-xs gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="h-8 text-xs gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
