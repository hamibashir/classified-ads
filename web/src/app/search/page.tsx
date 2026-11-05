'use client';

import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Home,
  ChevronRight,
  PackageSearch,
  RotateCcw,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { calculateDistanceKm } from '@/lib/geo-utils';
import { findCityByIdOrName } from '@/constants/cities';
import { AdCard } from '@/components/ads/AdCard';
import { AdCardSkeleton } from '@/components/ads/AdCardSkeleton';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { MobileFilterDrawer } from '@/components/search/MobileFilterDrawer';
import { SearchResultsHeader } from '@/components/search/SearchResultsHeader';
import { AdListItem } from '@/types/ad';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Rich Pakistani classified ads dataset for search filtering
const SEARCH_FALLBACK_ADS: (AdListItem & { subcatSlug?: string })[] = [
  {
    id: 's-1',
    title: 'Toyota Corolla Altis Grande 1.8 CVT-i 2022',
    slug: 'toyota-corolla-altis-grande-2022',
    price: 6850000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'DHA Phase 5',
    locationState: 'Punjab',
    latitude: 31.4646,
    longitude: 74.3942,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 840,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    images: [
      {
        id: 'img-s-1',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-motors', name: 'Cars', slug: 'motors-vehicles' },
    subcatSlug: 'cars',
  },
  {
    id: 's-2',
    title: 'Honda Civic Oriel 1.8 i-VTEC Sunroof 2021',
    slug: 'honda-civic-oriel-2021-lahore',
    price: 5400000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'Gulberg III',
    locationState: 'Punjab',
    latitude: 31.5126,
    longitude: 74.3484,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 920,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    images: [
      {
        id: 'img-s-2',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-motors', name: 'Cars', slug: 'motors-vehicles' },
    subcatSlug: 'cars',
  },
  {
    id: 's-3',
    title: 'Apple iPhone 14 Pro Max 256GB Deep Purple (PTA Approved)',
    slug: 'iphone-14-pro-max-256gb-karachi',
    price: 295000,
    currency: 'PKR',
    isNegotiable: false,
    condition: 'USED',
    locationCity: 'Karachi',
    locationAddress: 'Clifton Block 4',
    locationState: 'Sindh',
    latitude: 24.8138,
    longitude: 67.0306,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 1100,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    images: [
      {
        id: 'img-s-3',
        url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-mobiles', name: 'Smartphones', slug: 'mobiles-tablets' },
    subcatSlug: 'smartphones',
  },
  {
    id: 's-4',
    title: 'Samsung Galaxy S23 Ultra 512GB Green (Box Packed)',
    slug: 'samsung-s23-ultra-islamabad',
    price: 275000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'NEW',
    locationCity: 'Islamabad',
    locationAddress: 'Sector F-7/2',
    locationState: 'Islamabad Capital Territory',
    latitude: 33.7215,
    longitude: 73.0545,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 650,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    images: [
      {
        id: 'img-s-4',
        url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-mobiles', name: 'Smartphones', slug: 'mobiles-tablets' },
    subcatSlug: 'smartphones',
  },
  {
    id: 's-5',
    title: 'MacBook Pro 16 M2 Max 32GB 1TB Space Gray',
    slug: 'macbook-pro-16-m2-max-lahore',
    price: 650000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'Model Town',
    locationState: 'Punjab',
    latitude: 31.4827,
    longitude: 74.3184,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 480,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    images: [
      {
        id: 'img-s-5',
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-elec', name: 'Laptops', slug: 'electronics-appliances' },
    subcatSlug: 'computers-laptops',
  },
  {
    id: 's-6',
    title: 'Brand New 1 Kanal Luxury Designer House for Sale',
    slug: '1-kanal-luxury-designer-house-islamabad',
    price: 65000000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'NEW',
    locationCity: 'Islamabad',
    locationAddress: 'Sector F-7/2',
    locationState: 'Islamabad Capital Territory',
    latitude: 33.7215,
    longitude: 73.0545,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 1600,
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    images: [
      {
        id: 'img-s-6',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-prop', name: 'Houses', slug: 'property' },
    subcatSlug: 'houses-for-sale',
  },
  {
    id: 's-7',
    title: 'Yamaha YBR 125G 2023 Black (First Owner, Low Mileage)',
    slug: 'yamaha-ybr-125g-rawalpindi',
    price: 385000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Rawalpindi',
    locationAddress: 'Saddar',
    locationState: 'Punjab',
    latitude: 33.5973,
    longitude: 73.0479,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 310,
    createdAt: new Date(Date.now() - 25200000).toISOString(),
    images: [
      {
        id: 'img-s-7',
        url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-bikes', name: 'Motorcycles', slug: 'motorcycles' },
    subcatSlug: 'motorcycles',
  },
  {
    id: 's-8',
    title: 'Home Solar System 10kW On-Grid Inverter & Tier-1 Panels',
    slug: 'home-solar-system-10kw-lahore',
    price: 1350000,
    currency: 'PKR',
    isNegotiable: false,
    condition: 'NEW',
    locationCity: 'Lahore',
    locationAddress: 'Johar Town',
    locationState: 'Punjab',
    latitude: 31.4697,
    longitude: 74.2728,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 540,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    images: [
      {
        id: 'img-s-8',
        url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
    ],
    category: { id: 'cat-services', name: 'Services', slug: 'services' },
    subcatSlug: 'services',
  },
];

function SearchContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query params
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const subcat = searchParams.get('subcat') || '';
  const city = searchParams.get('city') || '';
  const radius = searchParams.get('radius') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const condition = searchParams.get('condition') || '';
  const sort = searchParams.get('sort') || 'newest';

  const [searchInput, setSearchInput] = useState(query);
  const [ads, setAds] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Helper to push new query string cleanly
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const current = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });
      router.push(`/search?${current.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchInput });
  };

  const handleRemoveFilter = (key: string) => {
    if (key === 'q') setSearchInput('');
    updateUrlParams({ [key]: null });
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    router.push('/search', { scroll: false });
  };

  // Data fetching logic
  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: 20,
        sort,
      };
      if (query) params.q = query;
      if (category) params.category = category;
      if (subcat) params.subcat = subcat;
      if (city) params.city = city;
      if (radius) params.radius = radius;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (condition) params.condition = condition;

      const response = await apiClient.get<AdListItem[]>('/ads', {
        params,
      });

      const items: AdListItem[] = Array.isArray(response)
        ? response
        : Array.isArray((response as { data?: AdListItem[] })?.data)
        ? (response as { data: AdListItem[] }).data
        : (response as { ads?: AdListItem[] }).ads || [];

      if (items.length > 0) {
        setAds(items);
      } else {
        throw new Error('Empty backend list');
      }
    } catch {
      // Local filtering against fallback catalog
      let filtered = [...SEARCH_FALLBACK_ADS];

      if (query) {
        const lowerQ = query.toLowerCase();
        filtered = filtered.filter(
          (ad) =>
            ad.title.toLowerCase().includes(lowerQ) ||
            ad.category?.name.toLowerCase().includes(lowerQ)
        );
      }

      if (category) {
        filtered = filtered.filter(
          (ad) =>
            ad.category?.slug === category ||
            (ad.category?.id && ad.category.id.includes(category))
        );
      }

      if (subcat) {
        filtered = filtered.filter((ad) => {
          const s = subcat.toLowerCase();
          const adSub = (ad.subcatSlug || '').toLowerCase();
          return (
            adSub === s ||
            ad.category?.slug === s ||
            ad.slug.toLowerCase().includes(s) ||
            ad.title.toLowerCase().includes(s) ||
            (s === 'cars' && (ad.category?.slug === 'motors-vehicles' || /corolla|civic|alto|car/i.test(ad.title))) ||
            (s === 'motorcycles' && (ad.category?.slug === 'motorcycles' || /ybr|bike/i.test(ad.title))) ||
            (s === 'smartphones' && (ad.category?.slug === 'mobiles-tablets' || /iphone|samsung|ultra/i.test(ad.title))) ||
            (s === 'computers-laptops' && (ad.category?.slug === 'electronics-appliances' || /macbook|laptop|xps/i.test(ad.title))) ||
            (s === 'houses-for-sale' && (ad.category?.slug === 'property' || /house|villa|marla/i.test(ad.title)))
          );
        });
      }

      if (city) {
        filtered = filtered.filter(
          (ad) => ad.locationCity.toLowerCase() === city.toLowerCase()
        );
      }

      if (radius && city) {
        try {
          const cityObj = findCityByIdOrName(city);
          const rNum = parseInt(radius);
          filtered = filtered.filter((ad) => {
            if (ad.latitude && ad.longitude) {
              const dist = calculateDistanceKm(cityObj.coordinates, {
                latitude: ad.latitude,
                longitude: ad.longitude,
              });
              return dist <= rNum;
            }
            return true;
          });
        } catch {
          // ignore error if city not found
        }
      }

      if (minPrice) {
        const min = parseInt(minPrice);
        filtered = filtered.filter((ad) => ad.price >= min);
      }

      if (maxPrice) {
        const max = parseInt(maxPrice);
        filtered = filtered.filter((ad) => ad.price <= max);
      }

      if (condition) {
        filtered = filtered.filter((ad) => ad.condition === condition);
      }

      // Sort
      if (sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'popular') {
        filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
      } else {
        // newest
        filtered.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      setAds(filtered);
    } finally {
      setLoading(false);
    }
  }, [query, category, subcat, city, radius, minPrice, maxPrice, condition, sort]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const activeFilters = useMemo(
    () => ({
      q: query,
      category,
      subcat,
      city,
      radius,
      minPrice,
      maxPrice,
      condition,
      sort,
    }),
    [query, category, subcat, city, radius, minPrice, maxPrice, condition, sort]
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Search Header Bar & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-teal-700 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-800">Search Results</span>
          </nav>

          {/* Search Query Input */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search cars, mobile phones, electronics, real estate..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-11 text-sm bg-slate-50/70 border-slate-300 focus:bg-white"
              />
            </div>
            <Button type="submit" variant="primary" className="h-11 px-6 font-semibold">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main 2-Column Search Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8 items-start">
          {/* Left Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1 bg-card p-4 sm:p-5 rounded-2xl border border-border/80 sticky top-24">
            <FilterSidebar
              selectedCategory={category}
              selectedSubcategory={subcat}
              selectedCity={city}
              minPrice={minPrice}
              maxPrice={maxPrice}
              condition={condition}
              onCategoryChange={(cat) => updateUrlParams({ category: cat, subcat: null })}
              onSubcategoryChange={(s) => updateUrlParams({ subcat: s || null })}
              onCityChange={(c) => updateUrlParams({ city: c })}
              onPriceChange={(min, max) =>
                updateUrlParams({ minPrice: min || null, maxPrice: max || null })
              }
              onConditionChange={(cond) => updateUrlParams({ condition: cond || null })}
              onClearFilters={handleClearAllFilters}
            />
          </div>

          {/* Right Results Column */}
          <main className="lg:col-span-3 space-y-6">
            <SearchResultsHeader
              totalCount={ads.length}
              filters={activeFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onClearAll={handleClearAllFilters}
              onRemoveFilter={(k) => handleRemoveFilter(k as string)}
              onSortChange={(s) => updateUrlParams({ sort: s })}
              mobileFilterTrigger={
                <MobileFilterDrawer
                  selectedCategory={category}
                  selectedSubcategory={subcat}
                  selectedCity={city}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  condition={condition}
                  onCategoryChange={(cat) => updateUrlParams({ category: cat, subcat: null })}
                  onSubcategoryChange={(s) => updateUrlParams({ subcat: s || null })}
                  onCityChange={(c) => updateUrlParams({ city: c })}
                  onPriceChange={(min, max) =>
                    updateUrlParams({ minPrice: min || null, maxPrice: max || null })
                  }
                  onConditionChange={(cond) => updateUrlParams({ condition: cond || null })}
                  onClearFilters={handleClearAllFilters}
                />
              }
            />

            {/* Results Rendering: Grid vs List Layout */}
            {loading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {Array.from({ length: 6 }).map((_, idx) => (
                  <AdCardSkeleton key={idx} />
                ))}
              </div>
            ) : ads.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              /* Enhanced Empty Search State with Category Recovery Links */
              <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-6">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <PackageSearch className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-800">
                    No matching classified ads found
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                    We couldn&apos;t find any ads matching your current search criteria. Try
                    broadening your price range, removing filters, or browsing top categories below.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto pt-1">
                  <span className="text-xs text-slate-400 w-full mb-1">Browse Popular Categories:</span>
                  {[
                    { name: 'Motors & Vehicles', slug: 'motors-vehicles' },
                    { name: 'Mobiles & Tablets', slug: 'mobiles-tablets' },
                    { name: 'Electronics', slug: 'electronics-appliances' },
                    { name: 'Property', slug: 'property' },
                    { name: 'Motorcycles', slug: 'motorcycles' },
                  ].map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => updateUrlParams({ category: cat.slug, q: null, subcat: null })}
                      className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    onClick={handleClearAllFilters}
                    className="gap-2 font-semibold text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear All Filters</span>
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/50 p-8 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Loading marketplace search...</p>
          </div>
        </div>
      }
    >
      <SearchContainer />
    </Suspense>
  );
}
