'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Zap,
  Navigation,
  X,
  Clock,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Building2,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGeolocation } from '@/hooks/useGeolocation';
import { POPULAR_CATEGORIES } from '@/constants/categories';
import { SEARCH_FALLBACK_ADS } from '@/constants/fallbackSearchAds';
import { CityPickerModal } from '@/components/layout/CityPickerModal';
import { apiClient } from '@/lib/api-client';
import { AdListItem } from '@/types/ad';
import { formatPKR } from '@/lib/formatters';

const RECENT_SEARCHES_STORAGE_KEY = 'classified_ads_recent_searches_pk';

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

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isNationwide, setIsNationwide] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  // Suggestions state
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<AdListItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, []);

  // Save to recent searches
  const saveRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Remove single recent search
  const removeRecentSearch = useCallback((e: React.MouseEvent, queryToRemove: string) => {
    e.stopPropagation();
    e.preventDefault();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== queryToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Clear all recent searches
  const clearAllRecentSearches = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Space-ignoring & multi-token matcher for instant preview
  const localMatchedAds = useMemo(() => {
    const raw = searchTerm.trim();
    if (!raw) return [];
    const normQuery = raw.toLowerCase().replace(/[\s\-_.,/]+/g, '');
    const tokens = raw.toLowerCase().split(/\s+/).filter(Boolean);
    if (!normQuery) return [];

    return SEARCH_FALLBACK_ADS.filter((ad) => {
      const titleLow = ad.title.toLowerCase();
      const descLow = (ad.description || '').toLowerCase();
      const catLow = (ad.category?.name || '').toLowerCase();
      const cityLow = (ad.locationCity || '').toLowerCase();
      const slugLow = ad.slug.toLowerCase();

      // Check category match if selected
      if (selectedCategory && ad.category?.slug !== selectedCategory && ad.category?.id !== selectedCategory) {
        return false;
      }

      // Check city match if city scope is enabled
      if (!isNationwide && selectedCity?.name && cityLow !== selectedCity.name.toLowerCase()) {
        return false;
      }

      // 1. Spacing-ignored match (e.g. "hondacivic" vs "Honda Civic", "iphone15" vs "iPhone 15", "altovxr" vs "Alto VXR", "cd70" vs "CD 70")
      const normTitle = titleLow.replace(/[\s\-_.,/]+/g, '');
      const normDesc = descLow.replace(/[\s\-_.,/]+/g, '');
      const normCat = catLow.replace(/[\s\-_.,/]+/g, '');
      const normSlug = slugLow.replace(/[\s\-_.,/]+/g, '');

      if (
        normTitle.includes(normQuery) ||
        normDesc.includes(normQuery) ||
        normCat.includes(normQuery) ||
        normSlug.includes(normQuery)
      ) {
        return true;
      }

      // 2. Tokenized match (e.g. "honda 2021" where terms are separated by words)
      return tokens.every(
        (token) =>
          titleLow.includes(token) ||
          descLow.includes(token) ||
          catLow.includes(token) ||
          cityLow.includes(token) ||
          slugLow.includes(token)
      );
    }).slice(0, 4);
  }, [searchTerm, selectedCategory, isNationwide, selectedCity]);

  // Live autocomplete query fetcher with debounce
  useEffect(() => {
    const query = searchTerm.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoadingSuggestions(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const params: Record<string, string | number> = {
          q: query,
          limit: 4,
          sort: 'newest',
        };
        if (!isNationwide && selectedCity?.id) {
          params.city = selectedCity.id;
        }
        if (selectedCategory) {
          params.category = selectedCategory;
        }

        const res = await apiClient.get<AdListItem[]>('/ads', { params });
        const items: AdListItem[] = Array.isArray(res)
          ? res
          : Array.isArray((res as { data?: AdListItem[] })?.data)
          ? (res as { data: AdListItem[] }).data
          : (res as { ads?: AdListItem[] }).ads || [];

        if (items.length > 0) {
          setSuggestions(items);
        } else {
          // Use instant local matches as fallback preview
          setSuggestions(localMatchedAds);
        }
      } catch {
        setSuggestions(localMatchedAds);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, selectedCategory, isNationwide, selectedCity, localMatchedAds]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Execute search navigation
  const executeSearch = (targetQuery = searchTerm, targetCategory = selectedCategory) => {
    const cleanQuery = targetQuery.trim();
    if (cleanQuery) {
      saveRecentSearch(cleanQuery);
    }
    const params = new URLSearchParams();
    if (cleanQuery) params.set('q', cleanQuery);
    if (targetCategory) params.set('category', targetCategory);
    if (!isNationwide && selectedCity?.id) {
      params.set('city', selectedCity.id);
    }

    setIsFocused(false);
    router.push(`/search?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleTrendingClick = (tag: string) => {
    setSearchTerm(tag);
    executeSearch(tag);
  };

  // Keyboard navigation across suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        const selectedAd = suggestions[highlightedIndex];
        saveRecentSearch(selectedAd.title);
        setIsFocused(false);
        router.push(`/ads/${selectedAd.slug}`);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setHighlightedIndex(-1);
    }
  };

  // Best category match for query
  const suggestedCategoryMatch = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const lower = searchTerm.toLowerCase();
    return POPULAR_CATEGORIES.find(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        Boolean(c.subcategories?.some((sub) => sub.name.toLowerCase().includes(lower)))
    );
  }, [searchTerm]);

  const hasSuggestions = suggestions.length > 0;
  const showRecentSection = !searchTerm.trim() && recentSearches.length > 0;
  const showDropdown = isFocused && (hasSuggestions || showRecentSection || suggestedCategoryMatch || isLoadingSuggestions);

  return (
    <>
      <section className="relative overflow-visible rounded-2xl sm:rounded-3xl bg-[#081B15] border border-[#14392D] text-white p-6 sm:p-10 md:p-14 mb-8 sm:mb-12 shadow-2xl transition-all">
        {/* Subtle Architectural Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-2xl sm:rounded-3xl overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Warm Vignette */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Top Status & Location Badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium text-emerald-300/90 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Zaaz B Verified • Premier Marketplace
            </span>

            {/* Location Scope Indicator */}
            <button
              type="button"
              onClick={() => setIsCityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-xs font-medium text-white transition-all cursor-pointer group"
              title="Click to change your location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>
                {isNationwide ? 'All Pakistan' : `${selectedCity.name}, ${selectedCity.province}`}
              </span>
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
                {isNationwide ? 'All Pakistan' : selectedCity.name}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300/90 max-w-2xl mx-auto leading-relaxed font-normal">
              Direct peer-to-peer buying and selling for verified vehicles, electronics, properties, and services. Zero intermediary clutter.
            </p>
          </div>

          {/* Unified Architectural Search Dock Container with Live Suggestions */}
          <div ref={containerRef} className="relative w-full max-w-3xl mx-auto text-left">
            <form
              onSubmit={handleSearchSubmit}
              className="relative bg-white dark:bg-zinc-950 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl flex flex-col md:flex-row items-stretch gap-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 z-20"
            >
              {/* Search Input with Clear Button */}
              <div className="relative flex-1 flex items-center min-w-0">
                <Search className={`absolute left-3.5 h-4.5 w-4.5 transition-colors pointer-events-none ${
                  isFocused ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                }`} />

                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    isNationwide
                      ? 'Search cars, mobiles, laptops across Pakistan...'
                      : `Search cars, mobiles, property in ${selectedCity.name}...`
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onKeyDown={handleKeyDown}
                  className="pl-11 pr-9 h-12 text-sm sm:text-base border-0 focus-visible:ring-0 shadow-none bg-transparent placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 font-medium"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSuggestions([]);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Clear search input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* City Scope Filter Chip */}
              <div className="hidden sm:flex items-center pl-2 pr-1 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNationwide(!isNationwide)}
                  className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    isNationwide
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800/60'
                  }`}
                  title={isNationwide ? 'Click to restrict search to your city' : 'Click to search across all Pakistan'}
                >
                  {isNationwide ? (
                    <>
                      <Globe className="w-3.5 h-3.5 text-zinc-500" />
                      <span>All Pakistan</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="max-w-[85px] truncate">{selectedCity.name}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Full Category Filter Dropdown (All 12 Verticals) */}
              <div className="md:w-48 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pl-0 md:pl-2 flex items-center relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter by category"
                  className="w-full h-11 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 bg-transparent border-0 focus:outline-none cursor-pointer px-3 pr-8 appearance-none font-medium truncate"
                >
                  <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold">
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

            {/* Smart Real-Time Autocomplete & Suggestions Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-30 divide-y divide-zinc-100 dark:divide-zinc-800/80 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                {/* 1. Category Quick-Jump Suggestion */}
                {suggestedCategoryMatch && searchTerm.trim() && (
                  <div
                    onClick={() => executeSearch(searchTerm, suggestedCategoryMatch.slug)}
                    className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 flex items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">
                        Search <strong className="font-semibold text-emerald-900 dark:text-emerald-300">&quot;{searchTerm}&quot;</strong> in{' '}
                        <span className="font-bold underline underline-offset-2">{suggestedCategoryMatch.name}</span>
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  </div>
                )}

                {/* 2. Live Matching Listings Previews */}
                {hasSuggestions && (
                  <div className="p-2 sm:p-3">
                    <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                      <span>Matching Ads</span>
                      {isLoadingSuggestions && <span className="text-[10px] lowercase animate-pulse">updating...</span>}
                    </div>

                    <div className="space-y-1 mt-1">
                      {suggestions.map((ad, idx) => {
                        const isHighlighted = idx === highlightedIndex;
                        const primaryImg = ad.images && ad.images.length > 0 ? ad.images[0].url : null;

                        return (
                          <Link
                            key={ad.id}
                            href={`/ads/${ad.slug}`}
                            onClick={() => saveRecentSearch(ad.title)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors group cursor-pointer ${
                              isHighlighted
                                ? 'bg-zinc-100 dark:bg-zinc-800'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            {/* Thumbnail */}
                            <div className="w-12 h-12 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-black/[0.04] dark:ring-white/[0.08]">
                              {primaryImg ? (
                                <img
                                  src={primaryImg}
                                  alt={ad.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                                  loading="lazy"
                                />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-zinc-400" />
                              )}
                            </div>

                            {/* Title & Metadata */}
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <h4 className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                {ad.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                <span className="font-bold text-price text-emerald-800 dark:text-emerald-400">
                                  {formatPKR(ad.price)}
                                </span>
                                <span>•</span>
                                <span className="truncate">{ad.locationCity}</span>
                                {ad.category && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate text-zinc-400">{ad.category.name}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <ArrowRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Recent Searches Section */}
                {showRecentSection && (
                  <div className="p-3">
                    <div className="flex items-center justify-between px-2 py-1 mb-1">
                      <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" /> Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearAllRecentSearches}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium cursor-pointer"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="space-y-1">
                      {recentSearches.map((item) => (
                        <div
                          key={item}
                          onClick={() => {
                            setSearchTerm(item);
                            executeSearch(item);
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                            <span className="truncate font-medium">{item}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeRecentSearch(e, item)}
                            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full cursor-pointer"
                            title="Remove from history"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Footer "See All Results" Link */}
                {searchTerm.trim() && (
                  <div
                    onClick={() => executeSearch()}
                    className="p-3 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Search className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">
                        Explore all results for <strong className="text-emerald-800 dark:text-emerald-400">&quot;{searchTerm}&quot;</strong>
                        {!isNationwide && ` in ${selectedCity.name}`}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Minimal Inline Trending Queries */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 text-xs">
            <span className="text-zinc-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Popular:
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
