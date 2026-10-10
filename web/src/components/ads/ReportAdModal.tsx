'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
  Flag,
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
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { ReportReason } from '@/types/ad';

interface ReportAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  adTitle: string;
  adSlug?: string;
  sellerId?: string;
}

const REPORT_REASONS: {
  id: ReportReason;
  label: string;
  desc: string;
}[] = [
  {
    id: 'FRAUD',
    label: 'Scam or Fraudulent Offer',
    desc: 'Fake price, demands advance token money, or deceptive listing.',
  },
  {
    id: 'SPAM',
    label: 'Spam or Commercial Ad',
    desc: 'Repetitive posting, bulk advertising, or unsolicited promotion.',
  },
  {
    id: 'INAPPROPRIATE',
    label: 'Inappropriate or Offensive',
    desc: 'Vulgar language, adult content, harassment, or abusive imagery.',
  },
  {
    id: 'DUPLICATE',
    label: 'Duplicate Listing',
    desc: 'This item is already listed in another identical active ad.',
  },
  {
    id: 'PROHIBITED_ITEM',
    label: 'Prohibited or Illegal Goods',
    desc: 'Restricted weapons, counterfeit items, drugs, or illegal merchandise.',
  },
  {
    id: 'OTHER',
    label: 'Other Policy Violation',
    desc: 'Any other concern violating Classified Ads PK community rules.',
  },
];

export const ReportAdModal: React.FC<ReportAdModalProps> = ({
  isOpen,
  onClose,
  adId,
  adTitle,
  adSlug,
  sellerId,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if viewing user is the seller
  const isOwner = Boolean(user && sellerId && user.id === sellerId);

  // Reset modal state
  const handleClose = () => {
    setSelectedReason(null);
    setDetails('');
    setIsSubmitting(false);
    setIsSuccess(false);
    setErrorMsg(null);
    onClose();
  };

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setErrorMsg('Please select a reason for reporting this ad.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await apiClient.post(`/ads/${adId}/report`, {
        reason: selectedReason,
        details: details.trim() || undefined,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Unable to submit report. Please try again.';

      setErrorMsg(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to login if unauthenticated
  const handleSignInRedirect = () => {
    const redirectUrl = adSlug ? `/ads/${encodeURIComponent(adSlug)}` : '/';
    router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          // Success Confirmation Screen
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-xl font-bold text-slate-900">
                Report Submitted
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 max-w-sm mx-auto pt-1">
                Thank you for helping keep <strong>Classified Ads PK</strong> safe.
                Our moderation team will review this ad within 24 hours.
              </DialogDescription>
            </DialogHeader>

            <div className="pt-4">
              <Button
                variant="primary"
                className="w-full sm:w-auto px-8"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        ) : !isAuthenticated ? (
          // Unauthenticated Prompt Screen
          <div className="py-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Sign In Required
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 max-w-sm mx-auto pt-1">
                Please sign in to your account to report this listing. This helps prevent spam and maintains community trust.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="sm:justify-center gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSignInRedirect}>
                Sign In to Continue
              </Button>
            </DialogFooter>
          </div>
        ) : isOwner ? (
          // Self-Report Prevention Screen
          <div className="py-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Cannot Report Own Ad
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 max-w-sm mx-auto pt-1">
                You cannot submit a violation report against your own classified ad listing. If you want to modify or remove it, please manage your ads in your dashboard.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="sm:justify-center pt-2">
              <Button variant="primary" onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Standard Report Submission Form
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <Flag className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Report Ad</span>
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Why are you reporting this ad?
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 line-clamp-1">
                Listing: &quot;{adTitle}&quot;
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Reason Selection Radio Cards */}
            <div className="space-y-2 max-h-[36vh] overflow-y-auto pr-1">
              {REPORT_REASONS.map((item) => {
                const isSelected = selectedReason === item.id;
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={item.id}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedReason(item.id);
                        setErrorMsg(null);
                      }}
                      className="mt-1 w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block font-semibold text-xs text-slate-900">
                        {item.label}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Optional Additional Details */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="report-details" className="font-semibold text-slate-700">
                  Additional Details <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {details.length} / 1000
                </span>
              </div>
              <textarea
                id="report-details"
                rows={3}
                maxLength={1000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any specific details (e.g. seller requested advance deposit on JazzCash/EasyPaisa, stolen photos, etc.)..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none resize-none"
              />
            </div>

            {/* Safety Commitment Pill */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
              <span>Reports are strictly anonymous and kept confidential.</span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!selectedReason || isSubmitting}
                className="gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Submit Report</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
