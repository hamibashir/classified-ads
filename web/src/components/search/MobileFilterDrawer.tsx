'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterSidebar } from './FilterSidebar';

interface MobileFilterDrawerProps {
  selectedCategory?: string;
  selectedSubcategory?: string;
  selectedCity?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  customFilters?: Record<string, string>;
  onCategoryChange?: (slug: string) => void;
  onSubcategoryChange?: (subcatSlug: string) => void;
  onCategorySelect?: (categorySlug: string, subcategorySlug?: string | null) => void;
  onCityChange: (cityId: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onConditionChange: (condition: string) => void;
  onCustomFilterChange?: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = [
    Boolean(props.selectedCategory),
    Boolean(props.selectedSubcategory),
    Boolean(props.selectedCity),
    Boolean(props.minPrice || props.maxPrice),
    Boolean(props.condition),
  ].filter(Boolean).length;

  return (
    <>
      {/* Mobile Drawer Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 border-border/80 font-semibold text-xs text-foreground rounded-xl"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="bg-[#0D382B] text-white dark:bg-emerald-500 dark:text-zinc-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Slide-over Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-card h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-border/80">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/80">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <h3 className="font-bold text-foreground text-base">Filter Listings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto flex-1">
              <FilterSidebar {...props} />
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-border/80 bg-secondary/30 flex gap-2">
              <Button
                className="w-full font-semibold text-xs bg-[#0D382B] text-white dark:bg-emerald-500 dark:text-zinc-950 rounded-xl"
                onClick={() => setIsOpen(false)}
              >
                Apply & View Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
