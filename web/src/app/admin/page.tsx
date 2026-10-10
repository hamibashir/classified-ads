'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  FolderTree,
  Users,
  Settings,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { AdminDashboardResponseData } from '@/types/admin';
import { AdminMetricsGrid } from '@/components/admin/AdminMetricsGrid';
import { AdminDashboardWidgets } from '@/components/admin/AdminDashboardWidgets';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const response = await apiClient.get<AdminDashboardResponseData>('/admin/dashboard');
      if (response.data) {
        setData(response.data);
        setLastUpdated(new Date());
      }
    } catch (err: unknown) {
      console.error('Failed to fetch admin metrics:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to connect to administrative metrics service. Please ensure server is running.';
      setError(
        message ||
        'Failed to connect to administrative metrics service. Please ensure server is running.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const QUICK_ACTIONS = [
    {
      title: 'Ad Moderation Queue',
      description: 'Review pending ads, approve quality listings, or reject policy violations.',
      href: '/admin/moderation',
      icon: ShieldCheck,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      actionText: 'Review Queue',
    },
    {
      title: 'User Reports',
      description: 'Investigate flagged listings, spam reports, and offensive marketplace activity.',
      href: '/admin/reports',
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      actionText: 'Inspect Reports',
    },
    {
      title: 'Categories & Taxonomy',
      description: 'Manage root categories, subcategories, icon mappings, and slugs.',
      href: '/admin/categories',
      icon: FolderTree,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      actionText: 'Manage Categories',
    },
    {
      title: 'User Management',
      description: 'Search accounts, view verification status, and toggle account suspensions.',
      href: '/admin/users',
      icon: Users,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      actionText: 'View Users',
    },
    {
      title: 'System Settings',
      description: 'Configure auto-approve toggles, ad image limits, and expiration windows.',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      actionText: 'System Settings',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner with Live Refresh Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-primary p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Classified Ads PK Administration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Administrator'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Marketplace health overview, moderation metrics, and governance controls.
          </p>
        </div>

        {/* Live Refresh Header Control */}
        <div className="relative z-10 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            disabled={isLoading || isRefreshing}
            className="gap-2 text-xs font-semibold shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </Button>

          {lastUpdated && (
            <span className="text-[10px] text-slate-400 font-mono">
              Synced: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchDashboardData(false)}
            className="shrink-0 text-xs border-destructive/30 hover:bg-destructive/10"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 5 Core Metrics Grid (Task 10.2) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Platform Metrics</h3>
            <p className="text-xs text-muted-foreground">
              Aggregated KPI counts from live database
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Live DB Aggregations
          </span>
        </div>

        <AdminMetricsGrid
          metrics={data?.metrics || null}
          isLoading={isLoading}
        />
      </section>

      {/* Recent Activity Feeds */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Actionable Queues</h3>
            <p className="text-xs text-muted-foreground">
              Pending submissions and user reports requiring admin review
            </p>
          </div>
        </div>

        <AdminDashboardWidgets
          pendingAds={data?.recentActivity?.recentPendingAds || []}
          recentReports={data?.recentActivity?.recentReports || []}
          isLoading={isLoading}
        />
      </section>

      {/* Quick Navigation Cards */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Administration Modules</h3>
          <p className="text-xs text-muted-foreground">Direct access to core governance controls</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.href}
                className="hover:border-primary/50 transition-all hover:shadow-sm group flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${action.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors pt-2">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed line-clamp-2">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-xs group-hover:border-primary/40"
                  >
                    <Link href={action.href}>
                      <span>{action.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
