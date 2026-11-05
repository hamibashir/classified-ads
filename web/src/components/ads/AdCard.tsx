'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Image as ImageIcon, MapPin, Camera, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AdListItem } from '@/types/ad';
import { formatPKR, formatRelativeTime } from '@/lib/formatters';

interface AdCardProps {
  ad: AdListItem;
  viewMode?: 'grid' | 'list';
  onFavoriteToggle?: (adId: string, isFavorited: boolean) => void;
  className?: string;
}

export const AdCard: React.FC<AdCardProps> = ({
  ad,
  viewMode = 'grid',
  onFavoriteToggle,
  className = '',
}) => {
  const [isFavorited, setIsFavorited] = useState<boolean>(ad.isFavorited || false);
  const [imgError, setImgError] = useState<boolean>(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isFavorited;
    setIsFavorited(nextState);
    if (onFavoriteToggle) {
      onFavoriteToggle(ad.id, nextState);
    }
  };

  const primaryImage = ad.images && ad.images.length > 0 ? ad.images[0].url : null;
  const imageCount = ad.images ? ad.images.length : 0;
  const isVerifiedSeller = ad.user?.isPhoneVerified ?? ad.seller?.isPhoneVerified;

  const locationSubtext = [
    ad.locationAddress || null,
    ad.locationCity,
  ]
    .filter(Boolean)
    .join(', ');

  // COMPACT & PREMIUM LIST VIEW
  if (viewMode === 'list') {
    return (
      <Link href={`/ads/${ad.slug}`} className="block group">
        <Card
          className={`overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors duration-150 border-border/80 bg-card rounded-xl flex flex-col sm:flex-row items-stretch ${className}`}
        >
          {/* Left Thumbnail Container */}
          <div className="relative w-full sm:w-48 md:w-56 shrink-0 aspect-[16/10] sm:aspect-auto bg-muted/40 flex items-center justify-center overflow-hidden ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]">
            {primaryImage && !imgError ? (
              <img
                src={primaryImage}
                alt={ad.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground p-3 text-center">
                <ImageIcon className="h-6 w-6 opacity-30" />
                <span className="text-[11px] font-medium text-muted-foreground/70 line-clamp-1">
                  {ad.title}
                </span>
              </div>
            )}

            {/* Featured Ribbon */}
            {ad.isFeatured && (
              <span className="absolute top-2 left-2 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-black/65 backdrop-blur-xs text-amber-300 border border-amber-400/20">
                Featured
              </span>
            )}

            {/* Micro Favorite Button */}
            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-xs flex items-center justify-center transition-colors z-10 cursor-pointer"
            >
              <Heart
                className={`h-3.5 w-3.5 transition-colors ${
                  isFavorited
                    ? 'text-red-500 fill-red-500'
                    : 'text-white/90 hover:text-white'
                }`}
              />
            </button>

            {/* Subtle Photo Count */}
            {imageCount > 1 && (
              <span className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-xs text-white/90">
                <Camera className="w-2.5 h-2.5" />
                <span>{imageCount}</span>
              </span>
            )}
          </div>

          {/* Details Body */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between gap-2 min-w-0">
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base sm:text-lg font-bold text-price tracking-tight tabular-nums">
                  {formatPKR(ad.price)}
                </span>
                {ad.isNegotiable && (
                  <span className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-600/20 px-1.5 py-0.2 rounded">
                    Negotiable
                  </span>
                )}
              </div>

              <h3 className="text-xs sm:text-sm font-medium text-foreground group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                {ad.title}
              </h3>

              {ad.category && (
                <span className="inline-block text-[10px] font-medium text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded">
                  {ad.category.name}
                </span>
              )}
            </div>

            {/* Bottom Meta */}
            <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 truncate text-zinc-500 dark:text-zinc-400">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{locationSubtext}</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {isVerifiedSeller && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified</span>
                  </span>
                )}
                <span className="text-zinc-400 text-[10px]">
                  {formatRelativeTime(ad.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // COMPACT & PREMIUM GRID VIEW
  return (
    <Link href={`/ads/${ad.slug}`} className="block group">
      <Card
        className={`overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors duration-150 border-border/80 bg-card rounded-xl flex flex-col justify-between h-full ${className}`}
      >
        <div>
          {/* Media Container (16:10 Ratio, Crisp Inset Ring) */}
          <div className="relative aspect-[16/10] bg-muted/40 flex items-center justify-center overflow-hidden ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.06]">
            {primaryImage && !imgError ? (
              <img
                src={primaryImage}
                alt={ad.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground p-3 text-center">
                <ImageIcon className="h-6 w-6 opacity-30" />
                <span className="text-[11px] font-medium text-muted-foreground/70 line-clamp-1">
                  {ad.title}
                </span>
              </div>
            )}

            {/* Featured Badge */}
            {ad.isFeatured && (
              <span className="absolute top-2 left-2 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-black/65 backdrop-blur-xs text-amber-300 border border-amber-400/20">
                Featured
              </span>
            )}

            {/* Floating Micro Favorite Button */}
            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-xs flex items-center justify-center transition-colors z-10 cursor-pointer"
            >
              <Heart
                className={`h-3.5 w-3.5 transition-colors ${
                  isFavorited
                    ? 'text-red-500 fill-red-500'
                    : 'text-white/90 hover:text-white'
                }`}
              />
            </button>

            {/* Multi-Photo Count Indicator */}
            {imageCount > 1 && (
              <span className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-xs text-white/90">
                <Camera className="w-2.5 h-2.5" />
                <span>{imageCount}</span>
              </span>
            )}
          </div>

          {/* Compact Body: Price, Category Eyebrow & Title */}
          <div className="p-3 pb-1.5 space-y-1">
            <div className="flex items-baseline justify-between gap-1.5">
              <span className="text-base sm:text-[17px] font-bold text-price tracking-tight tabular-nums">
                {formatPKR(ad.price)}
              </span>
              {ad.isNegotiable && (
                <span className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-600/20 px-1.5 py-0.2 rounded">
                  Negotiable
                </span>
              )}
            </div>

            <h3 className="text-xs sm:text-[13px] font-medium text-foreground group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
              {ad.title}
            </h3>
          </div>
        </div>

        {/* Minimal Bottom Location & Date Bar */}
        <div className="px-3 pb-2.5 pt-2 text-[11px] text-muted-foreground flex items-center justify-between gap-1.5 border-t border-border/40 mt-1">
          <span className="flex items-center gap-1 truncate text-zinc-500 dark:text-zinc-400">
            <MapPin className="w-3 h-3 shrink-0 text-zinc-400" />
            <span className="truncate">{locationSubtext}</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isVerifiedSeller && (
              <span title="Verified Seller" className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
              </span>
            )}
            <span className="text-zinc-400 text-[10px]">
              {formatRelativeTime(ad.createdAt)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
