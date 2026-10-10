'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToastBanner, ToastMessage } from '@/components/ui/toast-banner';
import { apiClient } from '@/lib/api-client';
import { UserReportDetail, ReportsResponseData } from '@/types/admin';
import { ReportsTable } from '@/components/admin/ReportsTable';
import { ReportsEmptyState } from '@/components/admin/ReportsEmptyState';
import { TakeDownAdDialog } from '@/components/admin/TakeDownAdDialog';

type ReportStatusFilter = 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'ALL';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<UserReportDetail[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>('PENDING');
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

  // Take Down Dialog state
  const [selectedReportForTakeDown, setSelectedReportForTakeDown] = useState<UserReportDetail | null>(null);
  const [isTakeDownOpen, setIsTakeDownOpen] = useState(false);
  const [isSubmittingTakeDown, setIsSubmittingTakeDown] = useState(false);

  const fetchReports = useCallback(
    async (page = 1, currentFilter = statusFilter, refresh = false) => {
      try {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        const params: Record<string, string | number> = {
          page,
          limit: 15,
        };
        if (currentFilter !== 'ALL') {
          params.status = currentFilter;
        }

        const res = await apiClient.get<ReportsResponseData>('/admin/reports', {
          params,
        });

        if (res.data) {
          setReports(res.data.reports || []);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
          setLastUpdated(new Date());
        }
      } catch (err: unknown) {
        console.error('Failed to load user reports:', err);
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
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchReports(1, statusFilter);
  }, [fetchReports, statusFilter]);

  // Tab switch handler
  const handleTabChange = (newFilter: ReportStatusFilter) => {
    setStatusFilter(newFilter);
    setSearchQuery('');
  };

  // Open Take Down Modal
  const handleOpenTakeDown = (report: UserReportDetail) => {
    setSelectedReportForTakeDown(report);
    setIsTakeDownOpen(true);
  };

  // Confirm Take Down
  const handleConfirmTakeDown = async () => {
    if (!selectedReportForTakeDown) return;
    const report = selectedReportForTakeDown;

    try {
      setIsSubmittingTakeDown(true);
      await apiClient.patch(`/admin/reports/${report.id}`, {
        status: 'RESOLVED',
        takeDownAd: true,
      });

      // Update local state
      if (statusFilter === 'PENDING') {
        setReports((prev) => prev.filter((r) => r.id !== report.id));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      } else {
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  status: 'RESOLVED',
                  ad: r.ad ? { ...r.ad, status: 'REJECTED' } : null,
                }
              : r
          )
        );
      }

      setIsTakeDownOpen(false);
      setSelectedReportForTakeDown(null);

      setToast({
        id: Date.now().toString(),
        title: 'Listing Taken Down',
        message: `Listing "${report.ad?.title || 'Ad'}" has been taken down (status: REJECTED) and the user report marked as RESOLVED.`,
        variant: 'success',
      });
    } catch (err: unknown) {
      console.error('Failed to take down listing:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to take down listing.';
      setToast({
        id: Date.now().toString(),
        title: 'Action Failed',
        message: message || 'Failed to take down listing.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingTakeDown(false);
    }
  };

  // Dismiss Report Handler
  const handleDismissReport = async (report: UserReportDetail) => {
    try {
      setActioningId(report.id);
      await apiClient.patch(`/admin/reports/${report.id}`, {
        status: 'DISMISSED',
      });

      // Update local state
      if (statusFilter === 'PENDING') {
        setReports((prev) => prev.filter((r) => r.id !== report.id));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      } else {
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  status: 'DISMISSED',
                }
              : r
          )
        );
      }

      setToast({
        id: Date.now().toString(),
        title: 'Report Dismissed',
        message: `Report for "${report.ad?.title || 'Ad'}" has been dismissed. The listing remains active.`,
        variant: 'success',
      });
    } catch (err: unknown) {
      console.error('Failed to dismiss report:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to dismiss report.';
      setToast({
        id: Date.now().toString(),
        title: 'Action Failed',
        message: message || 'Failed to dismiss report.',
        variant: 'destructive',
      });
    } finally {
      setActioningId(null);
    }
  };

  // Filtered reports by search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const query = searchQuery.toLowerCase().trim();

    return reports.filter((report) => {
      const matchTitle = report.ad?.title?.toLowerCase().includes(query);
      const matchReporterName = report.reporter?.name?.toLowerCase().includes(query);
      const matchReporterEmail = report.reporter?.email?.toLowerCase().includes(query);
      const matchReason = report.reason?.toLowerCase().includes(query);
      const matchDetails = report.details?.toLowerCase().includes(query);

      return matchTitle || matchReporterName || matchReporterEmail || matchReason || matchDetails;
    });
  }, [reports, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              User Reports Moderation
            </h1>
            <Badge
              variant={pagination.total > 0 && statusFilter === 'PENDING' ? 'destructive' : 'secondary'}
              className="font-mono text-xs"
            >
              {pagination.total} {statusFilter === 'ALL' ? 'total' : statusFilter.toLowerCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review listings flagged by marketplace users. Take down policy-violating ads or dismiss unfounded reports.
          </p>
        </div>

        {/* Refresh & Last Updated */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {lastUpdated && (
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReports(pagination.page, statusFilter, true)}
            disabled={isRefreshing || isLoading}
            className="gap-2 h-9 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Button
            variant={statusFilter === 'PENDING' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('PENDING')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Flags
          </Button>

          <Button
            variant={statusFilter === 'RESOLVED' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('RESOLVED')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </Button>

          <Button
            variant={statusFilter === 'DISMISSED' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('DISMISSED')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <XCircle className="w-3.5 h-3.5" />
            Dismissed
          </Button>

          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('ALL')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            All Reports
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search ad, reporter, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-xs bg-muted/40 border-border"
          />
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReports(pagination.page, statusFilter)}
            className="text-xs border-destructive/30 hover:bg-destructive/15 text-destructive"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Content: Reports Table or Empty State */}
      {!isLoading && filteredReports.length === 0 ? (
        <ReportsEmptyState
          statusFilter={statusFilter}
          isSearchFiltered={Boolean(searchQuery.trim() && reports.length > 0)}
          onClearFilters={() => setSearchQuery('')}
        />
      ) : (
        <div className="space-y-4">
          <ReportsTable
            reports={filteredReports}
            isLoading={isLoading}
            onTakeDown={handleOpenTakeDown}
            onDismiss={handleDismissReport}
            actioningId={actioningId}
          />

          {/* Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
              <div>
                Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
                <strong className="text-foreground">{pagination.totalPages}</strong> (
                {pagination.total} reports)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReports(pagination.page - 1, statusFilter)}
                  disabled={!pagination.hasPrevPage || isLoading}
                  className="h-8 gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReports(pagination.page + 1, statusFilter)}
                  disabled={!pagination.hasNextPage || isLoading}
                  className="h-8 gap-1 text-xs"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Take Down Listing Confirmation Dialog */}
      <TakeDownAdDialog
        report={selectedReportForTakeDown}
        isOpen={isTakeDownOpen}
        onClose={() => setIsTakeDownOpen(false)}
        onConfirmTakeDown={handleConfirmTakeDown}
        isSubmitting={isSubmittingTakeDown}
      />
    </div>
  );
}
