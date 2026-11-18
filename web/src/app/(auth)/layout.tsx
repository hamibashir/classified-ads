import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Zap, Lock } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/70">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to Browse Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Marketplace
          </Link>

          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Zaaz B
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-sm shadow-sm">
              ZB
            </div>
            <div className="text-left">
              <span className="text-xl font-bold tracking-tight text-foreground block leading-none flex items-center gap-1">
                <span>Zaaz</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-black">B</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
                Premier Marketplace
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Auth Card Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-7 px-5 sm:px-8 shadow-sm border border-border/80 rounded-2xl">
          {children}
        </div>

        {/* Marketplace Trust Badges */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50 border border-border/40">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Verified Sellers</span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">Phone Checked</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50 border border-border/40">
            <Zap className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-foreground">Free Ad Posting</span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">Sell in Minutes</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50 border border-border/40">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-foreground">Secure Chats</span>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">End-to-End Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
