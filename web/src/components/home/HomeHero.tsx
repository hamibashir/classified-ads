'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Tag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGeolocation } from '@/hooks/useGeolocation';
import { POPULAR_CATEGORIES } from '@/constants/categories';
import { CityPickerModal } from '@/components/layout/CityPickerModal';

const TRENDING_SEARCHES = [
  'Toyota Corolla',
  'iPhone 15 Pro',
  'Suzuki Alto',
  'Honda Civic',
  'Yamaha YBR',
  '1 Kanal House',
  'Sofa Set',
];

export const HomeHero: React.FC = () => {
  const router = useRouter();
  const { selectedCity } = useGeolocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCity?.id) params.set('city', selectedCity.id);
    router.push(`/search?${params.toString()}`);
  };

  const handleTrendingClick = (tag: string) => {
    const params = new URLSearchParams();
    params.set('q', tag);
    if (selectedCity?.id) params.set('city', selectedCity.id);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950/95 to-slate-900 text-white p-6 sm:p-10 md:p-12 shadow-xl border border-teal-800/30 mb-8 transition-all">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          {/* Minimal Interactive Location Pill */}
          <button
            type="button"
            onClick={() => setIsCityModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-xs font-medium text-teal-200 transition-all hover:border-teal-400/50 cursor-pointer"
            title="Click to change city"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>{selectedCity.name}, {selectedCity.province}</span>
            <span className="text-[10px] text-teal-300 font-semibold underline underline-offset-2 ml-1">
              Change
            </span>
          </button>

          {/* Main Clean Heading */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Find Everything You Need in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-emerald-400">
              {selectedCity.name}
            </span>
          </h1>

          {/* Minimal, Crisp Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Explore verified cars, smartphones, real estate, and daily services across Pakistan.
          </p>

          {/* Modern Elevated Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-2xl shadow-teal-950/40 flex flex-col md:flex-row items-stretch gap-2 text-slate-800 border border-slate-100"
          >
            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
              <Input
                type="search"
                placeholder={`Search cars, mobiles, property in ${selectedCity.name}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 text-sm sm:text-base border-0 focus-visible:ring-0 shadow-none bg-transparent placeholder:text-slate-400"
              />
            </div>

            {/* Category Dropdown with Clean Styling */}
            <div className="md:w-48 border-t md:border-t-0 md:border-l border-slate-200 pl-0 md:pl-2 flex items-center relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="w-full h-11 text-xs sm:text-sm text-slate-700 bg-transparent border-0 focus:outline-none cursor-pointer px-2 pr-7 appearance-none font-medium"
              >
                <option value="">All Categories</option>
                {POPULAR_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>

            {/* Search Action Button */}
            <Button
              type="submit"
              size="lg"
              className="h-12 px-6 sm:px-8 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Button>
          </form>

          {/* Minimal Inline Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-teal-400" /> Popular:
            </span>
            {TRENDING_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTrendingClick(tag)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10 text-xs font-medium cursor-pointer active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* City Picker Modal Triggered from Hero */}
      <CityPickerModal
        open={isCityModalOpen}
        onOpenChange={setIsCityModalOpen}
      />
    </>
  );
};
