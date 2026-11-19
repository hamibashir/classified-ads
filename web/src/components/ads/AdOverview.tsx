'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Clock,
  Eye,
  Tag,
  CheckCircle2,
  Share2,
  Heart,
  Sparkles,
  Layers,
  Calendar,
  ShieldCheck,
  Cpu,
  Car,
  Wrench,
  Info,
  FileText,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Fuel,
  Gauge,
  Bed,
  Bath,
  Maximize2,
  LucideIcon,
} from 'lucide-react';
import { AdListItem } from '@/types/ad';
import { formatPKR, formatRelativeTime } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShareAdModal } from './ShareAdModal';

interface AdOverviewProps {
  ad: AdListItem;
  onFavoriteToggle?: (isFavorited: boolean) => void;
}

interface SpecItem {
  label: string;
  value: string;
  icon: React.ElementType;
}

/**
 * Derives clean, high-value listing specifications without developer clutter (e.g. UUIDs).
 */
function extractListingSpecs(ad: AdListItem): SpecItem[] {
  const specs: SpecItem[] = [];

  // 1. Condition
  const conditionLabels: Record<string, string> = {
    NEW: 'Brand New (Sealed)',
    LIKE_NEW: 'Like New (10/10)',
    USED_GOOD: 'Gently Used (Good)',
    USED_FAIR: 'Fair Condition',
    USED: 'Pre-Owned / Used',
  };
  specs.push({
    label: 'Condition',
    value: conditionLabels[ad.condition] || 'Pre-Owned',
    icon: Sparkles,
  });

  // 2. Category
  if (ad.category?.name) {
    specs.push({
      label: 'Category',
      value: ad.category.name,
      icon: Layers,
    });
  }

  // 3. Location (Clean combined)
  const locationText = ad.locationAddress
    ? `${ad.locationAddress}, ${ad.locationCity}`
    : ad.locationCity || 'Pakistan';
  specs.push({
    label: 'Location',
    value: locationText,
    icon: MapPin,
  });

  // 4. Price Type
  specs.push({
    label: 'Price Type',
    value: ad.isNegotiable ? 'Negotiable' : 'Fixed Price',
    icon: Tag,
  });

  // 5. Listed Date
  if (ad.createdAt) {
    try {
      const dateStr = new Date(ad.createdAt).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      specs.push({
        label: 'Listed Date',
        value: dateStr,
        icon: Calendar,
      });
    } catch {}
  }

  // 6. Parse structured specifications if present
  let parsedSpecs: Record<string, string> = ad.customFields || {};
  const rawDesc = ad.description || '';
  const specMatch = rawDesc.match(/===SPECIFICATIONS===([\s\S]*?)====================/);
  if (specMatch && specMatch[1]) {
    try {
      const jsonSpecs = JSON.parse(specMatch[1].trim());
      parsedSpecs = { ...jsonSpecs, ...parsedSpecs };
    } catch {}
  }

  // Append structured specifications with matching Lucide icons
  Object.entries(parsedSpecs).forEach(([key, val]) => {
    if (val && typeof val === 'string' && val.trim()) {
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .trim();
      const label = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);

      let icon: LucideIcon = CheckCircle2;
      const lower = key.toLowerCase();
      if (lower.includes('make') || lower.includes('brand')) icon = Car;
      else if (lower.includes('fuel')) icon = Fuel;
      else if (lower.includes('trans')) icon = Wrench;
      else if (lower.includes('mile')) icon = Gauge;
      else if (lower.includes('year')) icon = Calendar;
      else if (lower.includes('pta')) icon = ShieldCheck;
      else if (lower.includes('ram') || lower.includes('storage')) icon = Cpu;
      else if (lower.includes('bed') || lower.includes('room')) icon = Bed;
      else if (lower.includes('bath')) icon = Bath;
      else if (lower.includes('area') || lower.includes('size')) icon = Maximize2;

      specs.push({
        label,
        value: val.trim(),
        icon,
      });
    }
  });

  // 7. Heuristic fallback for older listings without structured specifications
  if (Object.keys(parsedSpecs).length === 0) {
    const fullText = `${ad.title} ${ad.description || ''}`;
    const knownBrands = [
      'Toyota', 'Honda', 'Suzuki', 'Hyundai', 'Kia', 'Changan', 'Nissan', 'Daihatsu', 'Audi', 'BMW', 'Mercedes',
      'Apple', 'Samsung', 'Xiaomi', 'Redmi', 'Infinix', 'Tecno', 'Oppo', 'Vivo', 'Realme', 'OnePlus', 'Google Pixel',
      'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MacBook', 'Sony', 'Canon', 'Nikon',
      'Haier', 'Gree', 'Dawlance', 'Pel', 'Waves', 'Kenwood', 'Orient'
    ];
    const matchedBrand = knownBrands.find((b) =>
      new RegExp(`\\b${b}\\b`, 'i').test(fullText)
    );
    if (matchedBrand) {
      specs.push({
        label: 'Brand / Make',
        value: matchedBrand,
        icon: Car,
      });
    }

    const yearMatch = fullText.match(/\b(199\d|20[0-2]\d)\b/);
    if (yearMatch) {
      specs.push({
        label: 'Model / Year',
        value: yearMatch[1],
        icon: Calendar,
      });
    }

    if (/(pta\s*approved|official\s*pta)/i.test(fullText)) {
      specs.push({
        label: 'PTA Status',
        value: 'PTA Approved',
        icon: ShieldCheck,
      });
    } else if (/(non[- ]?pta|jv\s*sim)/i.test(fullText)) {
      specs.push({
        label: 'PTA Status',
        value: 'Non-PTA / JV',
        icon: Info,
      });
    }

    if (/automatic/i.test(fullText)) {
      specs.push({ label: 'Transmission', value: 'Automatic', icon: Wrench });
    } else if (/manual/i.test(fullText)) {
      specs.push({ label: 'Transmission', value: 'Manual', icon: Wrench });
    }
  }

  return specs;
}

/**
 * Intelligent description renderer with bullet point formatting, copy action, and expandable reading.
 */
function EnhancedDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Strip machine specifications block from buyer-facing description
  const cleanDescription = useMemo(() => {
    return description.replace(/===SPECIFICATIONS===[\s\S]*?====================/g, '').trim();
  }, [description]);

  const lines = useMemo(() => {
    return cleanDescription.split('\n');
  }, [cleanDescription]);

  const wordsCount = useMemo(() => {
    return cleanDescription.trim().split(/\s+/).filter(Boolean).length;
  }, [cleanDescription]);

  const readTimeMin = Math.max(1, Math.ceil(wordsCount / 180));
  const isLong = cleanDescription.length > 500 || lines.length > 9;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      {/* Description Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Description</h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {wordsCount} words • ~{readTimeMin} min read
            </p>
          </div>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          title="Copy description text"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Description Body with Smart List and Header Formatting */}
      <div className="relative">
        <div
          className={`text-sm text-slate-700 leading-relaxed space-y-2 transition-all duration-300 ${
            !isExpanded && isLong ? 'max-h-60 overflow-hidden' : ''
          }`}
        >
          {lines.map((line, idx) => {
            const trimmed = line.trim();

            if (!trimmed) {
              return <div key={idx} className="h-1.5" />;
            }

            // Detect list items (bullet points)
            const isBullet = /^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
            if (isBullet) {
              const cleanContent = trimmed.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '');
              return (
                <div key={idx} className="flex items-start gap-2.5 pl-1 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-2" />
                  <span className="text-slate-700">{cleanContent}</span>
                </div>
              );
            }

            // Detect section headers (e.g. "Features & Specs:", "Location:")
            const isHeader = /^[A-Za-z0-9 &/\-_]+:$/.test(trimmed) && trimmed.length < 40;
            if (isHeader) {
              return (
                <h3 key={idx} className="font-bold text-slate-900 pt-2 text-sm tracking-tight">
                  {trimmed}
                </h3>
              );
            }

            return (
              <p key={idx} className="text-slate-700">
                {line}
              </p>
            );
          })}
        </div>

        {/* Gradient Fade if Collapsed */}
        {!isExpanded && isLong && (
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Show More / Show Less Button */}
      {isLong && (
        <div className="pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50/60 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-teal-200"
          >
            <span>{isExpanded ? 'Show Less' : 'Read Full Description'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      )}

      {/* Buyer Safety Recommendation Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600 mt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-800">Buyer Inspection Tip</span>
          <p className="text-[11px] text-slate-500 leading-normal">
            Always inspect the item in person in daylight before handing over payment. Never transfer advance deposits or down-payments.
          </p>
        </div>
      </div>
    </div>
  );
}

export const AdOverview: React.FC<AdOverviewProps> = ({ ad, onFavoriteToggle }) => {
  const [favorited, setFavorited] = useState(ad.isFavorited || false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleFavorite = () => {
    const next = !favorited;
    setFavorited(next);
    if (onFavoriteToggle) onFavoriteToggle(next);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const specs = useMemo(() => extractListingSpecs(ad), [ad]);

  return (
    <div className="w-full space-y-6">
      {/* Price & Action Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Price Tag */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                {formatPKR(ad.price)}
              </span>
              {ad.isNegotiable && (
                <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-800 bg-emerald-50">
                  Negotiable
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">All prices in Pakistani Rupee (PKR)</p>
          </div>

          {/* Favorite & Share Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFavorite}
              className={`h-9 px-3 gap-1.5 text-xs font-semibold ${
                favorited ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{favorited ? 'Saved' : 'Save Ad'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-9 px-3 gap-1.5 text-xs font-semibold text-slate-600"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Ad Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {ad.title}
        </h1>

        {/* Badges Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge
            variant={ad.condition === 'NEW' ? 'success' : 'secondary'}
            className="text-xs font-semibold uppercase px-2.5 py-0.5"
          >
            {ad.condition === 'NEW' ? 'Brand New' : 'Used / Pre-Owned'}
          </Badge>
          {ad.category && (
            <Badge variant="outline" className="text-xs text-teal-800 border-teal-200 bg-teal-50 gap-1">
              <Tag className="w-3 h-3 text-teal-600" />
              {ad.category.name}
            </Badge>
          )}
          {ad.isFeatured && (
            <Badge variant="default" className="text-xs bg-amber-600 text-white font-semibold">
              Featured Listing
            </Badge>
          )}
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {ad.locationAddress ? `${ad.locationAddress}, ` : ''}
              {ad.locationCity}
            </span>
          </span>

          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Posted {formatRelativeTime(ad.createdAt)}</span>
          </span>

          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{(ad.viewsCount || 0).toLocaleString()} Views</span>
          </span>
        </div>
      </div>

      {/* Enhanced Key Specifications Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Listing Specifications</h2>
              <p className="text-[11px] text-slate-400 font-medium">Verified listing overview and features</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {specs.length} specs
          </span>
        </div>

        {/* Vertical Minimal Modern Specifications List */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 divide-y divide-slate-100 overflow-hidden">
          {specs.map((spec, idx) => {
            const IconComponent = spec.icon;
            return (
              <div
                key={idx}
                className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 truncate">
                    {spec.label}
                  </span>
                </div>
                <span
                  className="text-xs sm:text-sm font-bold text-slate-900 text-right truncate max-w-[55%]"
                  title={spec.value}
                >
                  {spec.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Description Section Card */}
      <EnhancedDescription
        description={
          ad.description ||
          `Detailed listing description for ${ad.title}. Please contact the seller directly for inquiries, physical inspection, or purchase negotiations.`
        }
      />

      {/* Share Ad Modal */}
      <ShareAdModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        adTitle={ad.title}
        adPrice={ad.price}
      />
    </div>
  );
};
