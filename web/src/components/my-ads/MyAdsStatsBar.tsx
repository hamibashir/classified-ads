import React from 'react';
import { Layers, CheckCircle2, Clock, Check } from 'lucide-react';
import { MyAdsFilterTab } from '@/types/ad';

interface MyAdsStatsBarProps {
  total: number;
  activeCount: number;
  pendingCount: number;
  soldCount: number;
  currentTab?: MyAdsFilterTab;
  onSelectTab?: (tab: MyAdsFilterTab) => void;
  className?: string;
}

export function MyAdsStatsBar({
  total,
  activeCount,
  pendingCount,
  soldCount,
  currentTab,
  onSelectTab,
  className,
}: MyAdsStatsBarProps) {
  const stats: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    textColor: string;
    tab: MyAdsFilterTab;
  }[] = [
    {
      label: 'Total Listings',
      value: total,
      icon: Layers,
      color: 'text-primary bg-primary/10 border-primary/20',
      textColor: 'text-foreground',
      tab: 'ALL',
    },
    {
      label: 'Active & Live',
      value: activeCount,
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      tab: 'ACTIVE',
    },
    {
      label: 'Under Review',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
      textColor: 'text-amber-700 dark:text-amber-300',
      tab: 'PENDING',
    },
    {
      label: 'Marked Sold',
      value: soldCount,
      icon: Check,
      color: 'text-zinc-600 bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300',
      textColor: 'text-zinc-700 dark:text-zinc-300',
      tab: 'SOLD',
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 ${
        className || ''
      }`}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isSelected = currentTab === stat.tab;
        const isClickable = !!onSelectTab;

        return (
          <button
            key={stat.tab}
            type="button"
            disabled={!isClickable}
            onClick={() => onSelectTab?.(stat.tab)}
            className={`text-left bg-card border rounded-xl p-3 sm:p-4 shadow-2xs flex items-center gap-3 transition-all ${
              isClickable
                ? 'cursor-pointer hover:border-primary/50 hover:shadow-xs active:scale-[0.98]'
                : 'cursor-default'
            } ${
              isSelected
                ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]'
                : 'border-border'
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center shrink-0 transition-transform ${
                stat.color
              } ${isSelected ? 'scale-105' : ''}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-xs text-muted-foreground font-medium block truncate">
                {stat.label}
              </span>
              <span
                className={`text-lg sm:text-xl font-black tracking-tight ${stat.textColor}`}
              >
                {stat.value}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
