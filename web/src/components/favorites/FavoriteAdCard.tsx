import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdListItem } from '@/types/ad';
import { formatPKR } from '@/lib/formatters';
import { getConditionLabel } from '@/lib/validations/ad';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Calendar,
  ExternalLink,
  Heart,
  Loader2,
  Trash2,
} from 'lucide-react';

interface FavoriteAdCardProps {
  ad: AdListItem;
  onRemove: (adId: string) => void;
  isRemoving?: boolean;
}

export function FavoriteAdCard({
  ad,
  onRemove,
  isRemoving = false,
}: FavoriteAdCardProps) {
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
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Thumbnail & Image Overlay */}
        <div className="relative aspect-[4/3] w-full bg-muted/40 overflow-hidden">
          <Image
            src={coverImage}
            alt={ad.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-102 transition-transform duration-300"
          />

          {/* 1-Click Unfavorite Quick Button */}
          <button
            type="button"
            onClick={() => onRemove(ad.id)}
            disabled={isRemoving}
            title="Remove from Saved"
            aria-label="Remove from Saved"
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-card/90 text-rose-500 hover:bg-card hover:scale-110 active:scale-95 transition-all shadow-xs backdrop-blur-xs disabled:opacity-50 cursor-pointer"
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            )}
          </button>

          {/* Condition Tag */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-background/90 backdrop-blur-xs border border-border px-2 py-0.5 rounded-md text-foreground shadow-2xs">
              {getConditionLabel(ad.condition)}
            </span>
          </div>
        </div>

        {/* Content details */}
        <div className="p-4 space-y-2.5">
          {/* Category & Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
            <span className="font-semibold text-primary truncate">
              {ad.category?.name || 'General'}
            </span>
            <span className="shrink-0 flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3" />
              {dateFormatted}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
            <Link href={`/ads/${ad.slug}`}>{ad.title}</Link>
          </h3>

          {/* Price */}
          <div className="pt-0.5">
            <span className="text-lg font-black text-price font-mono">
              {formatPKR(ad.price)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
            <span className="truncate">
              {ad.locationAddress ? `${ad.locationAddress}, ` : ''}
              {ad.locationCity}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-0 border-t border-border/60 flex items-center justify-between gap-2 mt-2">
        <Link href={`/ads/${ad.slug}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 font-semibold text-xs gap-1.5 border-border hover:border-primary/50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Details</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          disabled={isRemoving}
          onClick={() => onRemove(ad.id)}
          title="Remove from saved"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
