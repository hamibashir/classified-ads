'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteAdDialogProps {
  isOpen: boolean;
  adTitle: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAdDialog({
  isOpen,
  adTitle,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAdDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-2">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto sm:mx-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Delete Listing?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-foreground">&ldquo;{adTitle}&rdquo;</span>?
            This will remove all photos, inquiries, and stats. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto h-10 border-border"
            disabled={isDeleting}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto h-10 gap-2 font-semibold shadow-xs"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Listing</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
