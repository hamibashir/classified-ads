import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MyAdListItem } from '@/types/ad';
import { MyAdsStatusBadge } from './MyAdsStatusBadge';
import { formatPKR } from '@/lib/formatters';
import { getConditionLabel } from '@/lib/validations/ad';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  ExternalLink,
  Clock,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Loader2,
} from 'lucide-react';

interface MyAdCardProps {
  ad: MyAdListItem;
  onUpdateStatus?: (adId: string, status: 'ACTIVE' | 'SOLD') => void;
  onRequestDelete?: (ad: MyAdListItem) => void;
  isUpdatingStatus?: boolean;
}

export function MyAdCard({
  ad,
  onUpdateStatus,
  onRequestDelete,
  isUpdatingStatus = false,
}: MyAdCardProps) {
  const coverImage =
    ad.images && ad.images.length > 0
      ? ad.images[0].url
      : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800';

  const dateFormatted = new Date(ad.createdAt).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-56 h-48 sm:h-auto shrink-0 bg-muted/30">
        <Image
          src={coverImage}
          alt={ad.title}
          fill
          sizes="(max-width: 640px) 100vw, 224px"
          className="object-cover"
        />
        <div className="absolute top-2.5 left-2.5">
          <MyAdsStatusBadge status={ad.status} />
        </div>
        {ad.images && ad.images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <span>+{ad.images.length - 1} photos</span>
          </div>
        )}
      </div>

      {/* Details & Metrics */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Category & Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground gap-2 pb-1">
            <span className="font-semibold text-primary truncate">
              {ad.category?.name || 'General'}
            </span>
            <span className="shrink-0 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dateFormatted}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg text-foreground line-clamp-1 hover:text-primary transition-colors">
            {ad.status === 'ACTIVE' ? (
              <Link href={`/ads/${ad.slug}`}>{ad.title}</Link>
            ) : (
              <span>{ad.title}</span>
            )}
          </h3>

          {/* Price & Condition */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg sm:text-xl font-black text-price font-mono">
              {formatPKR(ad.price)}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {getConditionLabel(ad.condition)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
            <span className="truncate">
              {ad.locationAddress ? `${ad.locationAddress}, ` : ''}
              {ad.locationCity}
              {ad.locationState ? `, ${ad.locationState}` : ''}
            </span>
          </div>
        </div>

        {/* Footer Metrics & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border mt-1">
          {/* Analytics counters */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1" title="Views">
              <Eye className="w-3.5 h-3.5 text-muted-foreground/70" />
              <span className="font-semibold text-foreground">
                {ad.viewsCount || 0}
              </span>
              <span className="hidden xs:inline">views</span>
            </div>
            <div className="flex items-center gap-1" title="Favorites">
              <Heart className="w-3.5 h-3.5 text-rose-500/80" />
              <span className="font-semibold text-foreground">
                {ad.favoritesCount || 0}
              </span>
              <span className="hidden xs:inline">saved</span>
            </div>
            <div className="flex items-center gap-1" title="Chat Inquiries">
              <MessageSquare className="w-3.5 h-3.5 text-primary/80" />
              <span className="font-semibold text-foreground">
                {ad.conversationsCount || 0}
              </span>
              <span className="hidden xs:inline">inquiries</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Mark as Sold button */}
            {ad.status === 'ACTIVE' && onUpdateStatus && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 font-semibold text-xs gap-1.5 border-border hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400"
                disabled={isUpdatingStatus}
                onClick={() => onUpdateStatus(ad.id, 'SOLD')}
                title="Mark this item as sold"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Mark Sold</span>
              </Button>
            )}

            {/* Reactivate button */}
            {ad.status === 'SOLD' && onUpdateStatus && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 font-semibold text-xs gap-1.5 border-border hover:border-primary/50"
                disabled={isUpdatingStatus}
                onClick={() => onUpdateStatus(ad.id, 'ACTIVE')}
                title="Relist this item as active"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5 text-primary" />
                )}
                <span>Reactivate</span>
              </Button>
            )}

            {/* View Live Ad link */}
            {ad.status === 'ACTIVE' && (
              <Link href={`/ads/${ad.slug}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 font-semibold text-xs gap-1.5 border-border hover:border-primary/50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View</span>
                </Button>
              </Link>
            )}

            {/* Pending notice */}
            {ad.status === 'PENDING' && (
              <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>In Review</span>
              </span>
            )}

            {/* Delete button */}
            {onRequestDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRequestDelete(ad)}
                title="Delete listing permanently"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="sr-only sm:not-sr-only sm:inline text-xs font-normal">
                  Delete
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

