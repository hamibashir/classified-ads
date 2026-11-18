'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  MapPin,
  Plus,
  MessageSquare,
  Bookmark,
  Shield,
  Heart,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useGeolocation } from '@/hooks/useGeolocation';
import { CityPickerModal } from './CityPickerModal';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const { selectedCity, isGpsActive } = useGeolocation();

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Do not render marketplace navbar on admin panel routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams();
    params.set('q', searchQuery.trim());
    if (selectedCity?.id) {
      params.set('city', selectedCity.id);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Brand Logo & Location Anchor */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/"
                className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
              >
                <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xs tracking-tight shadow-xs">
                  ZB
                </span>
                <div className="hidden min-[420px]:block">
                  <div className="text-sm font-extrabold text-foreground tracking-tight leading-none flex items-center gap-1">
                    <span>Zaaz</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-black">B</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight font-semibold tracking-wider uppercase mt-0.5">
                    Premier Marketplace
                  </p>
                </div>
              </Link>

              {/* Minimal Location Selector Chip */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border/80 hover:border-zinc-400 dark:hover:border-zinc-600 bg-secondary/40 text-xs font-medium text-foreground transition-colors cursor-pointer"
                title="Change city"
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-800 dark:text-emerald-400 shrink-0" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
                  {selectedCity.name}
                </span>
                {isGpsActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
                )}
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
              </button>
            </div>

            {/* Desktop Global Search Dock */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-md lg:max-w-lg mx-2 relative items-center"
            >
              <Search className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search cars, mobiles, property in ${selectedCity.name}...`}
                className="pl-9 pr-18 h-9.5 w-full bg-secondary/50 focus-visible:bg-card border-border/80 focus-visible:border-zinc-400 dark:focus-visible:border-zinc-600 transition-colors text-xs sm:text-sm rounded-xl font-medium"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 h-7.5 px-3 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 transition-colors"
              >
                Find
              </Button>
            </form>

            {/* Right Action Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Authenticated Desktop Actions: Chat & Saved */}
              {isAuthenticated && (
                <>
                  <Link href="/chat" className="hidden md:inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1.5 h-9 px-3 rounded-xl text-xs font-medium transition-colors ${
                        pathname === '/chat'
                          ? 'bg-secondary text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </Button>
                  </Link>

                  <Link href="/favorites" className="hidden md:inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1.5 h-9 px-3 rounded-xl text-xs font-medium transition-colors ${
                        pathname === '/favorites'
                          ? 'bg-secondary text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Heart className="h-4 w-4" />
                      <span>Saved</span>
                    </Button>
                  </Link>
                </>
              )}

              {/* User Account / Sign In */}
              {isAuthLoading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-xl border border-border/80 px-2.5 h-9 hover:border-zinc-400 dark:hover:border-zinc-600"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {user.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="text-xs font-medium max-w-[90px] truncate hidden sm:inline-block">
                        {user.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/80">
                    <DropdownMenuLabel>
                      <div className="font-semibold text-sm text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      <div className="mt-1.5 flex gap-1.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {user.role}
                        </Badge>
                        {user.isPhoneVerified && (
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-600/20">
                            Verified
                          </span>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-ads" className="cursor-pointer gap-2 text-xs">
                        <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="cursor-pointer gap-2 text-xs">
                        <Heart className="h-3.5 w-3.5 text-zinc-400" />
                        Saved Ads
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/chat" className="cursor-pointer gap-2 text-xs">
                        <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer gap-2 text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                          <Shield className="h-3.5 w-3.5" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer gap-2 text-xs"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium h-9 px-3 rounded-xl border-border/80 hover:border-zinc-400 dark:hover:border-zinc-600">
                    <LogIn className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              )}

              {/* Primary Post Ad Button (Racing Forest) */}
              <Link href="/post-ad" className="hidden sm:inline-block">
                <Button
                  className="gap-1.5 h-9 px-4 text-xs font-semibold rounded-xl bg-[#0D382B] hover:bg-[#07241B] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-zinc-950 shadow-xs transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Post Listing</span>
                </Button>
              </Link>

              {/* Mobile Hamburger Toggle */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-muted-foreground rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search Input Row */}
          <div className="pb-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-zinc-400 pointer-events-none" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${selectedCity.name}...`}
                className="pl-9 pr-16 h-9 w-full bg-secondary/50 text-xs rounded-xl border-border/80"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 h-7 px-2.5 text-xs font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
              >
                Go
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/80 bg-card px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 text-xs text-muted-foreground">
              <span>Location:</span>
              <button
                type="button"
                onClick={() => {
                  setIsCityModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="font-semibold text-foreground flex items-center gap-1 hover:underline"
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-800 dark:text-emerald-400" />
                {selectedCity.name}, PK {isGpsActive ? '(GPS)' : ''}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/post-ad"
                onClick={() => setIsMobileMenuOpen(false)}
                className="col-span-2"
              >
                <Button className="w-full h-10 gap-2 font-semibold bg-[#0D382B] text-white dark:bg-emerald-500 dark:text-zinc-950 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Post a Listing for Free
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/my-ads"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs rounded-xl border-border/80">
                      <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
                      My Listings
                    </Button>
                  </Link>
                  <Link
                    href="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs rounded-xl border-border/80">
                      <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                      Messages
                    </Button>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="col-span-2"
                >
                  <Button variant="outline" className="w-full gap-2 text-xs rounded-xl border-border/80">
                    <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                    Sign In or Register
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global City Picker Modal */}
      <CityPickerModal
        open={isCityModalOpen}
        onOpenChange={setIsCityModalOpen}
      />
    </>
  );
};
