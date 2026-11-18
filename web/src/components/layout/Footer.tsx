'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, MapPin } from 'lucide-react';
import { PAKISTANI_CITIES } from '@/constants/cities';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Do not render marketplace footer on admin panel routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="w-full border-t border-border/80 bg-card text-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Platform Intro */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs tracking-tight shadow-xs">
                ZB
              </span>
              <span className="font-extrabold text-foreground text-sm tracking-tight flex items-center gap-1">
                <span>Zaaz</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black">B</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pakistan&apos;s premier verified marketplace for vehicles, mobile phones, electronics, real estate, and services with direct peer-to-peer communication.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-800 dark:text-emerald-400" />
              <span>Zero Commission • Verified Community</span>
            </div>
          </div>

          {/* Popular Pakistani Cities */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Popular Cities
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {PAKISTANI_CITIES.filter((c) => c.isPopular).slice(0, 6).map((city) => (
                <li key={city.id}>
                  <Link
                    href={`/search?city=${city.id}`}
                    className="hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="h-3 w-3 text-zinc-400" />
                    <span>Ads in {city.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Categories */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Trending Categories
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/search?category=motors-vehicles" className="hover:text-foreground transition-colors">
                  Cars & Motors
                </Link>
              </li>
              <li>
                <Link href="/search?category=mobiles-tablets" className="hover:text-foreground transition-colors">
                  Mobile Phones & Tablets
                </Link>
              </li>
              <li>
                <Link href="/search?category=electronics-appliances" className="hover:text-foreground transition-colors">
                  Electronics & Appliances
                </Link>
              </li>
              <li>
                <Link href="/search?category=property" className="hover:text-foreground transition-colors">
                  Real Estate & Property
                </Link>
              </li>
              <li>
                <Link href="/search?category=services" className="hover:text-foreground transition-colors">
                  Local Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplace Safety Tips */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Safe Trading in Pakistan
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-800 dark:text-emerald-400 font-bold">•</span>
                <span>Always meet in secure, daylight public places.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-800 dark:text-emerald-400 font-bold">•</span>
                <span>Verify PTA DIRBS status via 8484 before buying phones.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-800 dark:text-emerald-400 font-bold">•</span>
                <span>Execute biometric transfers for cars & bikes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-800 dark:text-emerald-400 font-bold">•</span>
                <span>Zero advance deposits before physical item verification.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="border-t border-border/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Zaaz B. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Pakistan Marketplace (PKR)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
