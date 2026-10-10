'use client';

import React from 'react';
import {
  AlertTriangle,
  Loader2,
  Trash2,
  Layers,
  FileText,
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
import { AdminCategoryItem } from '@/types/admin';

interface DeleteCategoryDialogProps {
  category: AdminCategoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting?: boolean;
  errorMessage?: string | null;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  category,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting = false,
  errorMessage = null,
}) => {
  if (!category) return null;

  const childCount = category.children?.length || 0;
  const hasAds = (category.adCount || 0) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold">
              Delete Category?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete <strong className="text-foreground">{category.name}</strong>? This action will permanently remove it from the database catalog.
          </DialogDescription>
        </DialogHeader>

        {/* Category Details Box */}
        <div className="p-3 bg-muted/40 border border-border/80 rounded-xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-foreground text-sm">
              {category.name}
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              /{category.slug}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-700" />
              <span>{childCount > 0 ? `${childCount} subcategories` : 'No subcategories'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span className={hasAds ? 'font-semibold text-destructive' : ''}>
                {category.adCount || 0} active listing(s)
              </span>
            </div>
          </div>
        </div>

        {/* Warning if Ads are attached */}
        {hasAds && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Active Ads Attached:</strong> This category contains {category.adCount} listing(s). The database will block deletion until these ads are reassigned to another category or deleted.
            </div>
          </div>
        )}

        {/* Children warning if parent category */}
        {childCount > 0 && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Cascade Deletion Notice:</strong> Deleting this root category will also delete its {childCount} subcategories.
            </div>
          </div>
        )}

        {/* API Error Feedback */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="text-xs gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
