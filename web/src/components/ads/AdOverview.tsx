'use client';

import React from 'react';
import {
  MapPin,
  Clock,
  Eye,
  Tag,
  CheckCircle2,
  Share2,
  Heart,
} from 'lucide-react';
import { AdListItem } from '@/types/ad';
import { formatPKR, formatRelativeTime } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShareAdModal } from './ShareAdModal';

interface AdOverviewProps {
  ad: AdListItem;
  onFavoriteToggle?: (isFavorited: boolean) => void;
}

export const AdOverview: React.FC<AdOverviewProps> = ({ ad, onFavoriteToggle }) => {
  const [favorited, setFavorited] = React.useState(ad.isFavorited || false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  const handleFavorite = () => {
    const next = !favorited;
    setFavorited(next);
    if (onFavoriteToggle) onFavoriteToggle(next);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Price & Action Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Price Tag */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                {formatPKR(ad.price)}
              </span>
              {ad.isNegotiable && (
                <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-800 bg-emerald-50">
                  Negotiable
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">All prices in Pakistani Rupee (PKR)</p>
          </div>

          {/* Favorite & Share Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFavorite}
              className={`h-9 px-3 gap-1.5 text-xs font-semibold ${
                favorited ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{favorited ? 'Saved' : 'Save Ad'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-9 px-3 gap-1.5 text-xs font-semibold text-slate-600"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Ad Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {ad.title}
        </h1>

        {/* Badges Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge
            variant={ad.condition === 'NEW' ? 'success' : 'secondary'}
            className="text-xs font-semibold uppercase px-2.5 py-0.5"
          >
            {ad.condition === 'NEW' ? 'Brand New' : 'Used / Pre-Owned'}
          </Badge>
          {ad.category && (
            <Badge variant="outline" className="text-xs text-teal-800 border-teal-200 bg-teal-50 gap-1">
              <Tag className="w-3 h-3 text-teal-600" />
              {ad.category.name}
            </Badge>
          )}
          {ad.isFeatured && (
            <Badge variant="default" className="text-xs bg-amber-600 text-white font-semibold">
              Featured Listing
            </Badge>
          )}
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {ad.locationAddress ? `${ad.locationAddress}, ` : ''}
              {ad.locationCity}
            </span>
          </span>

          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Posted {formatRelativeTime(ad.createdAt)}</span>
          </span>

          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{(ad.viewsCount || 0).toLocaleString()} Views</span>
          </span>
        </div>
      </div>

      {/* Key Specifications Table Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>Listing Specifications</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Category</span>
            <span className="font-semibold text-slate-800 truncate block">
              {ad.category?.name || 'General'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Condition</span>
            <span className="font-semibold text-slate-800 block">
              {ad.condition === 'NEW' ? 'Brand New' : 'Used'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Price Type</span>
            <span className="font-semibold text-slate-800 block">
              {ad.isNegotiable ? 'Negotiable' : 'Fixed Price'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">City / Province</span>
            <span className="font-semibold text-slate-800 truncate block">
              {ad.locationCity}, {ad.locationState || 'PK'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Area / Neighborhood</span>
            <span className="font-semibold text-slate-800 truncate block">
              {ad.locationAddress || ad.locationCity}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 block font-medium">Listing ID</span>
            <span className="font-mono text-slate-800 truncate block">
              {ad.id.slice(0, 12)}
            </span>
          </div>
        </div>
      </div>

      {/* Description Section Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">Description</h2>
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
          {ad.description ||
            `Detailed listing description for ${ad.title}. Please contact the seller directly for inquiries, vehicle inspection, or purchase negotiations.`}
        </div>
      </div>

      {/* Share Ad Modal */}
      <ShareAdModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        adTitle={ad.title}
        adPrice={ad.price}
      />
    </div>
  );
};
