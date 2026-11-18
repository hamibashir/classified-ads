'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useChatSocket } from '@/hooks/useChatSocket';
import {
  ChatConversation,
  ChatMessage,
} from '@/types/chat';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { ChatEmptyState } from '@/components/chat/ChatEmptyState';
import { Loader2, ShieldAlert } from 'lucide-react';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get('conversationId');
  const adParam = searchParams.get('adId');

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Mobile navigation state
  const [isMobileThreadOpen, setIsMobileThreadOpen] = useState<boolean>(false);

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const hasResolvedAdRef = useRef<string | null>(null);
  const selectedConversationRef = useRef<ChatConversation | null>(selectedConversation);
  selectedConversationRef.current = selectedConversation;

  // 1. Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?returnUrl=/chat');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // 2. Socket.IO integration
  const handleIncomingMessage = useCallback(
    (newMsg: ChatMessage) => {
      const activeConv = selectedConversationRef.current;
      // Append to active message thread if conversation matches
      setMessages((prev) => {
        if (activeConv && newMsg.conversationId === activeConv.id) {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        }
        return prev;
      });

      // Update last message in conversations list
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === newMsg.conversationId) {
            return {
              ...c,
              lastMessage: {
                id: newMsg.id,
                text: newMsg.text,
                createdAt: newMsg.createdAt,
                senderId: newMsg.senderId,
                isRead: newMsg.isRead,
              },
              unreadCount:
                activeConv?.id === newMsg.conversationId ||
                newMsg.senderId === user?.id
                  ? c.unreadCount
                  : c.unreadCount + 1,
              updatedAt: newMsg.createdAt,
            };
          }
          return c;
        })
      );
    },
    [user?.id]
  );

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
    sendTyping,
    sendStopTyping,
  } = useChatSocket({
    onNewMessage: handleIncomingMessage,
    onUserTyping: ({ conversationId, userId }) => {
      if (selectedConversation?.id === conversationId && userId !== user?.id) {
        setIsTyping(true);
      }
    },
    onUserStopTyping: ({ conversationId, userId }) => {
      if (selectedConversation?.id === conversationId && userId !== user?.id) {
        setIsTyping(false);
      }
    },
  });

  // 3. Fetch Conversations list
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingConversations(true);

    try {
      const res = await apiClient.get<{ conversations?: ChatConversation[] } | ChatConversation[]>(
        '/chat/conversations',
        { params: { limit: 50 } }
      );

      const raw = res.data;
      const list: ChatConversation[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.conversations)
        ? raw.conversations
        : [];

      setConversations(list);

      // Auto-select if URL has conversationId parameter
      if (conversationParam) {
        let matched = list.find((c) => c.id === conversationParam);
        if (!matched) {
          try {
            const singleRes = await apiClient.get<{ conversation?: ChatConversation } | ChatConversation>(`/chat/conversations/${conversationParam}`);
            const singleData = ('conversation' in (singleRes.data || {}) ? (singleRes.data as { conversation?: ChatConversation })?.conversation : singleRes.data) as ChatConversation | undefined;
            if (singleData?.id) {
              matched = singleData;
              setConversations((prev) => [singleData, ...prev.filter((c) => c.id !== singleData.id)]);
            }
          } catch {
            // Silently ignore if not found
          }
        }

        if (matched) {
          setSelectedConversation(matched);
          setIsMobileThreadOpen(true);
        }
      }
    } catch {
      // Non-critical background failure
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isAuthenticated, conversationParam]);

  // Handle adId parameter: initiate or open conversation
  useEffect(() => {
    async function resolveAdConversation() {
      if (!adParam || !isAuthenticated) return;
      if (hasResolvedAdRef.current === adParam) return;
      hasResolvedAdRef.current = adParam;

      // First check if an active conversation for this ad is already in list
      const existingInList = conversations.find(
        (c) => c.adId === adParam || c.ad?.id === adParam
      );
      if (existingInList) {
        setSelectedConversation(existingInList);
        setIsMobileThreadOpen(true);
        return;
      }

      try {
        const res = await apiClient.post<{ conversation?: ChatConversation } | ChatConversation>(
          '/chat/conversations',
          { adId: adParam }
        );

        const conv = ('conversation' in (res.data || {}) ? (res.data as { conversation?: ChatConversation })?.conversation : res.data) as ChatConversation | undefined;
        if (conv?.id) {
          const isBuyer = conv.buyerId === user?.id;
          const otherUser =
            conv.otherUser ||
            (isBuyer ? conv.seller : conv.buyer) || {
              id: searchParams.get('sellerId') || 'seller',
              name: searchParams.get('sellerName') || 'Seller',
              avatarUrl: null,
            };

          const formattedConv: ChatConversation = {
            ...conv,
            otherUser,
            ad: conv.ad || {
              id: adParam,
              title: searchParams.get('adTitle') || 'Classified Ad',
              slug: searchParams.get('adSlug') || adParam,
              price: Number(searchParams.get('adPrice') || '0'),
              currency: 'PKR',
              status: 'ACTIVE',
              images: [],
            },
            unreadCount: conv.unreadCount ?? 0,
            updatedAt: conv.updatedAt || new Date().toISOString(),
          };

          setSelectedConversation(formattedConv);
          setIsMobileThreadOpen(true);
          setConversations((prev) => [
            formattedConv,
            ...prev.filter((c) => c.id !== formattedConv.id),
          ]);
          router.replace(`/chat?conversationId=${conv.id}&adId=${encodeURIComponent(adParam)}`);
          return;
        }
      } catch {
        // Fallback for mock or preview ads
      }

      // Fallback virtual conversation for mock / offline listings
      const adTitle = searchParams.get('adTitle') || 'Classified Ad';
      const adPrice = Number(searchParams.get('adPrice') || '0');
      const adSlug = searchParams.get('adSlug') || adParam;
      const sellerId = searchParams.get('sellerId') || 'seller-1';
      const sellerName = searchParams.get('sellerName') || 'Seller';

      const mockConv: ChatConversation = {
        id: `virtual-${adParam}`,
        adId: adParam,
        ad: {
          id: adParam,
          title: adTitle,
          slug: adSlug,
          price: adPrice,
          currency: 'PKR',
          status: 'ACTIVE',
          images: [],
        },
        buyerId: user?.id || 'me',
        sellerId: sellerId,
        otherUser: {
          id: sellerId,
          name: sellerName,
          avatarUrl: null,
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };

      setSelectedConversation(mockConv);
      setIsMobileThreadOpen(true);
      setConversations((prev) => [mockConv, ...prev.filter((c) => c.id !== mockConv.id)]);
    }

    resolveAdConversation();
  }, [adParam, isAuthenticated, user?.id, searchParams, router, conversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 4. Fetch Messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    // Skip network request for virtual mock threads
    if (selectedConversation.id.startsWith('virtual-')) {
      setMessages([]);
      setIsLoadingMessages(false);
      return;
    }

    let isMounted = true;
    setIsLoadingMessages(true);
    joinConversation(selectedConversation.id);

    async function loadMessages() {
      try {
        const res = await apiClient.get<{ messages?: ChatMessage[] } | ChatMessage[]>(
          `/chat/conversations/${selectedConversation?.id}/messages`,
          { params: { limit: 100 } }
        );

        const raw = res.data;
        const msgList: ChatMessage[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.messages)
          ? raw.messages
          : [];

        if (isMounted) {
          setMessages(msgList);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    }

    loadMessages();

    return () => {
      isMounted = false;
      if (selectedConversation) {
        leaveConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation, joinConversation, leaveConversation]);

  // Deduplicated messages list to prevent any duplicate rendering
  const displayMessages = useMemo<ChatMessage[]>(() => {
    const seen = new Set<string>();
    return messages.filter((msg: ChatMessage) => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  }, [messages]);

  // Scroll ONLY the message feed container - NEVER the document/window
  const scrollToBottom = useCallback((smooth = false) => {
    if (!messageContainerRef.current) return;
    const container = messageContainerRef.current;
    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // When switching conversation or upon initial messages load: snap chat box to bottom
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom(false);
      });
    }
  }, [selectedConversation?.id, scrollToBottom]);

  // When a new message is appended or user is typing: smoothly scroll chat box to bottom
  const prevMessagesCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessagesCountRef.current || isTyping) {
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages.length, isTyping, scrollToBottom]);

  // 5. Send Message handler
  const handleSendMessage = async (text: string): Promise<boolean> => {
    if (!selectedConversation) return false;

    // Try Socket.IO first
    const socketResult = await socketSendMessage(selectedConversation.id, text);
    if (socketResult) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === socketResult.id)) return prev;
        return [...prev, socketResult];
      });
      return true;
    }

    // Fallback: Optimistic local echo if offline
    const optimisticMessage: ChatMessage = {
      id: `opt-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: user?.id || 'current-user',
      text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => {
      if (prev.some((m) => m.id === optimisticMessage.id)) return prev;
      return [...prev, optimisticMessage];
    });
    return true;
  };

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    setIsMobileThreadOpen(true);
  };

  // Auth loading state
  if (isAuthLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="container max-w-7xl mx-auto py-2 sm:py-4 px-2 sm:px-4 h-[calc(100vh-80px)] min-h-[550px] max-h-[850px]">
      <div className="bg-card border border-border rounded-2xl overflow-hidden h-full flex shadow-sm">
        {/* Left Pane: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
            isMobileThreadOpen ? 'hidden md:block' : 'block'
          }`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?.id || null}
            onSelect={handleSelectConversation}
            isLoading={isLoadingConversations}
          />
        </div>

        {/* Right Pane: Chat Thread */}
        <div
          className={`flex-1 h-full flex flex-col bg-background ${
            !isMobileThreadOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Sticky Chat Header */}
              <ChatHeader
                ad={selectedConversation.ad}
                otherUser={selectedConversation.otherUser}
                isOnline={isConnected}
                isTyping={isTyping}
                showBackButton={true}
                onBack={() => setIsMobileThreadOpen(false)}
              />

              {/* Anti-Fraud Security Advisory Banner */}
              <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-800/50 px-4 py-2 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">
                    <strong>Safety Reminder:</strong> Never send advance deposits via Easypaisa or JazzCash. Inspect items in person before payment.
                  </span>
                </div>
              </div>

              {/* Message Feed */}
              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin overscroll-contain"
              >
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : displayMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                    <p className="text-xs font-semibold">Start the conversation</p>
                    <p className="text-[11px] max-w-xs">
                      Say Assalam-o-Alaikum, ask if &ldquo;{selectedConversation.ad.title}&rdquo; is available, or make an offer.
                    </p>
                  </div>
                ) : (
                  displayMessages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isCurrentUser={msg.senderId === user?.id}
                    />
                  ))
                )}

                {/* Live Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground p-2 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-medium ml-1">
                      {selectedConversation.otherUser?.name || 'User'} is typing...
                    </span>
                  </div>
                )}
              </div>

              {/* Message Compose Bar */}
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={() => sendTyping(selectedConversation.id)}
                onStopTyping={() => sendStopTyping(selectedConversation.id)}
              />
            </>
          ) : (
            <ChatEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-6xl mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Loading chat...</p>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
