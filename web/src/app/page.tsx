'use client';

import * as React from 'react';
import { HomeHero } from '@/components/home/HomeHero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { NearbyAdsSection } from '@/components/home/NearbyAdsSection';
import { PostAdBanner } from '@/components/home/PostAdBanner';
import { FreshRecommendationsSection } from '@/components/home/FreshRecommendationsSection';
import { SafeTradingSection } from '@/components/home/SafeTradingSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* 1. Hero & Global Search Section */}
        <HomeHero />

        {/* 2. Popular Categories Grid */}
        <CategoryGrid />

        {/* 3. Nearby Ads (GPS Proximity & Active City Listings) */}
        <NearbyAdsSection />

        {/* 4. High-Converting Post Ad CTA Banner */}
        <PostAdBanner />

        {/* 5. Fresh Recommendations Feed with Category Filters */}
        <FreshRecommendationsSection />

        {/* 6. Pakistani Safe Trading & Fraud Prevention Guidelines */}
        <SafeTradingSection />
      </div>
    </main>
  );
}
