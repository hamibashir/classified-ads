'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePostAdDraft } from '@/hooks/usePostAdDraft';
import { PostAdStepProgress } from '@/components/post-ad/PostAdStepProgress';
import { PostAdStepCategory } from '@/components/post-ad/PostAdStepCategory';
import { PostAdStepDetails } from '@/components/post-ad/PostAdStepDetails';
import { PostAdStepImages } from '@/components/post-ad/PostAdStepImages';
import { PostAdStepLocation } from '@/components/post-ad/PostAdStepLocation';
import { PostAdStepReview } from '@/components/post-ad/PostAdStepReview';
import { PostAdLivePreview } from '@/components/post-ad/PostAdLivePreview';
import { Button } from '@/components/ui/button';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  Zap,
  Lock,
  Loader2,
} from 'lucide-react';

export default function PostAdPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    draft,
    currentStep,
    isHydrated,
    updateDraft,
    goToStep,
    resetDraft,
  } = usePostAdDraft();

  // 1. Loading State
  if (isAuthLoading || !isHydrated) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-muted-foreground font-medium">
          Loading ad posting workspace...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State Guard
  if (!isAuthenticated) {
    return (
      <div className="container max-w-xl mx-auto py-12 px-4">
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sign In to Post an Ad
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Join thousands of verified sellers on Pakistan&apos;s leading local marketplace. Fast, free, and protected with phone verification.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-2 gap-3 text-left py-2">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
              <Zap className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-foreground">100% Free</h4>
                <p className="text-[11px] text-muted-foreground">No hidden listing charges</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
              <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-foreground">Verified Buyers</h4>
                <p className="text-[11px] text-muted-foreground">Direct calls & WhatsApp</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <Link href="/login?redirect=/post-ad" className="block">
              <Button className="w-full h-11 text-xs sm:text-sm font-semibold gap-2 shadow-xs">
                <LogIn className="h-4 w-4" />
                <span>Sign In to Continue</span>
              </Button>
            </Link>

            <Link href="/register?redirect=/post-ad" className="block">
              <Button
                variant="outline"
                className="w-full h-11 text-xs sm:text-sm font-semibold gap-2 border-border"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create a New Account</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Ad Posting Wizard
  const hasDraftData = Boolean(
    draft.categoryId || draft.title || (typeof draft.price === 'number' && draft.price > 0)
  );

  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-10">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Wizard Step Progress Header */}
        <PostAdStepProgress
          currentStep={currentStep}
          onStepClick={(step) => goToStep(step)}
          onDiscardDraft={resetDraft}
          hasDraftData={hasDraftData}
        />

        {/* Two-Column Responsive Layout: Wizard Form (Col-Span-7/8) + Sticky Live Preview (Col-Span-5/4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Step 1: Category & Subcategory Selection */}
            {currentStep === 1 && (
              <PostAdStepCategory
                selectedCategoryId={draft.categoryId}
                selectedSubcategoryId={draft.subcategoryId}
                onSelectCategory={(categoryId, subcategoryId, categoryName, subcategoryName) => {
                  updateDraft({
                    categoryId,
                    subcategoryId,
                    categoryName,
                    subcategoryName,
                  });
                }}
                onNext={() => goToStep(2)}
              />
            )}

            {/* Step 2: Ad Basic Details */}
            {currentStep === 2 && (
              <PostAdStepDetails
                draft={draft}
                onUpdateDraft={updateDraft}
                onBack={() => goToStep(1)}
                onNext={() => goToStep(3)}
              />
            )}

            {/* Step 3: Photos & Media Uploader */}
            {currentStep === 3 && (
              <PostAdStepImages
                draft={draft}
                onUpdateDraft={updateDraft}
                onBack={() => goToStep(2)}
                onNext={() => goToStep(4)}
              />
            )}

            {/* Step 4: Location & Contact Preferences */}
            {currentStep === 4 && (
              <PostAdStepLocation
                draft={draft}
                onUpdateDraft={updateDraft}
                onBack={() => goToStep(3)}
                onNext={() => goToStep(5)}
              />
            )}

            {/* Step 5: Final Review & Publish */}
            {currentStep === 5 && (
              <PostAdStepReview
                draft={draft}
                onEditStep={(step) => goToStep(step)}
                onResetDraft={resetDraft}
                onBack={() => goToStep(4)}
              />
            )}
          </div>

          {/* Desktop Sticky Live Preview Column */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
            <PostAdLivePreview draft={draft} currentStep={currentStep} />
          </div>
        </div>
      </div>
    </div>
  );
}
