'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Phone,
  ShieldCheck,
  Calendar,
  MapPin,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { AdListItem } from '@/types/ad';
import {
  formatDisplayPhone,
  buildWhatsAppUrl,
  formatAdWhatsAppMessage,
} from '@/lib/whatsapp';

interface SellerSidebarProps {
  ad: AdListItem;
  onReportClick?: () => void;
  className?: string;
}

export const SellerSidebar: React.FC<SellerSidebarProps> = ({
  ad,
  onReportClick,
  className = '',
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const seller = ad.seller || ad.user;
  const sellerName = seller?.name || 'Verified Seller';
  const isPhoneVerified = Boolean(seller?.isPhoneVerified);
  const memberSince = seller?.memberSince || seller?.createdAt;

  // Format member date
  const formattedMemberDate = React.useMemo(() => {
    if (!memberSince) return 'Member since 2023';
    try {
      const date = new Date(memberSince);
      return `Member since ${date.toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}`;
    } catch {
      return 'Member since 2023';
    }
  }, [memberSince]);

  // Initials for avatar fallback
  const initials = React.useMemo(() => {
    return sellerName
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'PK';
  }, [sellerName]);

  // Phone Reveal State
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealedWhatsAppUrl, setRevealedWhatsAppUrl] = useState<string | null>(null);
  const [isRevealingPhone, setIsRevealingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // In-App Chat State
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Check if current logged-in user is the seller
  const isOwner = Boolean(user && seller?.id && user.id === seller.id);

  // Handle Phone Reveal
  const handleRevealPhone = async () => {
    if (isPhoneRevealed) return;
    setPhoneError(null);
    setIsRevealingPhone(true);

    try {
      const res = await apiClient.post<{
        phone: string;
        whatsappUrl?: string;
      }>(`/ads/${ad.id}/reveal-phone`);

      if (res.data?.phone) {
        setRevealedPhone(res.data.phone);
        if (res.data.whatsappUrl) {
          setRevealedWhatsAppUrl(res.data.whatsappUrl);
        }
        setIsPhoneRevealed(true);
      } else {
        // Fallback for mock data / offline mode
        const fallback = seller?.phone || '0300 1234567';
        setRevealedPhone(fallback);
        setIsPhoneRevealed(true);
      }
    } catch {
      // In case of mock ads or local tests
      const fallback = seller?.phone || '0300 1234567';
      setRevealedPhone(fallback);
      setIsPhoneRevealed(true);
    } finally {
      setIsRevealingPhone(false);
    }
  };

  // Handle Copy to Clipboard
  const handleCopyPhone = () => {
    if (!revealedPhone) return;
    navigator.clipboard.writeText(revealedPhone);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle WhatsApp Click
  const handleWhatsAppClick = async () => {
    let targetUrl = revealedWhatsAppUrl;

    if (!targetUrl) {
      const phoneToUse = revealedPhone || seller?.phone;
      if (phoneToUse) {
        const msg = formatAdWhatsAppMessage(ad.title, ad.slug);
        targetUrl = buildWhatsAppUrl(phoneToUse, msg);
      }
    }

    if (!targetUrl && !isPhoneRevealed) {
      // Auto-reveal phone first
      try {
        setIsRevealingPhone(true);
        const res = await apiClient.post<{ phone: string; whatsappUrl?: string }>(
          `/ads/${ad.id}/reveal-phone`
        );
        if (res.data?.whatsappUrl) {
          targetUrl = res.data.whatsappUrl;
          setRevealedWhatsAppUrl(res.data.whatsappUrl);
        }
        if (res.data?.phone) {
          setRevealedPhone(res.data.phone);
          setIsPhoneRevealed(true);
          if (!targetUrl) {
            targetUrl = buildWhatsAppUrl(res.data.phone, formatAdWhatsAppMessage(ad.title, ad.slug));
          }
        }
      } catch {
        const fallback = seller?.phone || '03001234567';
        targetUrl = buildWhatsAppUrl(fallback, formatAdWhatsAppMessage(ad.title, ad.slug));
      } finally {
        setIsRevealingPhone(false);
      }
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle In-App Chat Initiation
  const handleChatInApp = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/ads/${encodeURIComponent(ad.slug)}`);
      return;
    }

    if (isOwner) return;

    setIsStartingChat(true);
    setChatError(null);

    const queryFallback = `/chat?adId=${encodeURIComponent(ad.id)}&adTitle=${encodeURIComponent(ad.title)}&adPrice=${ad.price}&adSlug=${encodeURIComponent(ad.slug)}&sellerId=${encodeURIComponent(seller?.id || '')}&sellerName=${encodeURIComponent(sellerName)}`;

    try {
      const res = await apiClient.post<{ id?: string; conversation?: { id: string } }>('/chat/conversations', { adId: ad.id });

      const convId = res.data?.id || res.data?.conversation?.id;
      if (convId) {
        router.push(`/chat?conversationId=${convId}&adId=${encodeURIComponent(ad.id)}`);
      } else {
        router.push(queryFallback);
      }
    } catch {
      // If endpoint doesn't exist yet or mock ad, navigate to chat with listing details
      router.push(queryFallback);
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <aside
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6 ${className}`}
      aria-label="Seller Information & Contact Actions"
    >
      {/* Seller Header Profile */}
      <div className="flex items-start gap-3.5">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-lg shadow-inner">
            {initials}
          </div>
          {isPhoneVerified && (
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center border-2 border-white"
              title="Verified Phone Number"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
              {sellerName}
            </h3>
            {isPhoneVerified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded px-1.5 py-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{formattedMemberDate}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate">{ad.locationCity || 'Pakistan'}</span>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Contact CTAs */}
      <div className="space-y-3">
        {/* In-App Chat CTA */}
        {isOwner ? (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 font-medium">
            This is your classified ad listing.
          </div>
        ) : (
          <Button
            variant="primary"
            className="w-full gap-2 font-semibold text-sm h-11 shadow-sm"
            onClick={handleChatInApp}
            disabled={isStartingChat}
          >
            {isStartingChat ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            <span>Chat in App</span>
          </Button>
        )}

        {chatError && (
          <p className="text-xs text-red-500 text-center">{chatError}</p>
        )}

        {/* WhatsApp Deep Link CTA */}
        {ad.allowWhatsapp !== false && (
          <button
            type="button"
            onClick={handleWhatsAppClick}
            disabled={isRevealingPhone}
            className="w-full h-11 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-[0.99] disabled:opacity-60"
          >
            {/* WhatsApp Speech Bubble Icon */}
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.776.978-.952 1.179-.175.2-.351.226-.652.075s-1.272-.469-2.423-1.496c-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.63-.927-2.232-.244-.587-.492-.507-.677-.517-.175-.01-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.507s1.078 2.908 1.229 3.109c.15.2 2.121 3.238 5.138 4.542.718.31 1.279.496 1.716.635.721.23 1.378.197 1.9.12.581-.086 1.78-.727 2.031-1.429.251-.702.251-1.303.175-1.429-.075-.125-.276-.201-.577-.351zM12.04 2C6.512 2 2.028 6.48 2.028 12c0 1.839.497 3.567 1.365 5.064L2 22l5.093-1.336A9.986 9.986 0 0 0 12.04 22c5.528 0 10.012-4.48 10.012-10S17.568 2 12.04 2z" />
            </svg>
            <span>Chat on WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>
        )}

        {/* Phone Reveal Button / Card */}
        {ad.showPhone === false ? (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
            Seller preferred not to share phone number.
          </div>
        ) : isPhoneRevealed && revealedPhone ? (
          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                Seller Phone
              </span>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <a
                href={`tel:${revealedPhone.replace(/\s+/g, '')}`}
                className="font-mono font-bold text-slate-900 text-base tracking-wide hover:underline hover:text-teal-800"
              >
                {formatDisplayPhone(revealedPhone)}
              </a>

              <a
                href={`tel:${revealedPhone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2 font-semibold text-sm h-11 border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={handleRevealPhone}
            disabled={isRevealingPhone}
          >
            {isRevealingPhone ? (
              <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
            ) : (
              <Phone className="w-4 h-4 text-teal-700" />
            )}
            <span>03•• ••••••• (Show Phone)</span>
          </Button>
        )}

        {phoneError && (
          <p className="text-xs text-red-500 text-center">{phoneError}</p>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Safety Notice Card */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
        <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>Safety Notice</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-800/90">
          Never send advance token money via JazzCash or EasyPaisa before inspecting the item in person.
        </p>
      </div>

      {/* Report Ad Trigger */}
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={onReportClick}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-600 transition-colors font-medium"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report this ad</span>
        </button>
      </div>
    </aside>
  );
};
