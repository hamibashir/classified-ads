import React from 'react';
import { MyAdsFilterTab } from '@/types/ad';

interface MyAdsTabsProps {
  currentTab: MyAdsFilterTab;
  counts: {
    all: number;
    active: number;
    pending: number;
    sold: number;
  };
  onTabChange: (tab: MyAdsFilterTab) => void;
  className?: string;
}

export function MyAdsTabs({
  currentTab,
  counts,
  onTabChange,
  className,
}: MyAdsTabsProps) {
  const tabs: { key: MyAdsFilterTab; label: string; count?: number }[] = [
    { key: 'ALL', label: 'All Listings', count: counts.all },
    { key: 'ACTIVE', label: 'Active', count: counts.active },
    { key: 'PENDING', label: 'Under Review', count: counts.pending },
    { key: 'SOLD', label: 'Sold', count: counts.sold },
  ];

  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border ${
        className || ''
      }`}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
