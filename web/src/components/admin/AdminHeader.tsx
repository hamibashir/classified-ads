'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  ShieldCheck,
  LogOut,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const getPageTitle = (path: string): string => {
    if (path === '/admin') return 'Dashboard Overview';
    if (path.startsWith('/admin/moderation')) return 'Ad Moderation Queue';
    if (path.startsWith('/admin/reports')) return 'User Reports & Flags';
    if (path.startsWith('/admin/categories')) return 'Category Management';
    if (path.startsWith('/admin/users')) return 'User Management';
    if (path.startsWith('/admin/settings')) return 'System Settings';
    return 'Admin Console';
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 w-full h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            aria-label="Open admin navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
          >
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 hidden sm:inline-block" />
          <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {getPageTitle(pathname)}
          </h1>
        </div>
      </div>

      {/* Right: Status Pill & Admin User Profile */}
      <div className="flex items-center gap-3">
        {/* System Online Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Admin User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2.5 rounded-full border border-border px-2.5 h-10 hover:bg-muted/70"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0 shadow-xs">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block max-w-[120px]">
                  <div className="text-xs font-semibold text-foreground truncate leading-none">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase mt-0.5">
                    {user.role}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-semibold text-sm">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant="default" className="text-[10px] font-mono uppercase">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    {user.role}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">Admin Access</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Public Marketplace
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/post-ad" className="cursor-pointer gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Post Test Listing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
