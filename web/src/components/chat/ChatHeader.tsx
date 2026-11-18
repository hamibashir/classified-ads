import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatAdSummary, ChatUser } from '@/types/chat';
import { formatPKR } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  ChevronLeft,
  MessageCircle,
} from 'lucide-react';

interface ChatHeaderProps {
  ad: ChatAdSummary;
  otherUser?: ChatUser;
  isOnline?: boolean;
  isTyping?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({
  ad,
  otherUser = { id: 'seller', name: 'Seller' },
  isOnline = true,
  isTyping = false,
  onBack,
  showBackButton = false,
}: ChatHeaderProps) {
  const adCover =
    ad.images && ad.images.length > 0
      ? ad.images[0].url
      : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=200';

  const sellerName = otherUser?.name || 'Seller';

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur-xs px-4 py-3 shrink-0 flex items-center justify-between gap-3">
      {/* Left: User Info & Back Button */}
      <div className="flex items-center gap-3 min-w-0">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 md:hidden"
            title="Back to conversation list"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-border">
            {otherUser?.avatarUrl ? (
              <Image
                src={otherUser.avatarUrl}
                alt={sellerName}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              sellerName.slice(0, 1).toUpperCase()
            )}
          </div>
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${
              isOnline ? 'bg-emerald-500' : 'bg-muted-foreground'
            }`}
          />
        </div>

        <div className="min-w-0">
          <h2 className="font-bold text-sm sm:text-base text-foreground truncate flex items-center gap-1.5">
            <span>{sellerName}</span>
          </h2>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            {isTyping ? (
              <span className="text-primary font-medium flex items-center gap-1 animate-pulse">
                <span>typing...</span>
              </span>
            ) : isOnline ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
            ) : (
              <span>Offline</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Ad Preview Strip */}
      <div className="flex items-center gap-3 bg-muted/40 border border-border/80 rounded-xl px-2.5 py-1.5 max-w-[240px] sm:max-w-xs shrink-0">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-muted">
          <Image
            src={adCover}
            alt={ad.title}
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 hidden sm:block">
          <p className="text-xs font-semibold text-foreground truncate">{ad.title}</p>
          <p className="text-xs font-black text-price font-mono">{formatPKR(ad.price)}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `Regarding "${ad.title}" (${formatPKR(ad.price)}) on Zaaz B`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-7 w-7 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 flex items-center justify-center transition-colors"
            title="Continue conversation on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
          </a>

          <Link href={`/ads/${ad.slug}`} target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
              title="Open listing in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
