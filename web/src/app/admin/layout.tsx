'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const returnUrl = encodeURIComponent(pathname || '/admin');
        router.push(`/login?returnUrl=${returnUrl}`);
      } else if (user?.role !== 'ADMIN') {
        router.push('/forbidden');
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Loading state while auth initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-sm font-semibold tracking-wide">Authenticating Admin Console</div>
          <div className="text-xs text-slate-400">Verifying security clearance and credentials...</div>
        </div>
      </div>
    );
  }

  // Fallback while redirecting unauthenticated or non-admin users
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" />
        <div className="text-sm text-slate-300">Access Restricted. Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Administrative Workspace */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Header Bar */}
        <AdminHeader onMenuToggle={() => setIsMobileMenuOpen(true)} />

        {/* Dynamic Route Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
