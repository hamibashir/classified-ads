'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PostAdBanner: React.FC = () => {
  return (
    <section className="my-10 rounded-2xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <span className="inline-block px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            Sell Faster Across Pakistan
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Have something to sell? Post your ad for free in 60 seconds!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Reach thousands of active buyers in Karachi, Lahore, Islamabad, and all 13 major Pakistani cities.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-teal-100 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero commission fees
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct WhatsApp leads
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 8 photo uploads
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <Link href="/post-ad">
            <Button
              size="lg"
              className="bg-white hover:bg-slate-100 text-teal-950 font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 gap-2 text-base active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 text-teal-700" />
              <span>Post Your Free Ad Now</span>
              <ArrowRight className="w-4 h-4 text-teal-700" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
