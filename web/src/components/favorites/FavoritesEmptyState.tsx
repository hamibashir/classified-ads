import React from 'react';
import { Heart, Search, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function FavoritesEmptyState() {
  const POPULAR_SHORTCUTS = [
    { name: 'Motors & Cars', slug: 'motors-vehicles' },
    { name: 'Mobile Phones', slug: 'mobiles-tablets' },
    { name: 'Electronics', slug: 'electronics-appliances' },
    { name: 'Property & Houses', slug: 'property' },
    { name: 'Bikes', slug: 'motorcycles' },
  ];

  return (
    <div className="bg-card border border-border border-dashed rounded-2xl p-8 sm:p-14 text-center space-y-6 animate-in fade-in-50 duration-200">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center mx-auto shadow-2xs">
        <Heart className="w-8 h-8 fill-rose-100 dark:fill-rose-900" />
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          No saved ads yet
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Keep track of cars, phones, laptops, and properties you love by tapping the heart icon on any ad.
        </p>
      </div>

      {/* Popular Categories Shortcut Chips */}
      <div className="space-y-2 max-w-md mx-auto">
        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
          <Tag className="w-3.5 h-3.5 text-primary" /> Start browsing popular categories:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {POPULAR_SHORTCUTS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${encodeURIComponent(cat.slug)}`}
              className="px-3 py-1.5 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary text-xs font-semibold text-foreground border border-border/60 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Link href="/search">
          <Button className="h-10 px-6 font-semibold gap-2 shadow-xs">
            <Search className="w-4 h-4" />
            <span>Explore All Marketplace Ads</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
