import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex flex-col ${
        isCurrentUser ? 'items-end' : 'items-start'
      } group`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-2xs break-words ${
          isCurrentUser
            ? 'bg-primary text-primary-foreground rounded-br-xs'
            : 'bg-card border border-border text-foreground rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>

      <div className="flex items-center gap-1.5 px-1 pt-1 text-[10px] text-muted-foreground/80 font-mono">
        <span>{formattedTime}</span>
        {isCurrentUser && (
          <span
            className="inline-flex items-center gap-0.5"
            title={message.isRead ? 'Read' : 'Delivered'}
          >
            {message.isRead ? (
              <CheckCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <Check className="w-3.5 h-3.5 text-muted-foreground/70" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
