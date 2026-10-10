'use client';

import React from 'react';

export const AdCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col h-full animate-pulse">
      {/* 4:3 Image Skeleton */}
      <div className="relative aspect-4/3 w-full bg-slate-200">
        <div className="absolute top-2.5 left-2.5 w-16 h-5 rounded-full bg-slate-300" />
        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-300" />
      </div>

      {/* Content Skeleton */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          {/* Price Bar */}
          <div className="h-6 w-28 sm:w-36 bg-slate-200 rounded" />
          {/* Title Lines */}
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
        </div>

        {/* Location & Time */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
            <div className="h-3.5 w-16 bg-slate-200 rounded" />
          </div>
          {/* Action Button */}
          <div className="h-8 w-full bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
