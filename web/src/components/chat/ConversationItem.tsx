import React from 'react';
import Image from 'next/image';
import { ChatConversation } from '@/types/chat';
import { formatPKR } from '@/lib/formatters';

interface ConversationItemProps {
  conversation: ChatConversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const adCover =
    conversation.ad.images && conversation.ad.images.length > 0
      ? conversation.ad.images[0].url
      : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=200';

  const lastMessageText = conversation.lastMessage
    ? conversation.lastMessage.text
    : 'No messages yet';

  const formattedDate = new Date(conversation.updatedAt).toLocaleDateString(
    'en-PK',
    {
      month: 'short',
      day: 'numeric',
    }
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-xl transition-all duration-150 flex items-start gap-3 cursor-pointer border ${
        isSelected
          ? 'bg-primary/10 border-primary/30 shadow-2xs'
          : 'bg-card border-transparent hover:bg-muted/50'
      }`}
    >
      {/* Ad Thumbnail */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted/60 border border-border">
        <Image
          src={adCover}
          alt={conversation.ad.title}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>

      {/* Text Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="font-bold text-xs sm:text-sm text-foreground truncate">
            {conversation.otherUser?.name || 'Seller'}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
            {formattedDate}
          </span>
        </div>

        <p className="text-xs font-semibold text-primary/90 truncate mb-1">
          {conversation.ad?.title || 'Classified Ad'} • {formatPKR(conversation.ad?.price || 0)}
        </p>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground truncate flex-1">
            {lastMessageText}
          </p>

          {conversation.unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 leading-tight">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
