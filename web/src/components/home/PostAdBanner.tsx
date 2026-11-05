'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, ShieldCheck, Zap, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PostAdBanner: React.FC = () => {
  return (
    <section className="my-8 sm:my-12 rounded-2xl bg-[#081B15] border border-[#14392D] text-white p-6 sm:p-10 relative overflow-hidden transition-colors">
      {/* Subtle Architectural Dot Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
        {/* Left Column: Editorial Copy */}
        <div className="space-y-3 max-w-2xl text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">
            Direct Peer-to-Peer Marketplace
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            Sell directly to verified buyers across Pakistan
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300/85 leading-relaxed font-normal">
            List your vehicle, device, property, or service in minutes. Enjoy instant local reach without middleman commissions.
          </p>

          {/* Minimal Value Props */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300/90 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero Commission Fees</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Buyer Inquiries</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Up to 8 High-Res Photos</span>
            </span>
          </div>
        </div>

        {/* Right Column: Grounded Minimal CTA */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-2.5">
          <Link href="/post-ad" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto h-12 px-7 bg-white hover:bg-zinc-100 text-zinc-950 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-zinc-950" />
              <span>Post a Listing</span>
              <ArrowRight className="w-4 h-4 text-zinc-950" />
            </Button>
          </Link>

          <span className="text-[11px] text-zinc-400 font-medium">
            Takes under 2 minutes • 100% Free
          </span>
        </div>
      </div>
    </section>
  );
};
