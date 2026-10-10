'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Settings,
  Calendar,
  Image as ImageIcon,
  Save,
  Loader2,
  RefreshCw,
  Info,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToastBanner, ToastMessage } from '@/components/ui/toast-banner';
import { apiClient } from '@/lib/api-client';

interface SettingsResponse {
  settings: Array<{
    id: string;
    key: string;
    value: string;
    description?: string;
  }>;
  settingsMap: Record<string, string>;
}

export default function AdminSettingsPage() {
  const [autoApprove, setAutoApprove] = useState<boolean>(true);
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [maxImages, setMaxImages] = useState<number>(8);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTogglingAutoApprove, setIsTogglingAutoApprove] = useState<boolean>(false);
  const [isSavingParameters, setIsSavingParameters] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Fetch current settings from backend
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get<SettingsResponse>('/admin/settings');
      if (res.data?.settingsMap) {
        const map = res.data.settingsMap;
        setAutoApprove(map['auto_approve_ads']?.toLowerCase() === 'true');
        setExpiryDays(parseInt(map['ad_expiry_days'] || '30', 10));
        setMaxImages(parseInt(map['max_images_per_ad'] || '8', 10));
      }
    } catch (err) {
      console.error('Failed to load system settings:', err);
      setToast({
        id: Date.now().toString(),
        title: 'Failed to load settings',
        message: 'Could not connect to settings service. Please check server status.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Immediate save toggle for auto_approve_ads
  const handleToggleAutoApprove = async (checked: boolean) => {
    const previousState = autoApprove;
    setAutoApprove(checked); // Optimistic UI update
    setIsTogglingAutoApprove(true);

    try {
      await apiClient.put('/admin/settings', {
        auto_approve_ads: String(checked),
      });

      setToast({
        id: Date.now().toString(),
        title: checked ? 'Auto-Approval Enabled' : 'Auto-Approval Disabled',
        message: checked
          ? 'New listings will now be published immediately on the marketplace.'
          : 'New listings will now be queued for moderation review in /admin/moderation.',
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to toggle auto approval:', err);
      setAutoApprove(previousState); // Revert on failure
      setToast({
        id: Date.now().toString(),
        title: 'Failed to update setting',
        message: 'Network or database error occurred. Setting has been reverted.',
        variant: 'destructive',
      });
    } finally {
      setIsTogglingAutoApprove(false);
    }
  };

  // Save secondary parameters
  const handleSaveParameters = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingParameters(true);

    try {
      await apiClient.put('/admin/settings', {
        ad_expiry_days: String(expiryDays),
        max_images_per_ad: String(maxImages),
      });

      setToast({
        id: Date.now().toString(),
        title: 'Settings Saved Successfully',
        message: `Ad expiry updated to ${expiryDays} days, photo limit set to ${maxImages} images.`,
        variant: 'success',
      });
    } catch (err) {
      console.error('Failed to save parameters:', err);
      setToast({
        id: Date.now().toString(),
        title: 'Save Failed',
        message: 'Could not update policy parameters. Please retry.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingParameters(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-muted/40 rounded-2xl" />
        <div className="h-64 bg-muted/30 rounded-2xl" />
        <div className="h-52 bg-muted/20 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-primary" />
            <span>Platform Settings & Moderation Policies</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure automated listing approval, ad lifecycle duration, and media thresholds.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchSettings}
          className="gap-2 text-xs shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </Button>
      </div>

      {/* HERO CARD: Auto-Approve Ads (Immediate Save Toggle) */}
      <Card className="border-2 transition-colors">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  autoApprove
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                }`}
              >
                {autoApprove ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg font-bold text-foreground">
                    Automatic Ad Approval
                  </CardTitle>
                  <Badge
                    variant={autoApprove ? 'success' : 'destructive'}
                    className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5"
                  >
                    {autoApprove ? 'Instant Publish (Active)' : 'Moderation Queue Required'}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Controls whether submitted listings bypass moderation or require admin review before going live.
                </CardDescription>
              </div>
            </div>

            {/* Radix Switch with Loading Spinner */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              {isTogglingAutoApprove && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              <Switch
                id="auto-approve-toggle"
                checked={autoApprove}
                disabled={isTogglingAutoApprove}
                onCheckedChange={handleToggleAutoApprove}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed transition-colors ${
              autoApprove
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
            }`}
          >
            {autoApprove ? (
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <strong>Live Marketplace Mode:</strong> When enabled, user-submitted listings are published immediately with <code className="font-mono text-[11px] font-bold">status: ACTIVE</code>. Ads are instantly discoverable in search feeds and homepage categories.
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>Moderation Queue Active:</strong> When disabled, all new listings receive <code className="font-mono text-[11px] font-bold">status: PENDING</code> and remain hidden until an administrator explicitly reviews and approves them in <code className="font-mono text-[11px] font-bold">/admin/moderation</code>.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Lifecycle & Media Upload Parameters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Listing Lifecycle & Media Thresholds
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configure expiration duration and attachment boundaries for sellers
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveParameters} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ad Expiry Days */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Ad Expiration Period (Days)</span>
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(parseInt(e.target.value, 10) || 1)}
                    className="max-w-[140px] font-mono text-sm"
                  />
                  <span className="text-xs text-muted-foreground">days active</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[15, 30, 60, 90].map((days) => (
                    <Button
                      key={days}
                      type="button"
                      variant={expiryDays === days ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExpiryDays(days)}
                      className="h-7 text-[11px] px-2.5"
                    >
                      {days}d
                    </Button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  After this period, active listings are marked as EXPIRED unless renewed by the seller.
                </p>
              </div>

              {/* Max Images per Ad */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Maximum Photos Allowed Per Ad</span>
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={maxImages}
                    onChange={(e) => setMaxImages(parseInt(e.target.value, 10) || 1)}
                    className="max-w-[140px] font-mono text-sm"
                  />
                  <span className="text-xs text-muted-foreground">images max</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[4, 8, 12, 16].map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant={maxImages === num ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMaxImages(num)}
                      className="h-7 text-[11px] px-2.5"
                    >
                      {num} photos
                    </Button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Enforced on the ad uploader form (step 3) and validated on backend multipart ingestion.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isSavingParameters}
                className="gap-2 font-semibold text-xs shadow-xs"
              >
                {isSavingParameters ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Policy Parameters</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Safety & Compliance Guidance Box */}
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-4 sm:p-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-foreground">
              Pakistani Marketplace Content Standards
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When auto-approval is disabled, newly submitted listings will require manual authorization in the Ad Moderation Queue. Ensure all approved listings adhere to national e-commerce guidelines: verify PTA status on mobile phones, confirm vehicle registration clarity on motors, and prevent prohibited counterfeit products.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
