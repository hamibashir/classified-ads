'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Tag, ChevronDown, ShieldCheck, Zap, Navigation } from 'lucide-react';
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
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#081B15] border border-[#14392D] text-white p-6 sm:p-10 md:p-14 mb-8 sm:mb-12 shadow-2xl transition-all">
        {/* Subtle Architectural Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Warm Vignette (Restrained & Architectural) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Top Status & Location Badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium text-emerald-300/90 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Marketplace • Pakistan
            </span>

            <button
              type="button"
              onClick={() => setIsCityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-xs font-medium text-white transition-all cursor-pointer group"
              title="Click to change your location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{selectedCity.name}, {selectedCity.province}</span>
              <span className="text-[11px] text-emerald-300 font-semibold underline underline-offset-2 ml-0.5">
                Change
              </span>
            </button>
          </div>

          {/* Editorial Display Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              The curated marketplace for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-white">
                {selectedCity.name}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300/90 max-w-2xl mx-auto leading-relaxed font-normal">
              Direct peer-to-peer buying and selling for verified vehicles, electronics, properties, and services. Zero intermediary clutter.
            </p>
          </div>

          {/* Unified Architectural Search Dock */}
          <form
            onSubmit={handleSearch}
            className="bg-white dark:bg-zinc-950 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl flex flex-col md:flex-row items-stretch gap-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all focus-within:border-emerald-600/60"
          >
            {/* Search Input */}
            <div className="relative flex-1 flex items-center min-w-0">
              <Search className="absolute left-3.5 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
              <Input
                type="search"
                placeholder={`Search cars, mobiles, property in ${selectedCity.name}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 text-sm sm:text-base border-0 focus-visible:ring-0 shadow-none bg-transparent placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 font-medium"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="md:w-52 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pl-0 md:pl-2 flex items-center relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="w-full h-11 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 bg-transparent border-0 focus:outline-none cursor-pointer px-3 pr-8 appearance-none font-medium truncate"
              >
                <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  All Categories
                </option>
                {POPULAR_CATEGORIES.map((c) => (
                  <option
                    key={c.id}
                    value={c.slug}
                    className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  >
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 pointer-events-none" />
            </div>

            {/* High-Contrast Search Action Button */}
            <Button
              type="submit"
              className="h-12 px-7 bg-[#0D382B] hover:bg-[#07241B] dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-zinc-950 text-white font-semibold rounded-lg sm:rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Button>
          </form>

          {/* Minimal Inline Trending Queries */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 text-xs">
            <span className="text-zinc-400 font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-400" /> Popular:
            </span>
            {TRENDING_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTrendingClick(tag)}
                className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-all border border-white/10 text-xs font-medium cursor-pointer active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Micro Trust Indicators Bar */}
          <div className="pt-4 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="flex items-center gap-2 text-zinc-300/80 text-xs font-medium justify-center sm:justify-start">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Phone Verified Sellers</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300/80 text-xs font-medium justify-center">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct WhatsApp & Chat</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300/80 text-xs font-medium justify-center sm:justify-end">
              <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>GPS Proximity Ordering</span>
            </div>
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
