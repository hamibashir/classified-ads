'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Tag,
  Loader2,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PendingAdDetail } from '@/types/admin';
import { formatPKR } from '@/lib/formatters';

interface RejectAdModalProps {
  ad: PendingAdDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (reason: string) => Promise<void>;
  isSubmitting?: boolean;
}

const REJECTION_PRESETS = [
  'Prohibited or Illegal Items (Weapons, Narcotics, Restricted)',
  'Counterfeit or Replica Goods',
  'Misleading Pricing or Fake Listing Details',
  'Inappropriate or Offensive Photos',
  'Non-PTA Compliant or Invalid IMEI Mobile Device',
  'Suspicious Seller Activity or Duplicate Ad',
];

export const RejectAdModal: React.FC<RejectAdModalProps> = ({
  ad,
  isOpen,
  onClose,
  onConfirmReject,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setSelectedPreset(null);
    }
  }, [isOpen]);

  const handleSelectPreset = (preset: string) => {
    setSelectedPreset(preset);
    setReason(preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onConfirmReject(reason.trim());
  };

  if (!ad) return null;

  const coverImage = ad.images?.find((img) => img.order === 0) || ad.images?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold">
              Reject Listing Submission
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Provide a policy violation reason. The seller will be notified and the ad will be marked as REJECTED.
          </DialogDescription>
        </DialogHeader>

        {/* Listing Summary Preview */}
        <div className="p-3 bg-muted/40 border border-border/80 rounded-xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
            {coverImage?.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={coverImage.url}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Tag className="w-5 h-5 text-muted-foreground/30" />
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="text-xs font-bold text-foreground truncate">{ad.title}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-600">{formatPKR(ad.price)}</span>
              <span>•</span>
              <span className="truncate">{ad.category.name}</span>
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              Seller: {ad.user.name} ({ad.user.email})
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Quick Violation Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Standard Policy Violation Presets</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REJECTION_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-colors ${
                    selectedPreset === preset
                      ? 'bg-destructive/10 border-destructive text-destructive font-semibold'
                      : 'bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="rejection-reason" className="text-xs font-semibold text-foreground">
                Rejection Reason Explanation <span className="text-destructive">*</span>
              </label>
              <span className="text-[10px] font-mono text-muted-foreground">
                {reason.length}/1000
              </span>
            </div>
            <textarea
              id="rejection-reason"
              rows={3}
              maxLength={1000}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setSelectedPreset(null);
              }}
              placeholder="Explain why this listing was rejected (e.g., please provide clear photos without watermarks)..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              required
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!reason.trim() || isSubmitting}
              className="text-xs gap-1.5 shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              <span>Confirm Rejection</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
