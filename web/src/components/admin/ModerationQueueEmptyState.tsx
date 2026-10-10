'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Settings, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModerationQueueEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export const ModerationQueueEmptyState: React.FC<ModerationQueueEmptyStateProps> = ({
  isFiltered = false,
  onClearFilters,
}) => {
  if (isFiltered) {
    return (
      <div className="py-16 text-center space-y-4 bg-card border border-border rounded-2xl p-8">
        <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">No Listings Match Filter</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No pending ads matched your search criteria. Try modifying or clearing your filters.
          </p>
        </div>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="text-xs">
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="py-16 text-center space-y-4 bg-card border border-border rounded-2xl p-8 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-foreground">Moderation Queue is Clear</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          All submitted marketplace listings have been reviewed. When sellers post new ads with automated approval disabled, they will appear here awaiting authorization.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
          <Link href="/admin/settings">
            <Settings className="w-3.5 h-3.5" />
            <span>Check Settings</span>
          </Link>
        </Button>
        <Button asChild variant="default" size="sm" className="text-xs gap-1.5">
          <Link href="/admin">
            <span>Admin Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
