'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Home, ChevronRight, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { MediaGallery } from '@/components/ads/MediaGallery';
import { AdOverview } from '@/components/ads/AdOverview';
import { SellerSidebar } from '@/components/ads/SellerSidebar';
import { ReportAdModal } from '@/components/ads/ReportAdModal';
import { InspectionChecklist } from '@/components/ads/InspectionChecklist';
import { SimilarAdsSection } from '@/components/ads/SimilarAdsSection';
import { AdListItem } from '@/types/ad';
import { Button } from '@/components/ui/button';

// Seeded Pakistani listings for offline preview & testing
const FALLBACK_CATALOG: Record<string, AdListItem> = {
  'toyota-corolla-gli-13-automatic': {
    id: 'ad-corolla-1',
    title: 'Toyota Corolla GLi 1.3 Automatic (Super Clean Condition)',
    slug: 'toyota-corolla-gli-13-automatic',
    description: `Super clean, bumper to bumper original Toyota Corolla GLi 1.3 Automatic 2021 model.
Maintained exclusively through authorized Toyota dealership in Lahore with complete service records available.
Features & Specs:
- Immaculate interior with original floor mats and seat covers.
- Air conditioning and climate control chilling.
- Dual airbags, ABS brakes, retractable side mirrors with indicator signals.
- Fuel average 14-15 km/l in city and 17 km/l on motorway.
- Original number plates, smart card, and biometric verification on the spot.

Location: Gulberg III, Lahore. Serious buyers only please, no dealers or time wasters.`,
    price: 3850000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'Gulberg III, Main Boulevard',
    locationState: 'Punjab',
    latitude: 31.5126,
    longitude: 74.3484,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 1420,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    images: [
      {
        id: 'img-c1',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
      {
        id: 'img-c2',
        url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&auto=format&fit=crop&q=80',
        order: 1,
      },
      {
        id: 'img-c3',
        url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1000&auto=format&fit=crop&q=80',
        order: 2,
      },
      {
        id: 'img-c4',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80',
        order: 3,
      },
    ],
    category: { id: 'cat-motors', name: 'Motors & Vehicles', slug: 'motors-vehicles' },
    seller: {
      id: 'seller-tariq',
      name: 'Tariq Mehmood',
      avatarUrl: null,
      phone: '03001234567',
      isPhoneVerified: true,
      memberSince: '2023-01-15',
    },
  },
  'apple-iphone-14-pro-max-256gb-pta-approved': {
    id: 'ad-iphone-1',
    title: 'Apple iPhone 14 Pro Max 256GB Deep Purple (PTA Approved)',
    slug: 'apple-iphone-14-pro-max-256gb-pta-approved',
    description: `Official PTA Approved iPhone 14 Pro Max 256GB in Deep Purple finish.
Battery Health: 91%
Physical Condition: 10/10 scratchless, always used with tempered glass and Spigen cover.
Box & Accessories: Original box, untouched braided USB-C to Lightning cable, and warranty card.
Water resistance intact, never opened, never repaired. FaceID and TrueTone 100% operational.`,
    price: 295000,
    currency: 'PKR',
    isNegotiable: false,
    condition: 'USED',
    locationCity: 'Lahore',
    locationAddress: 'DHA Phase 5, Commercial Plaza',
    locationState: 'Punjab',
    latitude: 31.4646,
    longitude: 74.3942,
    showPhone: true,
    allowWhatsapp: true,
    viewsCount: 890,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    images: [
      {
        id: 'img-ip1',
        url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
      {
        id: 'img-ip2',
        url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1000&auto=format&fit=crop&q=80',
        order: 1,
      },
    ],
    category: { id: 'cat-mobiles', name: 'Mobiles & Tablets', slug: 'mobiles-tablets' },
    seller: {
      id: 'seller-hamza',
      name: 'Hamza Khan',
      avatarUrl: null,
      phone: '03219876543',
      isPhoneVerified: true,
      memberSince: '2022-08-20',
    },
  },
  'brand-new-1-kanal-luxury-designer-house': {
    id: 'ad-house-1',
    title: 'Brand New 1 Kanal Luxury Designer House for Sale',
    slug: 'brand-new-1-kanal-luxury-designer-house',
    description: `Architect-designed 1 Kanal ultra-luxurious Spanish/Modern designer bungalow in Sector F-7/2 Islamabad.
Features:
- 5 Master bedrooms with attached Italian porcelain bathrooms.
- 2 Designer kitchens with Smeg and Bosch fitted appliances.
- High-ceiling double height lobby with crystal chandelier.
- Basement entertainment lounge and cinema room.
- Servant quarters, solar setup installed, and 4-car garage parking.`,
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
    allowWhatsapp: false,
    viewsCount: 2450,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    images: [
      {
        id: 'img-h1',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
        order: 0,
        isFeatured: true,
      },
      {
        id: 'img-h2',
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80',
        order: 1,
      },
    ],
    category: { id: 'cat-prop', name: 'Property', slug: 'property' },
    seller: {
      id: 'seller-shahid',
      name: 'Shahid Properties',
      avatarUrl: null,
      phone: '03335551234',
      isPhoneVerified: true,
      memberSince: '2021-04-10',
    },
  },
};

interface AdDetailsPageProps {
  params: {
    slug: string;
  };
}

export default function AdDetailsPage({ params }: AdDetailsPageProps) {
  const { slug } = params;
  const [ad, setAd] = useState<AdListItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAdData() {
      setLoading(true);
      try {
        const res = await apiClient.get<AdListItem>(`/ads/${encodeURIComponent(slug)}`);
        const item = res?.data || (res as unknown as AdListItem);
        if (isMounted && item) {
          setAd(item);
          // Increment views silently
          if (item.id) {
            apiClient.post(`/ads/${item.id}/view`).catch(() => {});
          }
        }
      } catch {
        // Fallback resolution
        if (isMounted) {
          const fallback =
            FALLBACK_CATALOG[slug] ||
            Object.values(FALLBACK_CATALOG).find((item) => item.slug === slug) ||
            FALLBACK_CATALOG['toyota-corolla-gli-13-automatic'];
          setAd(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (!loading && !ad) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Breadcrumb Header Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-teal-700 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
            {ad?.category && (
              <>
                <Link
                  href={`/search?category=${encodeURIComponent(ad.category.slug)}`}
                  className="hover:text-teal-700 transition-colors"
                >
                  {ad.category.name}
                </Link>
                <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
              </>
            )}
            <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
              {ad?.title || 'Listing Details'}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-medium">Loading ad details...</p>
          </div>
        ) : ad ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Primary Column (Col-Span-2): Media Gallery & Ad Overview */}
            <div className="lg:col-span-2 space-y-8">
              {/* Task 8.7: Interactive Media Gallery */}
              <MediaGallery images={ad.images} title={ad.title} />

              {/* Task 8.7: Ad Overview, Pricing, Specs & Description */}
              <AdOverview ad={ad} />

              {/* Category-Specific Buyer Inspection & Fraud Protection Checklist */}
              <InspectionChecklist category={ad.category} />
            </div>

            {/* Sidebar Column (Col-Span-1): Seller Overview & Contact CTAs (Task 8.8) */}
            <div className="lg:col-span-1">
              <SellerSidebar
                ad={ad}
                className="lg:sticky lg:top-24"
                onReportClick={() => setIsReportModalOpen(true)}
              />
            </div>

            {/* Task 8.9: Ad Reporting Modal */}
            <ReportAdModal
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
              adId={ad.id}
              adTitle={ad.title}
              adSlug={ad.slug}
              sellerId={ad.seller?.id || ad.user?.id}
            />

            {/* Similar Listings Carousel */}
            <div className="lg:col-span-3">
              <SimilarAdsSection
                currentAdId={ad.id}
                categorySlug={ad.category?.slug}
                categoryName={ad.category?.name}
                cityName={ad.locationCity}
              />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-4">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">Ad Not Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              This classified listing may have been sold or removed by the seller.
            </p>
            <Link href="/search">
              <Button variant="primary" size="sm">
                Browse Marketplace Ads
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
