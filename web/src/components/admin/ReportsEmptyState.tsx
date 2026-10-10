'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportsEmptyStateProps {
  statusFilter?: string;
  isSearchFiltered?: boolean;
  onClearFilters?: () => void;
}

export const ReportsEmptyState: React.FC<ReportsEmptyStateProps> = ({
  statusFilter,
  isSearchFiltered = false,
  onClearFilters,
}) => {
  if (isSearchFiltered) {
    return (
      <div className="py-16 text-center space-y-4 bg-card border border-border rounded-2xl p-8">
        <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">No Matching Reports</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No reports matched your search keyword. Try clearing or broadening your search.
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
        <ShieldCheck className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-foreground">
          {statusFilter === 'PENDING'
            ? 'No Pending User Reports'
            : statusFilter === 'RESOLVED'
            ? 'No Resolved Reports'
            : statusFilter === 'DISMISSED'
            ? 'No Dismissed Reports'
            : 'Zero Reports Filed'}
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          {statusFilter === 'PENDING'
            ? 'The moderation queue has no pending user flags requiring action. Listings reported by users for spam or policy violations will appear here.'
            : 'There are currently no reports recorded in this view.'}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
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
