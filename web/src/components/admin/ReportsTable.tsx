'use client';

import React from 'react';
import Link from 'next/link';
import {
  Tag,
  User as UserIcon,
  Mail,
  ExternalLink,
  Clock,
  Trash2,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserReportDetail } from '@/types/admin';
import { formatPKR, formatRelativeTime } from '@/lib/formatters';

interface ReportsTableProps {
  reports: UserReportDetail[];
  isLoading?: boolean;
  onTakeDown?: (report: UserReportDetail) => void;
  onDismiss?: (report: UserReportDetail) => Promise<void>;
  actioningId?: string | null;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  isLoading = false,
  onTakeDown,
  onDismiss,
  actioningId = null,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[300px]">Reported Listing</TableHead>
              <TableHead className="w-[260px]">Violation Reason</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Filed</TableHead>
              <TableHead>Report Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell><div className="w-48 h-10 bg-muted rounded" /></TableCell>
                <TableCell><div className="w-40 h-8 bg-muted rounded" /></TableCell>
                <TableCell><div className="w-24 h-4 bg-muted rounded" /></TableCell>
                <TableCell><div className="w-20 h-4 bg-muted rounded" /></TableCell>
                <TableCell><div className="w-16 h-4 bg-muted rounded" /></TableCell>
                <TableCell className="text-right"><div className="w-24 h-7 bg-muted rounded ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[300px]">Reported Listing</TableHead>
            <TableHead className="w-[260px]">Violation Reason</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Filed</TableHead>
            <TableHead>Report Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reports.map((report) => {
            const ad = report.ad;
            const coverImage = ad?.images?.[0];

            return (
              <TableRow key={report.id} className="hover:bg-muted/40 transition-colors">
                {/* Reported Ad Column */}
                <TableCell>
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      {coverImage?.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={coverImage.url}
                          alt={ad?.title || 'Reported Ad'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Tag className="w-5 h-5 text-muted-foreground/30" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      {ad ? (
                        <Link
                          href={`/ads/${ad.slug}`}
                          target="_blank"
                          className="text-xs font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                        >
                          {ad.title}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground italic">
                          Listing Deleted
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {ad?.price !== undefined && (
                          <span className="text-[11px] font-mono font-bold text-emerald-600">
                            {formatPKR(ad.price)}
                          </span>
                        )}
                        {ad?.status && (
                          <Badge
                            variant={ad.status === 'ACTIVE' ? 'success' : 'destructive'}
                            className="text-[9px] px-1.5 py-0 font-mono uppercase"
                          >
                            Ad: {ad.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Violation Reason Column */}
                <TableCell>
                  <div className="space-y-1 py-1">
                    <Badge variant="destructive" className="text-[10px] font-mono uppercase px-1.5 py-0.5">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {report.reason}
                    </Badge>

                    {report.details && (
                      <p className="text-[11px] text-muted-foreground italic line-clamp-2 leading-relaxed">
                        &quot;{report.details}&quot;
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Reporter Column */}
                <TableCell>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate max-w-[120px]">{report.reporter.name}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate max-w-[120px]">{report.reporter.email}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Filed At Column */}
                <TableCell>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(report.createdAt)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>

                {/* Status Column */}
                <TableCell>
                  <Badge
                    variant={
                      report.status === 'PENDING'
                        ? 'destructive'
                        : report.status === 'RESOLVED'
                        ? 'success'
                        : 'secondary'
                    }
                    className="text-[10px] font-mono uppercase"
                  >
                    {report.status}
                  </Badge>
                </TableCell>

                {/* Actions Column */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {report.status === 'PENDING' && onTakeDown && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={actioningId === report.id}
                        onClick={() => onTakeDown(report)}
                        className="h-8 text-xs gap-1 shadow-2xs font-semibold"
                      >
                        {actioningId === report.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Take Down</span>
                      </Button>
                    )}

                    {report.status === 'PENDING' && onDismiss && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={actioningId === report.id}
                        onClick={() => onDismiss(report)}
                        className="h-8 text-xs gap-1 border-border hover:bg-muted font-medium"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Dismiss</span>
                      </Button>
                    )}

                    {ad?.slug && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Link href={`/ads/${ad.slug}`} target="_blank">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Inspect</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
