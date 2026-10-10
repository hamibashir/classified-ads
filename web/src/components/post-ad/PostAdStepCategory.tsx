'use client';

import React, { useState, useEffect } from 'react';
import { POPULAR_CATEGORIES } from '@/constants/categories';
import { CategoryItem } from '@/types/category';
import { apiClient } from '@/lib/api-client';
import { postAdStep1Schema } from '@/lib/validations/ad';
import { Button } from '@/components/ui/button';
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
  ChevronRight,
  CheckCircle2,
  FolderTree,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PostAdStepCategoryProps {
  selectedCategoryId: string;
  selectedSubcategoryId: string;
  onSelectCategory: (
    categoryId: string,
    subcategoryId: string,
    categoryName: string,
    subcategoryName: string
  ) => void;
  onNext: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
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

export function PostAdStepCategory({
  selectedCategoryId,
  selectedSubcategoryId,
  onSelectCategory,
  onNext,
}: PostAdStepCategoryProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(POPULAR_CATEGORIES);
  const [activeParent, setActiveParent] = useState<CategoryItem | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch live categories from API if available
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get<CategoryItem[]>('/categories');
        const rawList = Array.isArray(res.data)
          ? res.data
          : (res.data as unknown as { categories?: CategoryItem[] })?.categories || [];

        if (rawList && rawList.length > 0 && isMounted) {
          // Merge API categories with client visual properties
          const merged = rawList.map((apiCat, idx) => {
            const fallback = POPULAR_CATEGORIES[idx] || POPULAR_CATEGORIES[0];
            const apiChildren = (apiCat as unknown as { children?: { id: string; name: string; slug: string; order: number }[] }).children;
            const subs = (apiChildren && apiChildren.length > 0)
              ? apiChildren.map((c) => ({ id: c.id, name: c.name, slug: c.slug, order: c.order || 0 }))
              : (apiCat.subcategories || fallback.subcategories);

            return {
              ...apiCat,
              subcategories: subs,
              iconName: apiCat.iconName || fallback.iconName,
              color: apiCat.color || fallback.color,
              bgTint: apiCat.bgTint || fallback.bgTint,
            };
          });
          setCategories(merged);
        }
      } catch {
        // Use pre-seeded POPULAR_CATEGORIES fallback
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize active state from existing selection
  useEffect(() => {
    if (selectedCategoryId) {
      const parent = categories.find((c) => c.id === selectedCategoryId);
      if (parent) {
        setActiveParent(parent);
        if (selectedSubcategoryId && parent.subcategories) {
          const sub = parent.subcategories.find((s) => s.id === selectedSubcategoryId);
          if (sub) {
            setActiveSubcategory({ id: sub.id, name: sub.name });
          }
        }
      }
    }
  }, [selectedCategoryId, selectedSubcategoryId, categories]);

  const handleSelectParent = (cat: CategoryItem) => {
    setActiveParent(cat);
    setError(null);

    // If parent has subcategories, reset subcategory so user chooses one
    if (cat.subcategories && cat.subcategories.length > 0) {
      setActiveSubcategory(null);
    } else {
      // If flat category without subcategories, parent is its own subcategory
      setActiveSubcategory({ id: cat.id, name: cat.name });
      onSelectCategory(cat.id, cat.id, cat.name, cat.name);
    }
  };

  const handleSelectSub = (subId: string, subName: string) => {
    if (!activeParent) return;
    setActiveSubcategory({ id: subId, name: subName });
    setError(null);
    onSelectCategory(activeParent.id, subId, activeParent.name, subName);
  };

  const handleContinue = () => {
    if (!activeParent || !activeSubcategory) {
      setError('Please select both a main category and a subcategory to continue.');
      return;
    }

    const validation = postAdStep1Schema.safeParse({
      categoryId: activeParent.id,
      subcategoryId: activeSubcategory.id,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Invalid category selection');
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <FolderTree className="h-4 w-4" />
          <span>Step 1: Classification</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Choose a Category for your Ad
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select the category that best matches your item or service so Pakistani buyers can discover it easily.
        </p>
      </div>

      {/* Selected Category Pill (if selected) */}
      {activeParent && activeSubcategory && (
        <div className="flex items-center justify-between p-3.5 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Selected:{' '}
              <span className="text-primary font-bold">
                {activeParent.name} &gt; {activeSubcategory.name}
              </span>
            </span>
          </div>

          <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Ready to Proceed
          </span>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-xl">
          {error}
        </div>
      )}

      {/* Main Category Selection Grid */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          1. Select Main Category
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
          {categories.map((cat) => {
            const isSelected = activeParent?.id === cat.id;
            const Icon = ICON_MAP[cat.iconName] || Sparkles;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectParent(cat)}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20'
                    : 'border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : `${cat.bgTint || 'bg-muted'} ${cat.color || 'text-primary'}`
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      isSelected
                        ? 'text-primary rotate-90'
                        : 'text-muted-foreground/50 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>

                <div>
                  <h3
                    className={`font-semibold text-xs sm:text-sm tracking-tight leading-snug ${
                      isSelected ? 'text-primary font-bold' : 'text-foreground'
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-muted-foreground block line-clamp-1 mt-0.5">
                    {cat.description || `${cat.name} listings`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Expansion Section */}
      {activeParent && activeParent.subcategories && activeParent.subcategories.length > 0 && (
        <div className="bg-card p-5 rounded-2xl border border-border/80 space-y-3 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              2. Select Subcategory in <span className="text-primary">{activeParent.name}</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              {activeParent.subcategories.length} available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {activeParent.subcategories.map((sub) => {
              const isSubSelected = activeSubcategory?.id === sub.id;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSelectSub(sub.id, sub.name)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    isSubSelected
                      ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'border-border/70 bg-background hover:bg-muted/40 hover:border-border text-foreground'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{sub.name}</span>
                  {isSubSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex justify-end pt-3">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!activeParent || !activeSubcategory}
          className="h-11 px-6 font-semibold gap-2 shadow-xs"
        >
          <span>Continue to Ad Details</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
