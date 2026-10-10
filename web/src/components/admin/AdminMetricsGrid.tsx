'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { AdminDashboardMetrics } from '@/types/admin';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

interface AdminMetricsGridProps {
  metrics: AdminDashboardMetrics | null;
  isLoading?: boolean;
}

export const AdminMetricsGrid: React.FC<AdminMetricsGridProps> = ({
  metrics,
  isLoading = false,
}) => {
  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-muted" />
                  <div className="w-12 h-4 rounded-full bg-muted" />
                </div>
                <div className="w-16 h-7 rounded bg-muted" />
                <div className="w-24 h-3 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const KPI_CARDS = [
    {
      title: 'Total Ads',
      count: metrics.totalAds,
      subtitle: 'All-time listings',
      icon: Layers,
      color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
      badge: `${metrics.activeAds + metrics.pendingAds} in rotation`,
      badgeVariant: 'outline' as const,
      href: null,
    },
    {
      title: 'Pending Review',
      count: metrics.pendingAds,
      subtitle: 'Awaiting moderation',
      icon: Clock,
      color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
      badge: metrics.pendingAds > 0 ? 'Action Required' : 'Queue Clear',
      badgeVariant: (metrics.pendingAds > 0 ? 'destructive' : 'secondary') as BadgeVariant,
      href: '/admin/moderation',
    },
    {
      title: 'Active Ads',
      count: metrics.activeAds,
      subtitle: 'Live on marketplace',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Publicly visible',
      badgeVariant: 'secondary' as BadgeVariant,
      href: null,
    },
    {
      title: 'Total Users',
      count: metrics.totalUsers,
      subtitle: 'Registered accounts',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
      badge: 'Active community',
      badgeVariant: 'outline' as BadgeVariant,
      href: '/admin/users',
    },
    {
      title: 'Unresolved Reports',
      count: metrics.unresolvedReports,
      subtitle: 'Flagged by consumers',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
      badge: metrics.unresolvedReports > 0 ? 'Urgent' : 'All Resolved',
      badgeVariant: (metrics.unresolvedReports > 0 ? 'destructive' : 'secondary') as BadgeVariant,
      href: '/admin/reports',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          const cardContent = (
            <Card
              key={kpi.title}
              className={`transition-all ${
                kpi.href
                  ? 'hover:border-primary/50 hover:shadow-sm cursor-pointer group'
                  : ''
              }`}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant={kpi.badgeVariant} className="text-[10px] px-2 py-0.5">
                    {kpi.badge}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono">
                    {kpi.count.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {kpi.title}
                    </span>
                    {kpi.href && (
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                    {kpi.subtitle}
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          if (kpi.href) {
            return (
              <Link key={kpi.title} href={kpi.href} className="block">
                {cardContent}
              </Link>
            );
          }

          return <div key={kpi.title}>{cardContent}</div>;
        })}
      </div>

      {/* Auxiliary Lifecycle Pills */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Marketplace Lifecycle:</span>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border">
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sold Listings:</span>
          <span className="font-mono font-bold text-foreground">{metrics.soldAds.toLocaleString()}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Rejected Policy Violations:</span>
          <span className="font-mono font-bold text-foreground">{metrics.rejectedAds.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
