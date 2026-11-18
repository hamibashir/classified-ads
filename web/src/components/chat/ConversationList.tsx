import React, { useState, useMemo } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ChatConversation } from '@/types/chat';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (conversation: ChatConversation) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return conversations;

    return conversations.filter(
      (c) =>
        (c.ad?.title && c.ad.title.toLowerCase().includes(q)) ||
        (c.otherUser?.name && c.otherUser.name.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.text.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Search Header */}
      <div className="p-3.5 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-foreground">Messages</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats or listings..."
            className="pl-9 h-9 text-xs rounded-xl bg-muted/40 border-border"
          />
        </div>
      </div>

      {/* Conversations Feed */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-3 rounded-xl border border-border bg-card animate-pulse flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-lg bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-2/5" />
                  <div className="h-4 bg-muted rounded w-4/5" />
                  <div className="h-3 bg-muted rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-muted-foreground">
            <p className="text-xs font-medium">
              {searchQuery ? 'No matching conversations' : 'No active conversations'}
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              {searchQuery
                ? 'Try searching with a different name or title.'
                : 'When you message a seller or receive an inquiry, it will show up here.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isSelected={c.id === selectedId}
              onClick={() => onSelect(c)}
            />
          ))
        )}
      </div>
    </div>
  );
}
