'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  MapPin,
  Banknote,
  Sparkles,
  RotateCcw,
  Check,
  Compass,
  CornerDownRight,
} from 'lucide-react';
import { POPULAR_CATEGORIES } from '@/constants/categories';
import { PAKISTANI_CITIES } from '@/constants/cities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RADIUS_OPTIONS = ['5', '10', '25', '50'] as const;

const PRICE_PRESETS = [
  { label: '< Rs 50K', min: '', max: '50000' },
  { label: '50K – 2 Lakh', min: '50000', max: '200000' },
  { label: '2 – 10 Lakh', min: '200000', max: '1000000' },
  { label: '> 10 Lakh', min: '1000000', max: '' },
] as const;

interface FilterSidebarProps {
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
  className?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory = '',
  selectedSubcategory = '',
  selectedCity = '',
  radius = '',
  minPrice = '',
  maxPrice = '',
  condition = '',
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onRadiusChange,
  onPriceChange,
  onConditionChange,
  onClearFilters,
  className = '',
}) => {
  const [localMin, setLocalMin] = useState<string>(minPrice);
  const [localMax, setLocalMax] = useState<string>(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onPriceChange(localMin, localMax);
  };

  const handleSelectPreset = (presetMin: string, presetMax: string) => {
    setLocalMin(presetMin);
    setLocalMax(presetMax);
    onPriceChange(presetMin, presetMax);
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
      selectedSubcategory ||
      selectedCity ||
      radius ||
      minPrice ||
      maxPrice ||
      condition
  );

  return (
    <aside className={`w-full space-y-6 ${className}`}>
      {/* Sidebar Header & Clear All Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-teal-600" />
          )}
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setLocalMin('');
              setLocalMax('');
              onClearFilters();
            }}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. Category & Expandable Subcategories Navigation */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-teal-700" />
          <span>Categories & Subcategories</span>
        </h4>
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1 text-sm no-scrollbar">
          <button
            type="button"
            onClick={() => {
              onCategoryChange('');
              if (onSubcategoryChange) onSubcategoryChange('');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
              !selectedCategory
                ? 'bg-teal-50 text-teal-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check className="w-3.5 h-3.5 text-teal-700" />}
          </button>

          {POPULAR_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <div key={cat.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    const nextCat = isSelected ? '' : cat.slug;
                    onCategoryChange(nextCat);
                    if (onSubcategoryChange) onSubcategoryChange('');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-700" />}
                </button>

                {/* Subcategories drill-down list */}
                {isSelected && cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="pl-4 pr-1 py-1 space-y-1 bg-slate-50/80 rounded-lg border border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSubcategoryChange && onSubcategoryChange('')}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs text-left transition-colors ${
                        !selectedSubcategory
                          ? 'text-teal-800 font-semibold bg-teal-100/60'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>All in {cat.name}</span>
                      {!selectedSubcategory && <Check className="w-3 h-3 text-teal-700" />}
                    </button>
                    {cat.subcategories.map((sub) => {
                      const isSubSelected = selectedSubcategory === sub.slug;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() =>
                            onSubcategoryChange &&
                            onSubcategoryChange(isSubSelected ? '' : sub.slug)
                          }
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs text-left transition-colors ${
                            isSubSelected
                              ? 'text-teal-800 font-semibold bg-teal-100/60'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <CornerDownRight className="w-2.5 h-2.5 text-slate-400" />
                            {sub.name}
                          </span>
                          {isSubSelected && <Check className="w-3 h-3 text-teal-700" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. City Location Filter */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-teal-700" />
          <span>City / Location</span>
        </h4>
        <select
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full text-xs sm:text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
        >
          <option value="">All Pakistan (Nationwide)</option>
          {PAKISTANI_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}, {c.province}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Proximity Radius Filter */}
      {selectedCity && onRadiusChange && (
        <div className="space-y-2.5 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-700" />
              <span>Proximity Radius</span>
            </h4>
            {radius && (
              <span className="text-[11px] font-semibold text-teal-700">
                within {radius} km
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {RADIUS_OPTIONS.map((r) => {
              const isSelected = radius === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRadiusChange(isSelected ? '' : r)}
                  className={`py-1 text-xs font-semibold rounded-md border transition-all ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r} km
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PKR Price Range & Budget Presets Filter */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-teal-700" />
          <span>Price Range (PKR)</span>
        </h4>

        {/* Quick Budget Presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_PRESETS.map((p) => {
            const isSelected = minPrice === p.min && maxPrice === p.max;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(isSelected ? '' : p.min, isSelected ? '' : p.max)}
                className={`py-1 px-1.5 text-[11px] font-semibold rounded-md border transition-all truncate text-center ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleApplyPrice} className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min PKR"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="text-xs h-8"
              min="0"
            />
            <Input
              type="number"
              placeholder="Max PKR"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="text-xs h-8"
              min="0"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            Apply Price
          </Button>
        </form>
      </div>

      {/* 5. Item Condition Checkboxes */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>Condition</span>
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Used / Pre-Owned', value: 'USED' },
            { label: 'Brand New', value: 'NEW' },
          ].map((cond) => {
            const isChecked = condition === cond.value;
            return (
              <label
                key={cond.value}
                onClick={() => onConditionChange(isChecked ? '' : cond.value)}
                className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none hover:text-slate-900"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-teal-700 border-teal-700 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{cond.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
