'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterSidebar } from './FilterSidebar';

interface MobileFilterDrawerProps {
  selectedCategory?: string;
  selectedSubcategory?: string;
  selectedCity?: string;
  radius?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  onCategoryChange: (slug: string) => void;
  onSubcategoryChange?: (subcatSlug: string) => void;
  onCityChange: (cityId: string) => void;
  onRadiusChange?: (radiusVal: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onConditionChange: (condition: string) => void;
  onClearFilters: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = [
    Boolean(props.selectedCategory),
    Boolean(props.selectedSubcategory),
    Boolean(props.selectedCity),
    Boolean(props.radius),
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
        className="lg:hidden flex items-center gap-2 border-slate-300 font-semibold text-xs text-slate-800"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700" />
        <span>Filters</span>
        {activeCount > 0 && (
          <Badge variant="default" className="bg-teal-700 text-white text-[10px] px-1.5 py-0">
            {activeCount}
          </Badge>
        )}
      </Button>

      {/* Slide-over Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-slate-900 text-base">Filter Listings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto flex-1">
              <FilterSidebar {...props} />
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
              <Button
                variant="primary"
                className="w-full font-semibold text-xs"
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
