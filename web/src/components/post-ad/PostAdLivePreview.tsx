'use client';

import React from 'react';
import { PostAdDraft } from '@/types/ad';
import { formatPKR, formatCompactPKR } from '@/lib/formatters';
import {
  MapPin,
  Tag,
  ImageIcon,
  Phone,
  MessageCircle,
  Eye,
  Sparkles,
} from 'lucide-react';

interface PostAdLivePreviewProps {
  draft: PostAdDraft;
  currentStep: number;
}

export const PostAdLivePreview: React.FC<PostAdLivePreviewProps> = ({
  draft,
  currentStep,
}) => {
  const images = draft.images || [];
  const coverImage = images[0];
  const numPrice = typeof draft.price === 'number' ? draft.price : 0;
  const compactText = numPrice >= 100000 ? formatCompactPKR(numPrice) : null;

  return (
    <div className="sticky top-24 space-y-4">
      {/* Header Pill */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Eye className="w-4 h-4 text-teal-600" />
          <span>Live Marketplace Preview</span>
        </div>
        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          Step {currentStep} of 5
        </span>
      </div>

      {/* Realistic Card Simulation */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden transition-all duration-300">
        {/* Cover Photo */}
        <div className="relative aspect-[4/3] w-full bg-slate-900 flex items-center justify-center overflow-hidden group">
          {coverImage ? (
            <img
              src={coverImage.url}
              alt={draft.title || 'Ad cover preview'}
              className="w-full h-full object-cover transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-slate-400">
                {images.length > 0 ? 'Loading photo...' : 'No photos uploaded yet'}
              </span>
            </div>
          )}

          {/* Photo Count Pill */}
          {images.length > 0 && (
            <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-teal-400" />
              <span>{images.length} {images.length === 1 ? 'photo' : 'photos'}</span>
            </div>
          )}

          {/* Condition Badge */}
          {draft.condition && (
            <div className="absolute top-2.5 left-2.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-800 backdrop-blur-xs shadow-xs uppercase">
                {draft.condition.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          {/* Price & Currency */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-emerald-700 tracking-tight">
                {numPrice > 0 ? formatPKR(numPrice) : 'Rs 0'}
              </span>
              {draft.isNegotiable && (
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Negotiable
                </span>
              )}
            </div>
            {compactText && numPrice >= 100000 && (
              <span className="text-[11px] font-medium text-slate-500 block">
                ≈ {compactText}
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
              {draft.title ? draft.title : (
                <span className="text-slate-400 italic font-normal">
                  Listing title will appear here...
                </span>
              )}
            </h4>
          </div>

          {/* Category Pill */}
          {(draft.categoryName || draft.subcategoryName) && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Tag className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate font-medium">
                {draft.categoryName}
                {draft.subcategoryName ? ` • ${draft.subcategoryName}` : ''}
              </span>
            </div>
          )}

          {/* Location & Contact Strip */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1 truncate max-w-[65%]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {draft.locationCity ? (
                  `${draft.locationAddress ? `${draft.locationAddress}, ` : ''}${draft.locationCity}`
                ) : (
                  'Pakistan (City not set)'
                )}
              </span>
            </div>

            {/* Contact channels */}
            <div className="flex items-center gap-1.5 shrink-0">
              {draft.allowWhatsapp !== false && (
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center" title="WhatsApp Enabled">
                  <MessageCircle className="w-3 h-3 fill-emerald-600" />
                </span>
              )}
              {draft.showPhone !== false && (
                <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center" title="Phone Calls Enabled">
                  <Phone className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seller Tips Card */}
      <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/60 text-teal-900 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-teal-950">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Quick Tip for Sellers</span>
        </div>
        <p className="text-[11px] leading-relaxed text-teal-800">
          Ads with 3+ clear photos and realistic PKR pricing sell up to 4x faster on Zaaz B.
        </p>
      </div>
    </div>
  );
};
