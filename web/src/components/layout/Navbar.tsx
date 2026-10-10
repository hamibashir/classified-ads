'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  MapPin,
  Sparkles,
  LogOut,
  User as UserIcon,
  LogIn,
  Menu,
  X,
  PlusCircle,
  MessageSquare,
  Bookmark,
  Shield,
  Heart,
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
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 group transition-transform active:scale-95"
              >
                <span className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-sm group-hover:brightness-105 transition-all">
                  C
                </span>
                <div className="hidden min-[420px]:block">
                  <div className="text-base font-bold text-foreground leading-tight tracking-tight">
                    Classified Ads <span className="text-primary font-black">PK</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-none font-medium">
                    Pakistan Marketplace
                  </p>
                </div>
              </Link>

              {/* Location Chip Trigger */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold h-9 px-2.5 rounded-lg border-border hover:border-primary/50 transition-colors"
                onClick={() => setIsCityModalOpen(true)}
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="max-w-[85px] sm:max-w-[120px] truncate">
                  {selectedCity.name}, PK
                </span>
                {isGpsActive && (
                  <span className="bg-primary/10 text-primary text-[9px] px-1 py-0.2 rounded font-mono font-bold leading-none hidden sm:inline-block">
                    GPS
                  </span>
                )}
                <span className="text-[9px] text-muted-foreground">▼</span>
              </Button>
            </div>

            {/* Desktop Global Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-lg mx-2 relative items-center"
            >
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search cars, mobiles, jobs in ${selectedCity.name}...`}
                className="pl-9 pr-20 h-10 w-full bg-muted/40 focus-visible:bg-background transition-colors text-sm rounded-lg"
              />
              <Button
                type="submit"
                size="sm"
                variant="primary"
                className="absolute right-1 h-8 px-3 text-xs font-medium rounded-md"
              >
                Find
              </Button>
            </form>

            {/* Right Action Items */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Authenticated Desktop Quick Actions: Chat & Saved */}
              {isAuthenticated && (
                <>
                  <Link href="/chat" className="hidden md:inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                        pathname === '/chat'
                          ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 text-teal-600" />
                      <span>Chat</span>
                    </Button>
                  </Link>

                  <Link href="/favorites" className="hidden md:inline-flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1.5 h-9 px-2.5 rounded-lg text-xs font-semibold transition-colors ${
                        pathname === '/favorites'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
                      <span>Saved</span>
                    </Button>
                  </Link>
                </>
              )}

              {/* Post Ad Button (Desktop) */}
              <Link href="/post-ad" className="hidden sm:inline-block">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 h-9 font-semibold shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Post Ad</span>
                </Button>
              </Link>

              {/* User Account / Sign In Control */}
              {isAuthLoading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-full border border-border px-2.5 h-9 hover:bg-muted/60"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {user.name.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold max-w-[90px] truncate hidden sm:inline-block">
                        {user.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="font-semibold text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      <div className="mt-1.5 flex gap-1.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {user.role}
                        </Badge>
                        {user.isPhoneVerified && (
                          <Badge variant="success" className="text-[10px]">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-ads" className="cursor-pointer gap-2">
                        <Bookmark className="h-3.5 w-3.5" />
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="cursor-pointer gap-2">
                        <Heart className="h-3.5 w-3.5 text-rose-500" />
                        Saved Ads
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/chat" className="cursor-pointer gap-2">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer gap-2 text-primary font-medium">
                          <Shield className="h-3.5 w-3.5" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer gap-2"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold h-9">
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Hamburger Toggle */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search Input Sub-bar (Under header on small viewports) */}
          <div className="pb-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ads in ${selectedCity.name}...`}
                className="pl-9 pr-16 h-9 w-full bg-muted/40 text-xs rounded-lg"
              />
              <Button
                type="submit"
                size="sm"
                variant="primary"
                className="absolute right-1 h-7 px-2.5 text-xs font-medium rounded-md"
              >
                Go
              </Button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-border text-xs text-muted-foreground">
              <span>Location:</span>
              <button
                type="button"
                onClick={() => {
                  setIsCityModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" />
                {selectedCity.name}, PK {isGpsActive ? '(GPS)' : ''}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/post-ad"
                onClick={() => setIsMobileMenuOpen(false)}
                className="col-span-2"
              >
                <Button variant="default" className="w-full gap-2 font-semibold">
                  <PlusCircle className="h-4 w-4" />
                  Post an Ad for Free
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/my-ads"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <Bookmark className="h-3.5 w-3.5" />
                      My Listings
                    </Button>
                  </Link>
                  <Link
                    href="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <MessageSquare className="h-3.5 w-3.5" />
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
                  <Button variant="outline" className="w-full gap-2 text-xs">
                    <UserIcon className="h-3.5 w-3.5" />
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
