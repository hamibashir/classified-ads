'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users as UsersIcon,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToastBanner, ToastMessage } from '@/components/ui/toast-banner';
import { apiClient } from '@/lib/api-client';
import { AdminUserListItem, AdminUsersResponseData } from '@/types/admin';
import { UsersTable } from '@/components/admin/UsersTable';
import { BanUserDialog } from '@/components/admin/BanUserDialog';

type UserStatusFilter = 'ALL' | 'ACTIVE' | 'BANNED' | 'VERIFIED' | 'UNVERIFIED';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actioningUserId, setActioningUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Ban Dialog state
  const [selectedUserForBan, setSelectedUserForBan] = useState<AdminUserListItem | null>(null);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [isSubmittingBan, setIsSubmittingBan] = useState(false);

  const fetchUsers = useCallback(
    async (
      page = 1,
      currentStatus = statusFilter,
      currentRole = roleFilter,
      currentSearch = searchQuery,
      refresh = false
    ) => {
      try {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        const params: Record<string, string | number> = {
          page,
          limit: 15,
        };

        if (currentSearch.trim()) {
          params.search = currentSearch.trim();
        }

        if (currentRole !== 'ALL') {
          params.role = currentRole;
        }

        if (currentStatus === 'ACTIVE') {
          params.isBanned = 'false';
        } else if (currentStatus === 'BANNED') {
          params.isBanned = 'true';
        } else if (currentStatus === 'VERIFIED') {
          params.isPhoneVerified = 'true';
        } else if (currentStatus === 'UNVERIFIED') {
          params.isPhoneVerified = 'false';
        }

        const res = await apiClient.get<AdminUsersResponseData>('/admin/users', {
          params,
        });

        if (res.data) {
          setUsers(res.data.users || []);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
          setLastUpdated(new Date());
        }
      } catch (err: unknown) {
        console.error('Failed to load users:', err);
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : err instanceof Error
            ? err.message
            : 'Failed to connect to user service.';
        setError(message || 'Failed to load users.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [statusFilter, roleFilter, searchQuery]
  );

  useEffect(() => {
    fetchUsers(1, statusFilter, roleFilter, searchQuery);
  }, [fetchUsers, statusFilter, roleFilter, searchQuery]);

  // Open Ban confirmation modal
  const handleOpenBan = (user: AdminUserListItem) => {
    setSelectedUserForBan(user);
    setIsBanOpen(true);
  };

  // Confirm Ban / Unban
  const handleConfirmBanToggle = async (reason?: string) => {
    if (!selectedUserForBan) return;
    const targetUser = selectedUserForBan;
    const nextBanStatus = !targetUser.isBanned;

    try {
      setIsSubmittingBan(true);
      await apiClient.patch(`/admin/users/${targetUser.id}/ban`, {
        isBanned: nextBanStatus,
        reason,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isBanned: nextBanStatus } : u))
      );

      setIsBanOpen(false);
      setSelectedUserForBan(null);

      setToast({
        id: Date.now().toString(),
        title: nextBanStatus ? 'User Suspended' : 'Suspension Lifted',
        message: nextBanStatus
          ? `"${targetUser.name}" has been suspended. Their ads are now hidden from the marketplace.`
          : `"${targetUser.name}" suspension has been lifted. Account restored.`,
        variant: nextBanStatus ? 'destructive' : 'success',
      });
    } catch (err: unknown) {
      console.error('Failed to update user ban status:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to update user status.';
      setToast({
        id: Date.now().toString(),
        title: 'Action Failed',
        message: message || 'Failed to update user status.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingBan(false);
    }
  };

  // Toggle Verification status
  const handleToggleVerify = async (user: AdminUserListItem) => {
    const nextVerified = !user.isPhoneVerified;
    try {
      setActioningUserId(user.id);
      await apiClient.patch(`/admin/users/${user.id}/verify`, {
        isPhoneVerified: nextVerified,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isPhoneVerified: nextVerified } : u))
      );

      setToast({
        id: Date.now().toString(),
        title: nextVerified ? 'User Verified' : 'Verification Removed',
        message: nextVerified
          ? `"${user.name}" marked as verified.`
          : `Verification badge removed for "${user.name}".`,
        variant: 'success',
      });
    } catch (err: unknown) {
      console.error('Failed to toggle verification:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to update verification status.';
      setToast({
        id: Date.now().toString(),
        title: 'Action Failed',
        message: message || 'Failed to update verification.',
        variant: 'destructive',
      });
    } finally {
      setActioningUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-teal-700" />
              <span>User Management</span>
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {pagination.total} registered
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Inspect user profiles across Pakistan, toggle verification badges, and manage account suspensions.
          </p>
        </div>

        {/* Sync & Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {lastUpdated && (
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(pagination.page, statusFilter, roleFilter, searchQuery, true)}
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
            variant={statusFilter === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Users</span>
          </Button>

          <Button
            variant={statusFilter === 'ACTIVE' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('ACTIVE')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Active</span>
          </Button>

          <Button
            variant={statusFilter === 'BANNED' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('BANNED')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Banned</span>
          </Button>

          <Button
            variant={statusFilter === 'VERIFIED' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('VERIFIED')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </Button>

          <Button
            variant={statusFilter === 'UNVERIFIED' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter('UNVERIFIED')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Unverified</span>
          </Button>
        </div>

        {/* Search & Role Controls */}
        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <Select
            value={roleFilter}
            onValueChange={(val: 'ALL' | 'USER' | 'ADMIN') => setRoleFilter(val)}
          >
            <SelectTrigger className="h-8 text-xs w-28 bg-muted/40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Roles</SelectItem>
              <SelectItem value="USER" className="text-xs">Users</SelectItem>
              <SelectItem value="ADMIN" className="text-xs">Admins</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs bg-muted/40 border-border"
            />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(pagination.page, statusFilter, roleFilter, searchQuery)}
            className="text-xs border-destructive/30 hover:bg-destructive/15 text-destructive"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Table or Empty State */}
      {!isLoading && users.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-card border border-border rounded-2xl p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <UsersIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Users Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? 'No users matched your search criteria. Try modifying your keywords.'
                : 'No users recorded under this filter status.'}
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-xs"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <UsersTable
            users={users}
            isLoading={isLoading}
            onBanClick={handleOpenBan}
            onToggleVerify={handleToggleVerify}
            actioningUserId={actioningUserId}
          />

          {/* Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
              <div>
                Showing page <strong className="text-foreground">{pagination.page}</strong> of{' '}
                <strong className="text-foreground">{pagination.totalPages}</strong> (
                {pagination.total} users)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    fetchUsers(
                      pagination.page - 1,
                      statusFilter,
                      roleFilter,
                      searchQuery
                    )
                  }
                  disabled={!pagination.hasPrevPage || isLoading}
                  className="h-8 gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    fetchUsers(
                      pagination.page + 1,
                      statusFilter,
                      roleFilter,
                      searchQuery
                    )
                  }
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

      {/* Ban / Unban Confirmation Dialog */}
      <BanUserDialog
        user={selectedUserForBan}
        isOpen={isBanOpen}
        onClose={() => setIsBanOpen(false)}
        onConfirmBanToggle={handleConfirmBanToggle}
        isSubmitting={isSubmittingBan}
      />
    </div>
  );
}
