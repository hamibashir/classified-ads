'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'destructive' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  variant?: ToastVariant;
}

interface ToastBannerProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  durationMs?: number;
}

export const ToastBanner: React.FC<ToastBannerProps> = ({
  toast,
  onDismiss,
  durationMs = 4000,
}) => {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [toast, onDismiss, durationMs]);

  if (!toast) return null;

  const variant = toast.variant || 'success';

  const ICONS = {
    success: CheckCircle2,
    destructive: AlertCircle,
    info: Info,
  };

  const STYLES = {
    success: 'bg-emerald-950 text-emerald-100 border-emerald-800 shadow-emerald-950/20',
    destructive: 'bg-rose-950 text-rose-100 border-rose-800 shadow-rose-950/20',
    info: 'bg-blue-950 text-blue-100 border-blue-800 shadow-blue-950/20',
  };

  const ICON_COLORS = {
    success: 'text-emerald-400',
    destructive: 'text-rose-400',
    info: 'text-blue-400',
  };

  const Icon = ICONS[variant];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md',
          STYLES[variant]
        )}
      >
        <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', ICON_COLORS[variant])} />

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold leading-none">{toast.title}</div>
          {toast.message && (
            <div className="text-[11px] opacity-90 mt-1 leading-relaxed">
              {toast.message}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-white/60 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
