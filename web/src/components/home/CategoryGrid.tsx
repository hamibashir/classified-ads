'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { POPULAR_CATEGORIES } from '@/constants/categories';
import { CategoryItem } from '@/types/category';
import { CategoryCard } from './CategoryCard';

interface CategoryGridProps {
  categories?: CategoryItem[];
  title?: string;
  subtitle?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories = POPULAR_CATEGORIES,
  title = 'Browse Categories',
  subtitle = 'Find verified ads and deals across Pakistan',
}) => {
  return (
    <section className="w-full py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 md:mb-6 gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-teal-50 text-teal-700">
              <LayoutGrid className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
        </div>

        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors group self-start sm:self-auto"
        >
          <span>View all listings</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2.5 sm:gap-3.5">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </section>
  );
};
