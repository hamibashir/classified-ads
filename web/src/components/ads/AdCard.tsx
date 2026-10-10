'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Phone, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdListItem } from '@/types/ad';
import { formatPKR, formatRelativeTime } from '@/lib/formatters';
import { formatDistance } from '@/lib/geo-utils';
import { useGeolocation } from '@/hooks/useGeolocation';

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
  const { formatDistanceTo } = useGeolocation();
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

  // Resolve display distance
  let distanceDisplay: string | null = null;
  if (ad.distanceKm !== undefined && ad.distanceKm !== null) {
    distanceDisplay = formatDistance(ad.distanceKm);
  } else if (
    ad.latitude !== null &&
    ad.latitude !== undefined &&
    ad.longitude !== null &&
    ad.longitude !== undefined
  ) {
    distanceDisplay = formatDistanceTo({
      latitude: ad.latitude,
      longitude: ad.longitude,
    });
  }

  const primaryImage = ad.images && ad.images.length > 0 ? ad.images[0].url : null;
  const locationSubtext = [
    ad.locationAddress || null,
    ad.locationCity,
  ]
    .filter(Boolean)
    .join(', ');

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I am interested in your listing: "${ad.title}" on Classified Ads PK.`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <Card
        className={`overflow-hidden group hover:shadow-md transition-all duration-200 border-border bg-card flex flex-col sm:flex-row items-stretch ${className}`}
      >
        {/* Left Thumbnail (Fixed Width on Desktop) */}
        <div className="relative w-full sm:w-60 md:w-68 shrink-0 aspect-[4/3] sm:aspect-auto bg-muted/60 flex items-center justify-center overflow-hidden">
          {primaryImage && !imgError ? (
            <img
              src={primaryImage}
              alt={ad.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground p-4 text-center">
              <ImageIcon className="h-8 w-8 opacity-40" />
              <span className="text-xs font-medium text-muted-foreground/80 line-clamp-1">
                {ad.title}
              </span>
            </div>
          )}

          {/* Floating Favorite Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-card/85 text-foreground hover:bg-card hover:scale-110 active:scale-95 transition-all shadow-xs backdrop-blur-xs z-10 cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorited
                  ? 'text-destructive fill-destructive'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            />
          </button>

          {/* Distance Badge */}
          {distanceDisplay && (
            <Badge
              variant="secondary"
              className="absolute bottom-2.5 left-2.5 bg-card/90 backdrop-blur-xs text-[11px] font-medium shadow-xs border-border/60"
            >
              📍 {distanceDisplay}
            </Badge>
          )}

          {/* Condition Badge */}
          <Badge
            variant="outline"
            className="absolute bottom-2.5 right-2.5 bg-card/90 backdrop-blur-xs text-[10px] uppercase font-mono border-border/60"
          >
            {ad.condition}
          </Badge>
        </div>

        {/* Center & Right Details */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl sm:text-2xl font-black text-price tracking-tight">
                {formatPKR(ad.price)}
              </span>
              {ad.isNegotiable ? (
                <Badge variant="price" className="text-[10px] px-2 py-0.5 font-medium">
                  Negotiable
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-mono text-muted-foreground">
                  Fixed Price
                </Badge>
              )}
            </div>

            <Link href={`/ads/${ad.slug}`} className="block">
              <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {ad.title}
              </h3>
            </Link>

            {ad.category && (
              <span className="inline-block text-xs font-medium text-slate-500 bg-muted/60 px-2 py-0.5 rounded-md">
                {ad.category.name}
              </span>
            )}
          </div>

          {/* Footer Subtext and CTAs */}
          <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-3">
              <span className="truncate">{locationSubtext}</span>
              <span>•</span>
              <span className="shrink-0">{formatRelativeTime(ad.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" className="gap-1.5 text-xs font-semibold h-9 px-4" asChild>
                <Link href={`/ads/${ad.slug}`}>
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Chat</span>
                </Link>
              </Button>

              {ad.allowWhatsapp ? (
                <Button variant="whatsapp" size="sm" className="gap-1.5 text-xs font-semibold h-9 px-4" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Phone className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9 px-4" asChild>
                  <Link href={`/ads/${ad.slug}`}>
                    <span>View Details</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // DEFAULT GRID VIEW LAYOUT
  return (
    <Card
      className={`overflow-hidden group hover:shadow-md transition-all duration-200 border-border bg-card flex flex-col justify-between ${className}`}
    >
      <div>
        {/* 4:3 Aspect Ratio Media Container */}
        <div className="relative aspect-[4/3] bg-muted/60 flex items-center justify-center overflow-hidden">
          {primaryImage && !imgError ? (
            <img
              src={primaryImage}
              alt={ad.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground p-4 text-center">
              <ImageIcon className="h-8 w-8 opacity-40" />
              <span className="text-xs font-medium text-muted-foreground/80 line-clamp-1">
                {ad.title}
              </span>
            </div>
          )}

          {/* Floating Favorite Heart Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-card/85 text-foreground hover:bg-card hover:scale-110 active:scale-95 transition-all shadow-xs backdrop-blur-xs z-10 cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorited
                  ? 'text-destructive fill-destructive'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            />
          </button>

          {/* Floating Distance Badge */}
          {distanceDisplay && (
            <Badge
              variant="secondary"
              className="absolute bottom-2.5 left-2.5 bg-card/90 backdrop-blur-xs text-[11px] font-medium shadow-xs border-border/60"
            >
              📍 {distanceDisplay}
            </Badge>
          )}

          {/* Floating Condition Badge */}
          <Badge
            variant="outline"
            className="absolute bottom-2.5 right-2.5 bg-card/90 backdrop-blur-xs text-[10px] uppercase font-mono border-border/60"
          >
            {ad.condition}
          </Badge>
        </div>

        {/* Card Header & Price Information */}
        <CardHeader className="p-4 pb-2 space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-bold text-price tracking-tight">
              {formatPKR(ad.price)}
            </span>
            {ad.isNegotiable ? (
              <Badge variant="price" className="text-[10px] px-1.5 py-0 font-medium">
                Negotiable
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-muted-foreground">
                Fixed Price
              </Badge>
            )}
          </div>

          <Link href={`/ads/${ad.slug}`} className="block">
            <CardTitle className="text-sm sm:text-base font-semibold group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {ad.title}
            </CardTitle>
          </Link>

          <CardDescription className="text-xs text-muted-foreground flex items-center justify-between pt-1">
            <span className="truncate max-w-[170px]">{locationSubtext}</span>
            <span className="shrink-0">{formatRelativeTime(ad.createdAt)}</span>
          </CardDescription>
        </CardHeader>
      </div>

      {/* Card Action Buttons (Chat & WhatsApp) */}
      <CardFooter className="p-4 pt-2 grid grid-cols-2 gap-2 border-t border-border/40 mt-2">
        <Button variant="default" size="sm" className="gap-1.5 w-full text-xs font-semibold" asChild>
          <Link href={`/ads/${ad.slug}`}>
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Chat</span>
          </Link>
        </Button>

        {ad.allowWhatsapp ? (
          <Button variant="whatsapp" size="sm" className="gap-1.5 w-full text-xs font-semibold" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Phone className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 w-full text-xs" asChild>
            <Link href={`/ads/${ad.slug}`}>
              <span>View Ad</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
