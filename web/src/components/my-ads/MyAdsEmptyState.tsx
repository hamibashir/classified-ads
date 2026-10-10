import React from 'react';
import { PackageOpen, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MyAdsFilterTab } from '@/types/ad';

interface MyAdsEmptyStateProps {
  currentTab: MyAdsFilterTab;
  onResetTab?: () => void;
}

export function MyAdsEmptyState({ currentTab, onResetTab }: MyAdsEmptyStateProps) {
  let title = 'No ads published yet';
  let description =
    'Sell your vehicle, mobile phone, electronics or property to buyers across Pakistan with zero listing fees.';

  if (currentTab === 'ACTIVE') {
    title = 'No active listings found';
    description = 'You have no listings currently live on the marketplace.';
  } else if (currentTab === 'PENDING') {
    title = 'No ads under moderation review';
    description = 'All your submitted ads have either been approved or completed review.';
  } else if (currentTab === 'SOLD') {
    title = 'No listings marked as sold';
    description = 'Items you mark as sold will be archived here for your records.';
  } else if (currentTab === 'EXPIRED') {
    title = 'No expired listings';
    description = 'Ads past their expiry duration will show up here.';
  } else if (currentTab === 'REJECTED') {
    title = 'No rejected listings';
    description = 'None of your ads have been rejected by moderation.';
  }

  return (
    <div className="bg-card border border-border border-dashed rounded-2xl p-8 sm:p-14 text-center space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto shadow-2xs">
        <PackageOpen className="w-7 h-7" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href="/post-ad">
          <Button className="h-10 px-5 font-semibold gap-2 shadow-xs">
            <PlusCircle className="w-4 h-4" />
            <span>Post an Ad</span>
          </Button>
        </Link>

        {currentTab !== 'ALL' && onResetTab && (
          <Button
            variant="outline"
            className="h-10 px-5 font-medium border-border"
            onClick={onResetTab}
          >
            <span>View All Listings</span>
          </Button>
        )}
      </div>
    </div>
  );
}
