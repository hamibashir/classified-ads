'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { POPULAR_CATEGORIES } from '@/constants/categories';
import { CategoryItem } from '@/types/category';
import { CategoryCard } from './CategoryCard';
import { apiClient } from '@/lib/api-client';

interface CategoryGridProps {
  categories?: CategoryItem[];
  title?: string;
  subtitle?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories: initialCategories,
  title = 'Browse Categories',
  subtitle = 'Verified listings organized across high-demand marketplace sectors',
}) => {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories || POPULAR_CATEGORIES);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) return;

    let isMounted = true;
    apiClient
      .get<{ categories?: CategoryItem[] } | CategoryItem[]>('/categories')
      .then((res) => {
        if (!isMounted || !res.data) return;
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : raw.categories || [];
        if (list.length > 0) {
          // Merge API data with visual properties (colors/icons)
          const merged: CategoryItem[] = list.map((cat, idx) => {
            const fallback =
              POPULAR_CATEGORIES.find((p) => p.slug === cat.slug) ||
              POPULAR_CATEGORIES[idx] ||
              POPULAR_CATEGORIES[0];
            return {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              iconName: cat.iconName || fallback.iconName || 'Tag',
              color: cat.color || fallback.color || 'text-teal-600',
              bgTint: cat.bgTint || fallback.bgTint || 'bg-teal-50 group-hover:bg-teal-100 border-teal-200',
              description: cat.description || fallback.description || '',
              subcategories: cat.subcategories || fallback.subcategories || [],
            };
          });
          setCategories(merged);
        }
      })
      .catch((err) => {
        console.warn('Using pre-seeded category fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [initialCategories]);

  return (
    <section className="w-full py-6 sm:py-8">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 gap-3 pb-3 border-b border-border/60">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase">
            Marketplace Verticals
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            {subtitle}
          </p>
        </div>

        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors group self-start sm:self-auto shrink-0"
        >
          <span>All {categories.length} Categories</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Structured Minimalist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  );
};
