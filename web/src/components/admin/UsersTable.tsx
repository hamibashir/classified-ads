'use client';

import React from 'react';
import {
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  FileText,
  UserCheck,
  UserX,
  Calendar,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminUserListItem } from '@/types/admin';

interface UsersTableProps {
  users: AdminUserListItem[];
  isLoading?: boolean;
  onBanClick: (user: AdminUserListItem) => void;
  onToggleVerify: (user: AdminUserListItem) => Promise<void>;
  actioningUserId?: string | null;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading = false,
  onBanClick,
  onToggleVerify,
  actioningUserId = null,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (name[0] || 'U').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[280px]">User Profile</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[130px]">Verification</TableHead>
              <TableHead className="w-[110px]">Account Status</TableHead>
              <TableHead className="w-[90px] text-center">Listings</TableHead>
              <TableHead className="w-[120px]">Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-muted rounded w-28" />
                      <div className="h-3 bg-muted rounded w-36" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><div className="h-5 bg-muted rounded w-14" /></TableCell>
                <TableCell><div className="h-5 bg-muted rounded w-20" /></TableCell>
                <TableCell><div className="h-5 bg-muted rounded w-16" /></TableCell>
                <TableCell><div className="h-5 bg-muted rounded w-12 mx-auto" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded w-20" /></TableCell>
                <TableCell><div className="h-7 bg-muted rounded w-20 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[280px]">User Profile</TableHead>
            <TableHead className="w-[100px]">Role</TableHead>
            <TableHead className="w-[130px]">Verification</TableHead>
            <TableHead className="w-[110px]">Account Status</TableHead>
            <TableHead className="w-[90px] text-center">Listings</TableHead>
            <TableHead className="w-[120px]">Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isActioning = actioningUserId === user.id;

            return (
              <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                {/* User Profile */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground text-xs sm:text-sm truncate">
                        {user.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell>
                  {user.role === 'ADMIN' ? (
                    <Badge variant="default" className="text-[10px] font-mono gap-1 bg-teal-700">
                      <Shield className="w-3 h-3" />
                      <span>ADMIN</span>
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      USER
                    </Badge>
                  )}
                </TableCell>

                {/* Verification Toggle */}
                <TableCell>
                  <button
                    type="button"
                    onClick={() => onToggleVerify(user)}
                    disabled={isActioning}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors hover:opacity-80 disabled:opacity-50"
                    title={user.isPhoneVerified ? 'Click to unverify' : 'Click to mark verified'}
                  >
                    {user.isPhoneVerified ? (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-muted-foreground" />
                        <span>Unverified</span>
                      </span>
                    )}
                  </button>
                </TableCell>

                {/* Account Status (Active vs Banned) */}
                <TableCell>
                  {user.isBanned ? (
                    <Badge
                      variant="destructive"
                      className="text-[10px] font-mono gap-1 bg-destructive/15 text-destructive border-destructive/30"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>BANNED</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono gap-1 text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>ACTIVE</span>
                    </Badge>
                  )}
                </TableCell>

                {/* Listings Count */}
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-mono text-[10px] gap-1 px-2 py-0.5">
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    <span>{user._count.ads}</span>
                  </Badge>
                </TableCell>

                {/* Joined Date */}
                <TableCell className="text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span>{formatDate(user.createdAt)}</span>
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {user.isBanned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onBanClick(user)}
                        disabled={isActioning}
                        className="h-7 px-2 text-[11px] gap-1 text-emerald-700 border-emerald-500/30 hover:bg-emerald-50"
                        title="Lift user suspension"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Unban</span>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBanClick(user)}
                        disabled={isActioning}
                        className="h-7 px-2 text-[11px] gap-1 text-destructive hover:bg-destructive/10"
                        title="Suspend user account"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Ban User</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
