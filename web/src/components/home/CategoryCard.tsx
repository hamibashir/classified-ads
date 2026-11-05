'use client';

import React from 'react';
import Link from 'next/link';
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
  ArrowUpRight,
  LucideIcon,
} from 'lucide-react';
import { CategoryItem } from '@/types/category';

interface CategoryCardProps {
  category: CategoryItem;
}

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

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const IconComponent = ICON_MAP[category.iconName] || Tag;

  return (
    <Link
      href={`/search?category=${encodeURIComponent(category.slug)}`}
      className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-card border border-border/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-150 text-left min-h-[104px] sm:min-h-[116px]"
      title={category.description || category.name}
    >
      {/* Top Row: Icon Container + Micro Outward Arrow */}
      <div className="flex items-center justify-between w-full mb-2.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 flex items-center justify-center transition-all duration-200 group-hover:bg-[#0D382B] group-hover:text-white dark:group-hover:bg-emerald-500 dark:group-hover:text-zinc-950">
          <IconComponent className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-105" />
        </div>

        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      {/* Bottom Info: Title & Subtle Subtext */}
      <div className="space-y-0.5 w-full">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-[#0D382B] dark:group-hover:text-emerald-400 transition-colors truncate">
          {category.name}
        </h3>
        <p className="text-[11px] text-muted-foreground truncate leading-snug">
          {category.description || 'Explore deals'}
        </p>
      </div>
    </Link>
  );
};
