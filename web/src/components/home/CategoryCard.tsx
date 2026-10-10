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
      className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-400 hover:-translate-y-1 transition-all duration-200 text-center"
      title={category.description || category.name}
    >
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-2.5 transition-transform duration-200 group-hover:scale-110 ${category.bgTint}`}
      >
        <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${category.color}`} />
      </div>

      <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-teal-700 transition-colors line-clamp-1 w-full">
        {category.name}
      </span>
    </Link>
  );
};
