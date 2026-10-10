'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Heart, MapPin } from 'lucide-react';
import { PAKISTANI_CITIES } from '@/constants/cities';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Do not render marketplace footer on admin panel routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full border-t border-border bg-card text-card-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Platform Intro */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-sm">
                C
              </span>
              <span className="font-bold text-foreground text-base tracking-tight">
                Classified Ads <span className="text-primary font-black">PK</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pakistan&apos;s leading local marketplace for vehicles, mobile phones, electronics, real estate, jobs, and daily services with real-time chat and direct contact.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>100% Free Ad Posting Across Pakistan</span>
            </div>
          </div>

          {/* Popular Pakistani Cities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Popular Cities
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {PAKISTANI_CITIES.filter((c) => c.isPopular).slice(0, 6).map((city) => (
                <li key={city.id}>
                  <Link
                    href={`/search?city=${city.id}`}
                    className="hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="h-3 w-3 text-muted-foreground/70" />
                    <span>Ads in {city.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Trending Categories
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/search?category=motors-vehicles" className="hover:text-primary transition-colors">
                  Cars & Motors
                </Link>
              </li>
              <li>
                <Link href="/search?category=mobiles-tablets" className="hover:text-primary transition-colors">
                  Mobile Phones & Tablets
                </Link>
              </li>
              <li>
                <Link href="/search?category=electronics-appliances" className="hover:text-primary transition-colors">
                  Electronics & Appliances
                </Link>
              </li>
              <li>
                <Link href="/search?category=property" className="hover:text-primary transition-colors">
                  Real Estate & Property
                </Link>
              </li>
              <li>
                <Link href="/search?category=jobs" className="hover:text-primary transition-colors">
                  Jobs & Careers
                </Link>
              </li>
              <li>
                <Link href="/search?category=services" className="hover:text-primary transition-colors">
                  Local Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplace Safety Tips */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Safe Trading in Pakistan
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span>Always meet in secure, well-lit public places.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span>Thoroughly inspect items before handing over money.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span>Avoid transferring advance payments or bank deposits.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary font-bold">•</span>
                <span>Report suspicious sellers or counterfeit listings to admin.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Classified Ads PK. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
            <span>for Pakistan (PKR • Pakistani Rupee)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
