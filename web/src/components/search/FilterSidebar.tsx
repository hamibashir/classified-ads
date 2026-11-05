'use client';

import React, { useState, useEffect } from 'react';
import {
  Car,
  Smartphone,
  Tv,
  Home,
  Bike,
  Briefcase,
  Wrench,
  Shirt,
  Armchair,
  Dog,
  BookOpen,
  Baby,
  Tag,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Check,
  Banknote,
  Sparkles,
  MapPin,
  LucideIcon,
} from 'lucide-react';
import { POPULAR_CATEGORIES } from '@/constants/categories';
import { PAKISTANI_CITIES } from '@/constants/cities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  Smartphone,
  Tv,
  Home,
  Bike,
  Briefcase,
  Wrench,
  Shirt,
  Armchair,
  Dog,
  BookOpen,
  Baby,
};

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
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  onCategoryChange: (slug: string) => void;
  onSubcategoryChange?: (subcatSlug: string) => void;
  onCityChange: (cityId: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onConditionChange: (condition: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory = '',
  selectedSubcategory = '',
  selectedCity = '',
  minPrice = '',
  maxPrice = '',
  condition = '',
  onCategoryChange,
  onSubcategoryChange,
  onCityChange,
  onPriceChange,
  onConditionChange,
  onClearFilters,
  className = '',
}) => {
  const [localMin, setLocalMin] = useState<string>(minPrice);
  const [localMax, setLocalMax] = useState<string>(maxPrice);

  // Keep track of explicitly expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  // Automatically expand the active category
  useEffect(() => {
    if (selectedCategory) {
      setExpandedCategories((prev) => ({
        ...prev,
        [selectedCategory]: true,
      }));
    }
  }, [selectedCategory]);

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onPriceChange(localMin, localMax);
  };

  const handleSelectPreset = (presetMin: string, presetMax: string) => {
    setLocalMin(presetMin);
    setLocalMax(presetMax);
    onPriceChange(presetMin, presetMax);
  };

  const toggleCategoryExpand = (catSlug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catSlug]: !prev[catSlug],
    }));
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
      selectedSubcategory ||
      selectedCity ||
      minPrice ||
      maxPrice ||
      condition
  );

  return (
    <aside className={`w-full space-y-6 ${className}`}>
      {/* Sidebar Header & Reset Action */}
      <div className="flex items-center justify-between pb-3 border-b border-border/80">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
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
            className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. Category & Subcategories Navigation Left Menu */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
            <span>Categories</span>
          </h4>
          <span className="text-[10px] text-muted-foreground font-mono">12 Verticals</span>
        </div>

        <div className="space-y-0.5 text-xs">
          {/* All Categories Button */}
          <button
            type="button"
            onClick={() => {
              onCategoryChange('');
              if (onSubcategoryChange) onSubcategoryChange('');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
              !selectedCategory
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
            }`}
          >
            <span className="font-medium">All Categories</span>
            {!selectedCategory && <Check className="w-3.5 h-3.5" />}
          </button>

          {/* List of Categories & Drilldown Subcategories */}
          {POPULAR_CATEGORIES.map((cat) => {
            const isCatSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
            const isExpanded = expandedCategories[cat.slug] ?? isCatSelected;
            const hasSubcategories = Boolean(cat.subcategories && cat.subcategories.length > 0);
            const IconComponent = ICON_MAP[cat.iconName] || Tag;

            return (
              <div key={cat.id} className="space-y-0.5">
                {/* Parent Category Row */}
                <div
                  onClick={() => {
                    onCategoryChange(cat.slug);
                    if (onSubcategoryChange) onSubcategoryChange('');
                    setExpandedCategories((prev) => ({ ...prev, [cat.slug]: true }));
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer select-none group ${
                    isCatSelected && !selectedSubcategory
                      ? 'bg-emerald-950/15 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold border border-emerald-600/30'
                      : isCatSelected
                      ? 'text-foreground font-semibold bg-secondary/40'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <IconComponent className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-foreground" />
                    <span className="truncate">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {hasSubcategories && (
                      <button
                        type="button"
                        onClick={(e) => toggleCategoryExpand(cat.slug, e)}
                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Subcategories Expandable Drill-Down List */}
                {hasSubcategories && isExpanded && (
                  <div className="ml-4 pl-2.5 my-0.5 border-l border-border/80 space-y-0.5 animate-in fade-in-50 duration-150">
                    {/* All in Category */}
                    <button
                      type="button"
                      onClick={() => {
                        onCategoryChange(cat.slug);
                        if (onSubcategoryChange) onSubcategoryChange('');
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] text-left transition-colors cursor-pointer ${
                        isCatSelected && !selectedSubcategory
                          ? 'bg-[#0D382B] text-white dark:bg-emerald-500 dark:text-zinc-950 font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <span>All in {cat.name}</span>
                      {isCatSelected && !selectedSubcategory && <Check className="w-3 h-3" />}
                    </button>

                    {/* Individual Subcategories */}
                    {cat.subcategories!.map((sub) => {
                      const isSubSelected = isCatSelected && selectedSubcategory === sub.slug;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCategoryChange(cat.slug);
                            if (onSubcategoryChange) onSubcategoryChange(sub.slug);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] text-left transition-colors cursor-pointer ${
                            isSubSelected
                              ? 'bg-[#0D382B] text-white dark:bg-emerald-500 dark:text-zinc-950 font-semibold shadow-2xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          {isSubSelected && <Check className="w-3 h-3" />}
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

      {/* 2. City / Location Filter */}
      <div className="space-y-2.5 pt-3 border-t border-border/60">
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
          <span>City / Location</span>
        </h4>
        <select
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          aria-label="Filter by city"
          className="w-full text-xs rounded-xl border border-border/80 bg-card px-3 py-2 text-foreground focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer"
        >
          <option value="">All Pakistan (Nationwide)</option>
          {PAKISTANI_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}, {c.province}
            </option>
          ))}
        </select>
      </div>

      {/* 3. PKR Price Range & Budget Presets Filter */}
      <div className="space-y-3 pt-3 border-t border-border/60">
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
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
                className={`py-1 px-1.5 text-[11px] font-semibold rounded-lg border transition-colors truncate text-center cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent shadow-xs'
                    : 'bg-card text-muted-foreground border-border/80 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-foreground'
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
              className="text-xs h-8 rounded-lg"
              min="0"
            />
            <Input
              type="number"
              placeholder="Max PKR"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="text-xs h-8 rounded-lg"
              min="0"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs font-semibold rounded-lg border-border/80 hover:border-zinc-400 dark:hover:border-zinc-600"
          >
            Apply Price
          </Button>
        </form>
      </div>

      {/* 4. Condition Checkboxes */}
      <div className="space-y-2.5 pt-3 border-t border-border/60">
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
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
                className="flex items-center gap-2.5 text-xs font-medium text-foreground cursor-pointer select-none"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked
                      ? 'bg-[#0D382B] dark:bg-emerald-500 border-transparent text-white dark:text-zinc-950'
                      : 'border-border/80 bg-card'
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
