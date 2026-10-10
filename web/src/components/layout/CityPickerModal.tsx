'use client';

import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Crosshair } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { PAKISTANI_CITIES } from '@/constants/cities';

interface CityPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CityPickerModal: React.FC<CityPickerModalProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    selectedCity,
    selectCity,
    requestCurrentLocation,
    isGpsActive,
    isLoading,
    coordinates,
    error,
  } = useGeolocation();

  const [activeCityId, setActiveCityId] = useState<string>(selectedCity.id);

  // Sync activeCityId when modal opens or selectedCity changes
  React.useEffect(() => {
    setActiveCityId(selectedCity.id);
  }, [selectedCity.id, open]);

  const handleCitySelect = (cityId: string) => {
    setActiveCityId(cityId);
  };

  const handleConfirm = () => {
    selectCity(activeCityId);
    onOpenChange(false);
  };

  const handleGpsDetect = async () => {
    const coords = await requestCurrentLocation();
    if (coords) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Select Your City & Location
          </DialogTitle>
          <DialogDescription>
            Discover verified classified ads near you across Pakistan, or use your device GPS for instant local recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* GPS Detection Action */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2 border-primary/30 text-primary hover:bg-primary/5 font-semibold text-xs py-5"
            onClick={handleGpsDetect}
            disabled={isLoading}
          >
            <Crosshair className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading
              ? 'Acquiring GPS Signal...'
              : isGpsActive
              ? 'GPS Active • Refresh Device Location'
              : 'Use My Current GPS Location'}
          </Button>

          {error && (
            <div className="p-2.5 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-md">
              {error}
            </div>
          )}

          {isGpsActive && coordinates && (
            <div className="p-2 text-xs bg-muted/60 rounded-md flex justify-between items-center text-muted-foreground font-mono">
              <span>Device Coordinates:</span>
              <span>
                {coordinates.latitude.toFixed(4)}° N, {coordinates.longitude.toFixed(4)}° E
              </span>
            </div>
          )}

          {/* All Cities Select Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Choose from All Pakistani Cities
            </label>
            <Select value={activeCityId} onValueChange={handleCitySelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {PAKISTANI_CITIES.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}, {city.province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Popular Pakistani Cities Quick Badges */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              Popular Cities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PAKISTANI_CITIES.filter((c) => c.isPopular).map((city) => (
                <Badge
                  key={city.id}
                  variant={activeCityId === city.id ? 'default' : 'secondary'}
                  className="cursor-pointer text-xs"
                  onClick={() => handleCitySelect(city.id)}
                >
                  {city.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
          >
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
