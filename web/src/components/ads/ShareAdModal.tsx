'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Copy, Share2, MessageCircle, Mail } from 'lucide-react';
import { formatPKR } from '@/lib/formatters';

interface ShareAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adTitle: string;
  adPrice: number;
  adUrl?: string;
}

export const ShareAdModal: React.FC<ShareAdModalProps> = ({
  isOpen,
  onClose,
  adTitle,
  adPrice,
  adUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const currentUrl =
    adUrl ||
    (typeof window !== 'undefined' ? window.location.href : 'https://classifiedads.pk');

  const shareText = `Check out "${adTitle}" for ${formatPKR(adPrice)} on Classified Ads PK:\n${currentUrl}`;

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out "${adTitle}" on Classified Ads PK`);
    const url = encodeURIComponent(currentUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Classified Ad: ${adTitle}`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Share Listing
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Share this ad directly with friends, family, or potential buyers across Pakistan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Quick Channels Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 transition-all active:scale-95 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5 fill-white" />
              </div>
              <span className="text-[11px] font-semibold">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookShare}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-800 transition-all active:scale-95 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold">Facebook</span>
            </button>

            <button
              type="button"
              onClick={handleTwitterShare}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 transition-all active:scale-95 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold">X (Twitter)</span>
            </button>

            <button
              type="button"
              onClick={handleEmailShare}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-800 transition-all active:scale-95 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold">Email</span>
            </button>
          </div>

          {/* Copy Link Input Bar */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Listing Link</label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={currentUrl}
                className="h-10 text-xs bg-slate-50 border-slate-200 text-slate-600 select-all"
              />
              <Button
                type="button"
                variant={copied ? 'price' : 'primary'}
                className="h-10 px-4 text-xs font-semibold shrink-0 gap-1.5 transition-all"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
