'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Tag,
  User as UserIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecentPendingAdSummary, RecentReportSummary } from '@/types/admin';
import { formatPKR, formatRelativeTime } from '@/lib/formatters';

interface AdminDashboardWidgetsProps {
  pendingAds: RecentPendingAdSummary[];
  recentReports: RecentReportSummary[];
  isLoading?: boolean;
}

export const AdminDashboardWidgets: React.FC<AdminDashboardWidgetsProps> = ({
  pendingAds,
  recentReports,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="h-16 bg-muted/30" />
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 rounded-xl bg-muted/40" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Widget 1: Pending Ads Awaiting Moderation */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Awaiting Moderation
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  Pending marketplace listings requiring review
                </div>
              </div>
            </div>

            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link href="/admin/moderation">
                <span>View Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1">
          {pendingAds.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                Moderation Queue Clear
              </div>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                All submitted listings have been processed. New submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {pendingAds.map((ad) => (
                <div
                  key={ad.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      {ad.images?.[0]?.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={ad.images[0].url}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Tag className="w-5 h-5 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {ad.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-mono font-bold text-emerald-600">
                          {formatPKR(ad.price)}
                        </span>
                        <span>•</span>
                        <span className="truncate">{ad.category.name}</span>
                        <span>•</span>
                        <span className="text-[10px]">{formatRelativeTime(ad.createdAt)}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        Seller: {ad.user.name} ({ad.user.email})
                      </div>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="outline" className="h-8 text-xs shrink-0">
                    <Link href={`/admin/moderation`}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-500" />
                      Review
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Widget 2: Recent User Reports */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  User Flagged Reports
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  Violations reported by marketplace visitors
                </div>
              </div>
            </div>

            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link href="/admin/reports">
                <span>View Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1">
          {recentReports.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                No Pending Reports
              </div>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Zero active user reports. Community flags and abuse reports will be queued here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px] font-mono uppercase px-1.5 py-0">
                        {report.reason}
                      </Badge>
                      <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {report.ad.title}
                      </span>
                    </div>

                    {report.details && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                        &quot;{report.details}&quot;
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {report.reporter.name}
                      </span>
                      <span>•</span>
                      <span>{formatRelativeTime(report.createdAt)}</span>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="outline" className="h-8 text-xs shrink-0">
                    <Link href="/admin/reports">
                      Inspect
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
