'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Loader2,
  ShieldAlert,
  UserCheck,
  UserX,
  Mail,
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminUserListItem } from '@/types/admin';

interface BanUserDialogProps {
  user: AdminUserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBanToggle: (reason?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const BanUserDialog: React.FC<BanUserDialogProps> = ({
  user,
  isOpen,
  onClose,
  onConfirmBanToggle,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason('');
  }, [user, isOpen]);

  if (!user) return null;

  const isBanning = !user.isBanned;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmBanToggle(reason.trim() || undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isBanning ? (
              <div className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="w-5 h-5" />
                <DialogTitle className="text-lg font-bold">
                  Suspend User Account?
                </DialogTitle>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600">
                <UserCheck className="w-5 h-5" />
                <DialogTitle className="text-lg font-bold">
                  Lift User Suspension?
                </DialogTitle>
              </div>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isBanning
              ? `Suspending will block "${user.name}" from logging in and instantly hide all their active marketplace listings.`
              : `Lifting suspension will restore account access for "${user.name}" and make their active listings discoverable again.`}
          </DialogDescription>
        </DialogHeader>

        {/* User Context Box */}
        <div className="p-3 bg-muted/40 border border-border/80 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground text-sm">{user.name}</span>
            <Badge
              variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
              className="text-[10px] uppercase font-mono"
            >
              {user.role}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>{user._count.ads} ad(s)</span>
            </div>
          </div>
        </div>

        {/* Banning Consequences Warning */}
        {isBanning && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Enforced Guardrails:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] opacity-90">
              <li>Login rejected with 403 Forbidden (<code className="font-mono">USER_BANNED</code>)</li>
              <li>Cannot post new ads or send in-app chat messages</li>
              <li>All {user._count.ads} active listings hidden from public search & feeds</li>
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {/* Reason Input (only relevant when banning) */}
          {isBanning && (
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-foreground">
                Suspension Reason (Optional / Audit Note)
              </label>
              <Input
                placeholder="e.g., Repeated fraud reports, prohibited items, abusive chat"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-xs"
              />
            </div>
          )}

          <DialogFooter className="pt-2">
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
              variant={isBanning ? 'destructive' : 'default'}
              size="sm"
              disabled={isSubmitting}
              className={`text-xs gap-1.5 ${
                !isBanning ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isBanning ? (
                <>
                  <UserX className="w-3.5 h-3.5" />
                  <span>Suspend Account</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Lift Suspension</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
