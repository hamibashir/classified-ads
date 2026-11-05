'use client';

import React from 'react';
import { ShieldCheck, Eye, Smartphone, Car, Lock } from 'lucide-react';

const GUIDELINES = [
  {
    icon: Eye,
    title: 'Meet in Public Locations',
    description:
      'Always arrange inspections during daylight hours in busy commercial centers, fuel stations, or metro stations.',
    tag: 'Daylight Verification',
  },
  {
    icon: Smartphone,
    title: 'Verify PTA Approval',
    description:
      'For smartphones and tablets, verify the 15-digit IMEI number via 8484 SMS or the official PTA DIRBS database before purchasing.',
    tag: 'PTA 8484 Check',
  },
  {
    icon: Car,
    title: 'Biometric Vehicle Transfer',
    description:
      'For cars and motorcycles, ensure government biometric verification is executed and excise tax records are validated prior to payment.',
    tag: 'Excise & Biometrics',
  },
  {
    icon: Lock,
    title: 'Zero Advance Deposits',
    description:
      'Never send advance booking deposits via Easypaisa, JazzCash, or bank wire before physically seeing and verifying the item.',
    tag: 'Pay on Handover',
  },
];

export const SafeTradingSection: React.FC = () => {
  return (
    <section className="my-8 sm:my-12 p-6 sm:p-8 rounded-2xl bg-card border border-border/80">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-border/60 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase">
              Buyer & Seller Protection
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-600/20">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Pakistan Standard
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Safe Trading Guidelines
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Essential protocols to guarantee secure, transparent, and hassle-free peer transactions.
          </p>
        </div>
      </div>

      {/* 4 Security Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {GUIDELINES.map((guide) => {
          const Icon = guide.icon;
          return (
            <div
              key={guide.title}
              className="p-4 sm:p-5 rounded-xl bg-secondary/40 border border-border/60 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-150 flex flex-col justify-between min-h-[170px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-400 flex items-center justify-center border border-border/50">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-secondary/80 px-2 py-0.5 rounded">
                    {guide.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
