'use client';

import React from 'react';
import { ArrowUpDown, X, LayoutGrid, List, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { POPULAR_CATEGORIES } from '@/constants/categories';
import { findCityByIdOrName } from '@/constants/cities';

export interface ActiveFilters {
  q?: string;
  category?: string;
  subcat?: string;
  city?: string;
  radius?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  sort?: string;
}

interface SearchResultsHeaderProps {
  totalCount: number;
  filters: ActiveFilters;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onRemoveFilter: (key: keyof ActiveFilters) => void;
  onClearAll?: () => void;
  onSortChange: (sortVal: string) => void;
  mobileFilterTrigger?: React.ReactNode;
}

export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  totalCount,
  filters,
  viewMode = 'grid',
  onViewModeChange,
  onRemoveFilter,
  onClearAll,
  onSortChange,
  mobileFilterTrigger,
}) => {
  const categoryObj = filters.category
    ? POPULAR_CATEGORIES.find((c) => c.slug === filters.category)
    : null;

  const categoryName = categoryObj?.name || filters.category;

  const subcategoryName = filters.subcat
    ? categoryObj?.subcategories?.find((s) => s.slug === filters.subcat)?.name || filters.subcat
    : null;

  const cityName = filters.city ? findCityByIdOrName(filters.city).name : null;

  const sortValue = filters.sort || 'newest';

  const hasAnyFilter = Boolean(
    filters.q ||
      filters.category ||
      filters.subcat ||
      filters.city ||
      filters.radius ||
      filters.condition ||
      filters.minPrice ||
      filters.maxPrice
  );

  return (
    <div className="space-y-4 pb-4 border-b border-slate-200">
      {/* Top Bar: Headline & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {filters.q ? (
              <>
                Results for &quot;<span className="text-teal-700">{filters.q}</span>&quot;
              </>
            ) : subcategoryName ? (
              <>
                {subcategoryName} <span className="text-slate-400 font-normal">in</span>{' '}
                <span className="text-teal-700">{cityName || 'Pakistan'}</span>
              </>
            ) : categoryName ? (
              <>
                {categoryName} <span className="text-slate-400 font-normal">in</span>{' '}
                <span className="text-teal-700">{cityName || 'Pakistan'}</span>
              </>
            ) : cityName ? (
              <>
                Classified Ads in <span className="text-teal-700">{cityName}</span>
              </>
            ) : (
              'All Listings on Zaaz B'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Showing <span className="font-semibold text-slate-800">{totalCount}</span> active ads
          </p>
        </div>

        {/* Sort, View Toggle & Mobile Drawer Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {mobileFilterTrigger}

          {/* Grid vs List View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-teal-50 text-teal-700 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-teal-50 text-teal-700 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort listings"
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Badges Strip */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {filters.q && (
          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-2.5 text-xs bg-slate-100 text-slate-800 font-medium"
          >
            <span>Query: &quot;{filters.q}&quot;</span>
            <button
              type="button"
              onClick={() => onRemoveFilter('q')}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Remove search query"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {categoryName && (
          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-2.5 text-xs bg-teal-50 text-teal-800 border-teal-200 font-medium"
          >
            <span>Category: {categoryName}</span>
            <button
              type="button"
              onClick={() => {
                onRemoveFilter('category');
                if (filters.subcat) onRemoveFilter('subcat');
              }}
              className="text-teal-600 hover:text-teal-900 cursor-pointer"
              aria-label="Remove category filter"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {subcategoryName && (
          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-2.5 text-xs bg-teal-100/70 text-teal-900 border-teal-300 font-medium"
          >
            <span>Sub: {subcategoryName}</span>
            <button
              type="button"
              onClick={() => onRemoveFilter('subcat')}
              className="text-teal-700 hover:text-teal-950 cursor-pointer"
              aria-label="Remove subcategory filter"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {cityName && (
          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-2.5 text-xs bg-blue-50 text-blue-800 border-blue-200 font-medium"
          >
            <span>City: {cityName}</span>
            <button
              type="button"
              onClick={() => {
                onRemoveFilter('city');
                if (filters.radius) onRemoveFilter('radius');
              }}
              className="text-blue-600 hover:text-blue-900 cursor-pointer"
              aria-label="Remove city filter"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {filters.radius && (
          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-2.5 text-xs bg-amber-50 text-amber-800 border-amber-200 font-medium"
          >
            <span>Radius: {filters.radius} km</span>
            <button
              type="button"
              onClick={() => onRemoveFilter('radius')}
              className="text-amber-600 hover:text-amber-900 cursor-pointer"
              aria-label="Remove radius filter"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {filters.condition && (
          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-2.5 text-xs bg-purple-50 text-purple-800 border-purple-200 font-medium"
          >
            <span>Condition: {filters.condition}</span>
            <button
              type="button"
              onClick={() => onRemoveFilter('condition')}
              className="text-purple-600 hover:text-purple-900 cursor-pointer"
              aria-label="Remove condition filter"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {(filters.minPrice || filters.maxPrice) && (
          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-2.5 text-xs bg-emerald-50 text-emerald-800 border-emerald-200 font-medium"
          >
            <span>
              Price:{' '}
              {filters.minPrice ? `From Rs ${parseInt(filters.minPrice).toLocaleString()}` : ''}{' '}
              {filters.maxPrice ? `To Rs ${parseInt(filters.maxPrice).toLocaleString()}` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                onRemoveFilter('minPrice');
                onRemoveFilter('maxPrice');
              }}
              className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
              aria-label="Remove price filter"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        )}

        {/* Clear All Filters Button */}
        {hasAnyFilter && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>
    </div>
  );
};
