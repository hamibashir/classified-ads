'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useChatSocket } from '@/hooks/useChatSocket';
import {
  ChatConversation,
  ChatMessage,
  ConversationListApiResponse,
  MessageHistoryApiResponse,
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?returnUrl=/chat');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // 2. Socket.IO integration
  const handleIncomingMessage = useCallback(
    (newMsg: ChatMessage) => {
      // Append to active message thread if conversation matches
      setMessages((prev) => {
        if (selectedConversation && newMsg.conversationId === selectedConversation.id) {
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
                selectedConversation?.id === newMsg.conversationId ||
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
    [selectedConversation, user?.id]
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
      const res = await apiClient.get<ConversationListApiResponse>(
        '/chat/conversations',
        { params: { limit: 50 } }
      );

      if (res.data?.conversations) {
        setConversations(res.data.conversations);

        // Auto-select if URL has conversationId parameter
        if (conversationParam) {
          const matched = res.data.conversations.find((c) => c.id === conversationParam);
          if (matched) {
            setSelectedConversation(matched);
            setIsMobileThreadOpen(true);
          }
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

      try {
        const res = await apiClient.post<ChatConversation>(
          '/chat/conversations',
          { adId: adParam }
        );

        if (res.data?.id) {
          fetchConversations();
          router.replace(`/chat?conversationId=${res.data.id}`);
        }
      } catch {
        // Fall through
      }
    }

    resolveAdConversation();
  }, [adParam, isAuthenticated, fetchConversations, router]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 4. Fetch Messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setIsLoadingMessages(true);
    joinConversation(selectedConversation.id);

    async function loadMessages() {
      try {
        const res = await apiClient.get<MessageHistoryApiResponse>(
          `/chat/conversations/${selectedConversation?.id}/messages`,
          { params: { limit: 100 } }
        );

        if (isMounted && res.data?.messages) {
          setMessages(res.data.messages);
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

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 5. Send Message handler
  const handleSendMessage = async (text: string): Promise<boolean> => {
    if (!selectedConversation) return false;

    // Try Socket.IO first
    const socketResult = await socketSendMessage(selectedConversation.id, text);
    if (socketResult) {
      setMessages((prev) => [...prev, socketResult]);
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
    setMessages((prev) => [...prev, optimisticMessage]);
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
    <div className="container max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 h-[calc(100vh-80px)] min-h-[550px] max-h-[850px]">
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {isLoadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                    <p className="text-xs font-semibold">Start the conversation</p>
                    <p className="text-[11px] max-w-xs">
                      Say Assalam-o-Alaikum, ask if &ldquo;{selectedConversation.ad.title}&rdquo; is available, or make an offer.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
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
                      {selectedConversation.otherUser.name} is typing...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
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
