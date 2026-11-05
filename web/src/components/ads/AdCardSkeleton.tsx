'use client';

import React from 'react';

export const AdCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden flex flex-col h-full animate-pulse">
      {/* 16:10 Image Skeleton */}
      <div className="relative aspect-[16/10] w-full bg-muted/60">
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted" />
      </div>

      {/* Content Skeleton */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-1.5">
          {/* Price Bar */}
          <div className="h-5 w-24 sm:w-28 bg-muted rounded" />
          {/* Title Lines */}
          <div className="h-3.5 w-full bg-muted rounded" />
          <div className="h-3.5 w-2/3 bg-muted rounded" />
        </div>

        {/* Location & Time Bottom Row */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <div className="h-2.5 w-20 bg-muted rounded" />
          <div className="h-2.5 w-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
};
