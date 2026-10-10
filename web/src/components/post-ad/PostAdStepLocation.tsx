'use client';

import React, { useState } from 'react';
import { PostAdDraft } from '@/types/ad';
import {
  postAdStep4Schema,
  PostAdStep4Input,
  getProvinceForCity,
} from '@/lib/validations/ad';
import { PAKISTANI_CITIES, findCityByIdOrName } from '@/constants/cities';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Building,
  AlertCircle,
} from 'lucide-react';

interface PostAdStepLocationProps {
  draft: PostAdDraft;
  onUpdateDraft: (updates: Partial<PostAdDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PostAdStepLocation({
  draft,
  onUpdateDraft,
  onBack,
  onNext,
}: PostAdStepLocationProps) {
  const { user } = useAuth();
  const { requestCurrentLocation, isLoading: isGeoLoading } = useGeolocation();

  const [formData, setFormData] = useState<PostAdStep4Input>({
    locationCity: draft.locationCity || 'Lahore',
    locationState: draft.locationState || getProvinceForCity(draft.locationCity || 'Lahore'),
    locationAddress: draft.locationAddress || '',
    latitude: draft.latitude ?? null,
    longitude: draft.longitude ?? null,
    sellerPhone: user?.phone || '',
    showPhone: draft.showPhone !== undefined ? draft.showPhone : true,
    allowWhatsapp: draft.allowWhatsapp !== undefined ? draft.allowWhatsapp : true,
  });

  const [isGpsActive, setIsGpsActive] = useState<boolean>(
    Boolean(draft.latitude && draft.longitude)
  );
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PostAdStep4Input, string>>>({});

  const handleCitySelect = (cityName: string) => {
    const city = findCityByIdOrName(cityName);
    const resolvedProvince = getProvinceForCity(city.name);

    setFormData((prev) => ({
      ...prev,
      locationCity: city.name,
      locationState: resolvedProvince,
      // If GPS wasn't used, update default center coordinates
      latitude: isGpsActive ? prev.latitude : city.coordinates.latitude,
      longitude: isGpsActive ? prev.longitude : city.coordinates.longitude,
    }));

    onUpdateDraft({
      locationCity: city.name,
      locationState: resolvedProvince,
      latitude: isGpsActive ? formData.latitude : city.coordinates.latitude,
      longitude: isGpsActive ? formData.longitude : city.coordinates.longitude,
    });

    if (formErrors.locationCity) {
      setFormErrors((prev) => ({ ...prev, locationCity: undefined }));
    }
  };

  const handleDetectGps = async () => {
    setGpsError(null);
    try {
      const coords = await requestCurrentLocation();
      if (coords) {
        setIsGpsActive(true);
        setFormData((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
        onUpdateDraft({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      } else {
        setGpsError('Could not retrieve GPS coordinates. Please ensure location access is allowed.');
      }
    } catch {
      setGpsError('Failed to detect GPS location. Please choose your city manually below.');
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, locationAddress: val }));
    onUpdateDraft({ locationAddress: val });
    if (formErrors.locationAddress) {
      setFormErrors((prev) => ({ ...prev, locationAddress: undefined }));
    }
  };

  const handlePhoneToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, showPhone: checked }));
    onUpdateDraft({ showPhone: checked });
  };

  const handleWhatsappToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, allowWhatsapp: checked }));
    onUpdateDraft({ allowWhatsapp: checked });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = postAdStep4Schema.safeParse(formData);
    if (!validation.success) {
      const errors: Partial<Record<keyof PostAdStep4Input, string>> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path[0] as keyof PostAdStep4Input;
        if (path && !errors[path]) {
          errors[path] = issue.message;
        }
      }
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    onUpdateDraft({
      locationCity: formData.locationCity,
      locationState: formData.locationState,
      locationAddress: formData.locationAddress,
      latitude: formData.latitude,
      longitude: formData.longitude,
      showPhone: formData.showPhone,
      allowWhatsapp: formData.allowWhatsapp,
    });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Header */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <MapPin className="h-4 w-4" />
          <span>Step 4: Location &amp; Contact</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Where is your item located?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Help buyers in your city find your ad quickly. Set contact preferences for calls and WhatsApp messages.
        </p>
      </div>

      {/* 1. GPS Auto-Detection Card */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-primary" />
              Accurate GPS Location
            </span>
            <p className="text-[11px] text-muted-foreground">
              Calculates precise distance badges (e.g. &ldquo;2.5 km away&rdquo;) for nearby buyers.
            </p>
          </div>

          <Button
            type="button"
            variant={isGpsActive ? 'secondary' : 'outline'}
            onClick={handleDetectGps}
            disabled={isGeoLoading}
            className="text-xs font-semibold h-10 gap-2 shrink-0 border-border"
          >
            {isGeoLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Detecting GPS...</span>
              </>
            ) : isGpsActive ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">GPS Coordinates Locked</span>
              </>
            ) : (
              <>
                <Navigation className="h-3.5 w-3.5 text-primary" />
                <span>Use Current GPS</span>
              </>
            )}
          </Button>
        </div>

        {/* GPS Active Badge */}
        {isGpsActive && formData.latitude && formData.longitude && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>
                Coordinates: {formData.latitude.toFixed(4)}° N, {formData.longitude.toFixed(4)}° E
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              High Accuracy
            </span>
          </div>
        )}

        {gpsError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* 2. City & Neighborhood Selection */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/80 space-y-4">
        {/* City Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="city-select" className="block text-xs font-bold uppercase tracking-wider text-foreground">
              City <span className="text-destructive">*</span>
            </label>
            <span className="text-xs font-semibold text-primary">
              Province: {formData.locationState}
            </span>
          </div>

          {/* Quick Popular City Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {PAKISTANI_CITIES.filter((c) => c.isPopular).map((city) => {
              const isSelected = formData.locationCity.toLowerCase() === city.name.toLowerCase();

              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city.name)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'border-border/80 bg-background hover:bg-muted/50 text-foreground'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>

          {/* Full City Select Dropdown */}
          <select
            id="city-select"
            value={formData.locationCity}
            onChange={(e) => handleCitySelect(e.target.value)}
            className="w-full h-11 px-3 text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PAKISTANI_CITIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.province})
              </option>
            ))}
          </select>

          {formErrors.locationCity && (
            <p className="text-[11px] font-medium text-destructive">
              {formErrors.locationCity}
            </p>
          )}
        </div>

        {/* Neighborhood / Area Field */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <label htmlFor="neighborhood" className="block text-xs font-bold uppercase tracking-wider text-foreground">
            Neighborhood / Area / Sector
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="neighborhood"
              type="text"
              value={formData.locationAddress || ''}
              onChange={handleAddressChange}
              placeholder="e.g. Gulberg III, DHA Phase 5, F-7/2, Clifton Block 2"
              maxLength={255}
              className="pl-9 h-11 text-xs sm:text-sm"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Enter your local town, block, or commercial area. Keep private house numbers private.
          </p>
        </div>
      </div>

      {/* 3. Contact Preferences Card */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/80 space-y-4">
        <div className="space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Contact &amp; Communication Preferences
          </span>
          <p className="text-[11px] text-muted-foreground">
            Choose how buyers can connect with you regarding this listing.
          </p>
        </div>

        {/* Phone Toggle */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-background flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Phone className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground block">
                Show Phone Number
              </span>
              <p className="text-[11px] text-muted-foreground">
                Displays a protected click-to-reveal phone button to prevent spam bots.
              </p>
              {user?.phone && (
                <span className="text-[10px] font-mono text-primary font-bold">
                  Registered: {user.phone}
                </span>
              )}
            </div>
          </div>

          <Switch
            checked={formData.showPhone}
            onCheckedChange={handlePhoneToggle}
          />
        </div>

        {/* WhatsApp Toggle */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-background flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground block">
                Enable WhatsApp Chat Button
              </span>
              <p className="text-[11px] text-muted-foreground">
                Allows buyers to start a 1-click WhatsApp conversation with pre-filled ad greeting.
              </p>
            </div>
          </div>

          <Switch
            checked={formData.allowWhatsapp}
            onCheckedChange={handleWhatsappToggle}
          />
        </div>
      </div>

      {/* Privacy Guarantee Box */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-semibold text-foreground">
            Pakistani Marketplace Privacy Guarantee
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your exact house number is never displayed publicly. Buyers only see your city ({formData.locationCity}) and neighborhood. GPS coordinates are strictly used for radial distance calculation.
          </p>
        </div>
      </div>

      {/* Step Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 px-5 font-semibold gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Photos</span>
        </Button>

        <Button
          type="submit"
          className="h-11 px-6 font-semibold gap-2 shadow-xs"
        >
          <span>Continue to Review</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
