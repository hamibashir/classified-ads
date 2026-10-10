'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSwitchAccount = () => {
    logout();
    router.push('/login?returnUrl=/admin');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/70">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border/80 rounded-2xl p-8 shadow-sm">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Title and Explanation */}
        <div className="space-y-2">
          <span className="inline-flex items-center text-[11px] font-mono font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Access Restricted
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Classified Ads PK administration console is restricted to verified platform administrators.
          </p>
        </div>

        {/* User Session Info Card */}
        {user && (
          <div className="bg-muted/40 border border-border/60 rounded-xl p-3 text-left space-y-1">
            <div className="text-[11px] font-medium text-muted-foreground">Currently Signed In As:</div>
            <div className="text-sm font-semibold text-foreground truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            <div className="pt-1">
              <span className="text-[10px] font-mono uppercase bg-background border border-border px-2 py-0.5 rounded font-semibold text-muted-foreground">
                Role: {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Action CTAs */}
        <div className="space-y-3 pt-2">
          <Button
            asChild
            className="w-full gap-2 font-semibold shadow-xs"
            variant="default"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Return to Marketplace
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleSwitchAccount}
          >
            <LogOut className="w-4 h-4" />
            Sign In with Different Account
          </Button>
        </div>

        {/* Help Link */}
        <div className="pt-2 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          <span>Need admin rights? Contact</span>
          <a
            href="mailto:admin@classifiedads.pk"
            className="text-primary font-medium hover:underline"
          >
            admin@classifiedads.pk
          </a>
        </div>
      </div>
    </div>
  );
}
