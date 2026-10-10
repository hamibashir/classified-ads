import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<boolean>;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Emit typing indicator with debounce
    if (onTyping) {
      onTyping();
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onStopTyping?.();
      }, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    setIsSending(true);
    onStopTyping?.();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    try {
      const success = await onSendMessage(trimmed);
      if (success) {
        setText('');
      }
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  const QUICK_PROMPTS = [
    'Is this still available?',
    'What is your final price?',
    'Can I inspect it today?',
    'Where can we meet?',
  ];

  const handleChipClick = (prompt: string) => {
    setText(prompt);
  };

  return (
    <div className="border-t border-border bg-card/60 backdrop-blur-xs p-3 sm:p-4 shrink-0 space-y-2">
      {/* Quick Buyer Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 max-w-4xl mx-auto">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold shrink-0 mr-1 hidden sm:inline">
          Quick Ask:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled || isSending}
            onClick={() => handleChipClick(prompt)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border/80 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex items-end gap-2 max-w-4xl mx-auto"
      >
        <div className="flex-1 min-w-0 bg-muted/40 border border-border focus-within:border-primary/50 focus-within:bg-background rounded-2xl px-3.5 py-2 transition-all">
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send)"
            disabled={disabled || isSending}
            rows={1}
            className="w-full resize-none bg-transparent outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 min-h-[24px] max-h-32"
          />
        </div>

        <Button
          type="submit"
          disabled={!text.trim() || isSending || disabled}
          className="h-10 w-10 sm:w-auto sm:px-4 rounded-xl font-semibold gap-2 shadow-xs shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
}
