'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/lib/api-client';
import { ChatMessage } from '@/types/chat';

interface UseChatSocketOptions {
  onNewMessage?: (message: ChatMessage) => void;
  onUserTyping?: (data: { conversationId: string; userId: string }) => void;
  onUserStopTyping?: (data: { conversationId: string; userId: string }) => void;
}

export function useChatSocket(options?: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const activeConversationIdRef = useRef<string | null>(null);

  // Keep options in ref to avoid re-triggering connection effect
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') ||
      'http://localhost:5000';

    const socketInstance = io(socketUrl, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      setIsConnected(true);
      // Re-join current active conversation room if one is set
      if (activeConversationIdRef.current) {
        socketInstance.emit('join_conversation', {
          conversationId: activeConversationIdRef.current,
        });
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('new_message', (message: ChatMessage) => {
      optionsRef.current?.onNewMessage?.(message);
    });

    socketInstance.on('user_typing', (data: { conversationId: string; userId: string }) => {
      optionsRef.current?.onUserTyping?.(data);
    });

    socketInstance.on('user_stop_typing', (data: { conversationId: string; userId: string }) => {
      optionsRef.current?.onUserStopTyping?.(data);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    activeConversationIdRef.current = conversationId;
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_conversation', { conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (activeConversationIdRef.current === conversationId) {
      activeConversationIdRef.current = null;
    }
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_conversation', { conversationId });
    }
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, text: string): Promise<ChatMessage | null> => {
      return new Promise((resolve) => {
        if (!socketRef.current?.connected) {
          resolve(null);
          return;
        }

        socketRef.current.emit(
          'send_message',
          { conversationId, text },
          (response: { success: boolean; data?: ChatMessage }) => {
            if (response?.success && response.data) {
              resolve(response.data);
            } else {
              resolve(null);
            }
          }
        );
      });
    },
    []
  );

  const sendTyping = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { conversationId });
    }
  }, []);

  const sendStopTyping = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stop_typing', { conversationId });
    }
  }, []);

  return {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    sendStopTyping,
  };
}
