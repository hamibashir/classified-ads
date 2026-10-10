/**
 * Real-Time In-App Chat Type Definitions
 */

export interface ChatUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface ChatAdSummary {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'REJECTED' | 'EXPIRED';
  images?: { url: string; order?: number }[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachmentUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  sender?: ChatUser;
}

export interface ChatConversation {
  id: string;
  adId: string;
  ad: ChatAdSummary;
  buyerId?: string;
  sellerId?: string;
  buyer?: ChatUser;
  seller?: ChatUser;
  otherUser: ChatUser;
  lastMessage?: {
    id: string;
    text: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationListApiResponse {
  conversations: {
    id: string;
    adId: string;
    ad: ChatAdSummary;
    buyerId?: string;
    sellerId?: string;
    buyer?: ChatUser;
    seller?: ChatUser;
    otherUser: ChatUser;
    lastMessage: {
      id: string;
      text: string;
      createdAt: string;
      senderId: string;
      isRead: boolean;
    } | null;
    unreadCount: number;
    updatedAt: string;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessageHistoryApiResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
