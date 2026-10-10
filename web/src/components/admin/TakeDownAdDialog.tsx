'use client';

import React from 'react';
import {
  AlertTriangle,
  Loader2,
  Trash2,
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
import { Badge } from '@/components/ui/badge';
import { UserReportDetail } from '@/types/admin';

interface TakeDownAdDialogProps {
  report: UserReportDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmTakeDown: () => Promise<void>;
  isSubmitting?: boolean;
}

export const TakeDownAdDialog: React.FC<TakeDownAdDialogProps> = ({
  report,
  isOpen,
  onClose,
  onConfirmTakeDown,
  isSubmitting = false,
}) => {
  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold">
              Take Down Reported Listing?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Taking down this ad will immediately set its status to <strong className="text-destructive font-mono">REJECTED</strong>, remove it from all public search and category results, and mark this user report as <strong className="text-emerald-600 font-mono">RESOLVED</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Reported Item Context Box */}
        <div className="p-3 bg-muted/40 border border-border/80 rounded-xl space-y-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold text-foreground truncate">
              {report.ad?.title || 'Unknown Listing'}
            </div>
            <Badge variant="destructive" className="text-[10px] uppercase font-mono shrink-0">
              {report.reason}
            </Badge>
          </div>

          {report.details && (
            <div className="text-[11px] text-muted-foreground italic bg-background/60 p-2 rounded-lg border border-border/60">
              &quot;{report.details}&quot;
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
            <span>Reported by: <strong>{report.reporter.name}</strong></span>
            <span className="font-mono">{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
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
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirmTakeDown}
            disabled={isSubmitting}
            className="text-xs gap-1.5 shadow-xs"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Take Down Ad</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
