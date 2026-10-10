import React from 'react';
import { AdStatus } from '@/types/ad';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, XCircle, AlertTriangle } from 'lucide-react';

interface MyAdsStatusBadgeProps {
  status: AdStatus;
  className?: string;
}

export function MyAdsStatusBadge({ status, className }: MyAdsStatusBadgeProps) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge
          variant="outline"
          className={`border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold gap-1.5 px-2.5 py-0.5 text-xs ${className || ''}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active / Live</span>
        </Badge>
      );

    case 'PENDING':
      return (
        <Badge
          variant="outline"
          className={`border-amber-200 bg-amber-50 text-amber-800 font-semibold gap-1.5 px-2.5 py-0.5 text-xs ${className || ''}`}
        >
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Under Review</span>
        </Badge>
      );

    case 'SOLD':
      return (
        <Badge
          variant="outline"
          className={`border-zinc-300 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-semibold gap-1.5 px-2.5 py-0.5 text-xs ${className || ''}`}
        >
          <Check className="w-3 h-3 text-zinc-500" />
          <span>Sold</span>
        </Badge>
      );

    case 'REJECTED':
      return (
        <Badge
          variant="outline"
          className={`border-rose-200 bg-rose-50 text-rose-700 font-semibold gap-1.5 px-2.5 py-0.5 text-xs ${className || ''}`}
        >
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Action Required</span>
        </Badge>
      );

    case 'EXPIRED':
      return (
        <Badge
          variant="outline"
          className={`border-orange-200 bg-orange-50 text-orange-800 font-semibold gap-1.5 px-2.5 py-0.5 text-xs ${className || ''}`}
        >
          <AlertTriangle className="w-3 h-3 text-orange-600" />
          <span>Expired</span>
        </Badge>
      );

    default:
      return (
        <Badge variant="outline" className={`font-semibold text-xs ${className || ''}`}>
          {status}
        </Badge>
      );
  }
}
