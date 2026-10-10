'use client';

import React from 'react';
import Link from 'next/link';
import {
  Tag,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
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
import { PendingAdDetail } from '@/types/admin';
import { formatPKR, formatRelativeTime } from '@/lib/formatters';

interface ModerationQueueTableProps {
  ads: PendingAdDetail[];
  isLoading?: boolean;
  onApprove?: (ad: PendingAdDetail) => Promise<void>;
  onReject?: (ad: PendingAdDetail) => void;
  actioningId?: string | null;
}

export const ModerationQueueTable: React.FC<ModerationQueueTableProps> = ({
  ads,
  isLoading = false,
  onApprove,
  onReject,
  actioningId = null,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[320px]">Listing</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-36 h-3.5 bg-muted rounded" />
                      <div className="w-24 h-2.5 bg-muted rounded" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><div className="w-20 h-4 bg-muted rounded" /></TableCell>
                <TableCell><div className="w-16 h-4 bg-muted rounded" /></TableCell>
                <TableCell><div className="w-24 h-4 bg-muted rounded" /></TableCell>
                <TableCell><div className="w-20 h-4 bg-muted rounded" /></TableCell>
                <TableCell><div className="w-16 h-4 bg-muted rounded" /></TableCell>
                <TableCell className="text-right"><div className="w-16 h-7 bg-muted rounded ml-auto" /></TableCell>
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
            <TableHead className="w-[320px]">Listing Details</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price (PKR)</TableHead>
            <TableHead>Seller Contact</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {ads.map((ad) => {
            const coverImage = ad.images?.find((img) => img.order === 0) || ad.images?.[0];

            return (
              <TableRow key={ad.id} className="hover:bg-muted/40 transition-colors">
                {/* Thumbnail & Title Column */}
                <TableCell>
                  <div className="flex items-start gap-3 py-1">
                    <div className="w-14 h-14 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      {coverImage?.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={coverImage.url}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Tag className="w-6 h-6 text-muted-foreground/30" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/ads/${ad.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                      >
                        {ad.title}
                      </Link>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
                          {ad.condition.replace('_', ' ')}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{ad.locationCity}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Category Column */}
                <TableCell>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {ad.category?.name || 'Uncategorized'}
                  </Badge>
                </TableCell>

                {/* Price Column */}
                <TableCell>
                  <span className="text-sm font-bold font-mono text-emerald-600">
                    {formatPKR(ad.price)}
                  </span>
                </TableCell>

                {/* Seller Info Column */}
                <TableCell>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate max-w-[130px]">{ad.user?.name}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate max-w-[130px]">{ad.user?.email}</span>
                    </div>
                    {ad.user?.phone && (
                      <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span>{ad.user.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Submission Timestamp Column */}
                <TableCell>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(ad.createdAt)}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>

                {/* Status Column */}
                <TableCell>
                  <Badge
                    variant="destructive"
                    className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                  >
                    PENDING REVIEW
                  </Badge>
                </TableCell>

                {/* Action Trigger Column */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onApprove && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={actioningId === ad.id}
                        onClick={() => onApprove(ad)}
                        className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs font-semibold"
                      >
                        {actioningId === ad.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">Approve</span>
                      </Button>
                    )}

                    {onReject && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={actioningId === ad.id}
                        onClick={() => onReject(ad)}
                        className="h-8 text-xs gap-1 shadow-2xs font-semibold"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    )}

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1 border-border hover:bg-muted"
                    >
                      <Link href={`/ads/${ad.slug}`} target="_blank">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Preview</span>
                      </Link>
                    </Button>
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
