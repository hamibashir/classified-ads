'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PostAdDraft } from '@/types/ad';
import { getConditionLabel } from '@/lib/validations/ad';
import { formatPKR, formatCompactPKR } from '@/lib/formatters';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  FolderTree,
  FileText,
  Camera,
  MapPin,
  Phone,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
  Star,
  Tag,
  Share2,
} from 'lucide-react';

interface PostAdStepReviewProps {
  draft: PostAdDraft;
  onEditStep: (step: number) => void;
  onResetDraft: () => void;
  onBack: () => void;
}

interface CreatedAdResponse {
  id: string;
  slug: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  title: string;
  price: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function PostAdStepReview({
  draft,
  onEditStep,
  onResetDraft,
  onBack,
}: PostAdStepReviewProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedAd, setSubmittedAd] = useState<CreatedAdResponse | null>(null);

  // Resolves a guaranteed valid database category UUID
  const resolveCategoryUuid = async (): Promise<string> => {
    // If subcategoryId is already a valid UUID, return it
    if (draft.subcategoryId && UUID_REGEX.test(draft.subcategoryId)) {
      return draft.subcategoryId;
    }
    // If categoryId is already a valid UUID, return it
    if (draft.categoryId && UUID_REGEX.test(draft.categoryId)) {
      return draft.categoryId;
    }

    // Otherwise, fetch live categories and match by name or subcategory name
    try {
      const res = await apiClient.get<
        { id: string; name: string; slug: string; children?: { id: string; name: string; slug: string }[] }[]
      >('/categories');

      const cats = res.data || [];
      if (cats.length > 0) {
        // Try to match subcategory
        for (const parent of cats) {
          if (parent.children) {
            const foundSub = parent.children.find(
              (sub) =>
                sub.name.toLowerCase() === (draft.subcategoryName || '').toLowerCase() ||
                sub.slug.toLowerCase() === (draft.subcategoryName || '').toLowerCase()
            );
            if (foundSub) return foundSub.id;
          }
        }

        // Try to match parent category
        const foundParent = cats.find(
          (parent) =>
            parent.name.toLowerCase() === (draft.categoryName || '').toLowerCase() ||
            parent.slug.toLowerCase() === (draft.categoryName || '').toLowerCase()
        );
        if (foundParent) {
          if (foundParent.children && foundParent.children.length > 0) {
            return foundParent.children[0].id;
          }
          return foundParent.id;
        }

        // Default fallback to first category in database
        if (cats[0].children && cats[0].children.length > 0) {
          return cats[0].children[0].id;
        }
        return cats[0].id;
      }
    } catch {
      // Ignore fetch error and fall through
    }

    return draft.subcategoryId || draft.categoryId;
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const targetCategoryId = await resolveCategoryUuid();

      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        categoryId: targetCategoryId,
        price: Number(draft.price) || 0,
        currency: 'PKR',
        isNegotiable: Boolean(draft.isNegotiable),
        condition: draft.condition === 'USED' ? 'USED_GOOD' : draft.condition,
        locationCity: draft.locationCity || 'Lahore',
        locationState: draft.locationState || 'Punjab',
        locationAddress: draft.locationAddress?.trim() || null,
        latitude: draft.latitude ?? null,
        longitude: draft.longitude ?? null,
        showPhone: draft.showPhone !== false,
        allowWhatsapp: draft.allowWhatsapp !== false,
        images: (draft.images || []).map((img, idx) => ({
          url: img.url,
          publicId: img.publicId || null,
          order: typeof img.order === 'number' ? img.order : idx,
        })),
      };

      const response = await apiClient.post<CreatedAdResponse>('/ads', payload);

      if (!response.data) {
        throw new Error(response.message || 'Failed to publish listing.');
      }

      // Clear draft upon successful publish
      onResetDraft();
      setSubmittedAd(response.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to publish ad. Please check your connection and try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STATE: Ad is ACTIVE (Live Immediately)
  if (submittedAd && submittedAd.status === 'ACTIVE') {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 text-center shadow-xs space-y-6 animate-in fade-in-50 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Published &amp; Live Now
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Congratulations! Your Ad is Live.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your listing <span className="font-semibold text-foreground">&ldquo;{submittedAd.title}&rdquo;</span> is now active across Pakistan. Buyers can view your photos, call you, or message on WhatsApp.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
          <Link href={`/ads/${submittedAd.slug}`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-6 font-semibold gap-2 shadow-xs">
              <Eye className="h-4 w-4" />
              <span>View Live Ad</span>
            </Button>
          </Link>

          <Link href="/my-ads" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-11 px-6 font-semibold gap-2 border-border">
              <span>Go to My Listings</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // SUCCESS STATE: Ad is PENDING (Moderation Active)
  if (submittedAd && submittedAd.status === 'PENDING') {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 text-center shadow-xs space-y-6 animate-in fade-in-50 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
          <Clock className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Pending Administrative Review
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Ad Submitted Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your listing <span className="font-semibold text-foreground">&ldquo;{submittedAd.title}&rdquo;</span> has been received and is currently under review by our moderation team. It will appear publicly as soon as approved.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
          <Link href="/my-ads" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-6 font-semibold gap-2 shadow-xs">
              <span>View in My Ads</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto h-11 px-6 font-semibold border-border"
          >
            <span>Return to Home</span>
          </Button>
        </div>
      </div>
    );
  }

  // REVIEW STATE: Step 5 Final Summary
  const numPrice = Number(draft.price) || 0;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Step 5: Final Review</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Review your listing before publishing
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Confirm your details, photos, price, and location. You can jump back to edit any section with 1 click.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* 1. Category Review Card */}
      <div className="bg-card p-5 rounded-2xl border border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FolderTree className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Category
            </span>
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              {draft.categoryName || 'Main Category'} &gt;{' '}
              <span className="text-primary">{draft.subcategoryName || 'Subcategory'}</span>
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEditStep(1)}
          className="text-xs text-primary hover:text-primary font-semibold h-8"
        >
          Edit
        </Button>
      </div>

      {/* 2. Ad Details Review Card */}
      <div className="bg-card p-5 rounded-2xl border border-border/80 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Basic Information
              </span>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {draft.title || 'Untitled Listing'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {formatCompactPKR(numPrice)} ({formatPKR(numPrice)})
                </span>
                <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>{draft.isNegotiable ? 'Negotiable' : 'Fixed Price'}</span>
                </span>
                <span className="text-[11px] font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                  Condition: {getConditionLabel(draft.condition)}
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(2)}
            className="text-xs text-primary hover:text-primary font-semibold h-8"
          >
            Edit
          </Button>
        </div>

        <div className="pt-2 border-t border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
            Description Preview:
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {draft.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* 3. Photos Review Card */}
      <div className="bg-card p-5 rounded-2xl border border-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Listing Photos
              </span>
              <span className="text-xs font-semibold text-foreground">
                {draft.images.length} photo(s) attached
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(3)}
            className="text-xs text-primary hover:text-primary font-semibold h-8"
          >
            Edit
          </Button>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1">
          {draft.images.map((img, idx) => (
            <div
              key={`${img.url}-${idx}`}
              className="relative w-18 h-14 sm:w-22 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-border"
            >
              <Image
                src={img.url}
                alt={`Photo ${idx + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
              {idx === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[8px] font-bold px-1 rounded flex items-center gap-0.5">
                  <Star className="h-2 w-2 fill-primary-foreground" />
                  <span>Cover</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Location & Contact Review Card */}
      <div className="bg-card p-5 rounded-2xl border border-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Location &amp; Contact
              </span>
              <span className="text-xs font-semibold text-foreground">
                {draft.locationCity}
                {draft.locationAddress ? `, ${draft.locationAddress}` : ''} ({draft.locationState})
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(4)}
            className="text-xs text-primary hover:text-primary font-semibold h-8"
          >
            Edit
          </Button>
        </div>

        {/* Location & Contact Meta Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60 text-xs">
          {draft.latitude && draft.longitude && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>GPS Coordinates Attached</span>
            </span>
          )}
          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span>Phone: {draft.showPhone ? 'Visible on Ad' : 'Hidden'}</span>
          </span>
          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>WhatsApp: {draft.allowWhatsapp ? 'Active' : 'Disabled'}</span>
          </span>
        </div>
      </div>

      {/* Reassurance Banner */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-border/80 flex items-start gap-3 text-xs text-muted-foreground">
        <Share2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          By clicking &ldquo;Publish My Ad&rdquo;, you agree that your listing complies with Pakistani Classified Ads community guidelines. Counterfeit products, prohibited items, or misleading information will be flagged.
        </p>
      </div>

      {/* Navigation & Submit CTA */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-11 px-5 font-semibold gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Location</span>
        </Button>

        <Button
          type="button"
          onClick={handlePublish}
          disabled={isSubmitting}
          className="h-12 px-8 font-bold text-sm gap-2 shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Publishing your ad...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Publish My Ad</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
