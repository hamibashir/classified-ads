'use client';

import React, { useState } from 'react';
import { PostAdDraft } from '@/types/ad';
import {
  postAdStep2Schema,
  PostAdStep2Input,
  CONDITION_OPTIONS,
} from '@/lib/validations/ad';
import { formatPKR, formatCompactPKR } from '@/lib/formatters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  Info,
  FolderTree,
  Tag,
} from 'lucide-react';

interface PostAdStepDetailsProps {
  draft: PostAdDraft;
  onUpdateDraft: (updates: Partial<PostAdDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PostAdStepDetails({
  draft,
  onUpdateDraft,
  onBack,
  onNext,
}: PostAdStepDetailsProps) {
  const [formData, setFormData] = useState<PostAdStep2Input>({
    title: draft.title || '',
    description: draft.description || '',
    price: typeof draft.price === 'number' ? draft.price : 0,
    currency: draft.currency || 'PKR',
    isNegotiable: draft.isNegotiable || false,
    condition:
      draft.condition === 'USED'
        ? 'USED_GOOD'
        : draft.condition || 'USED_GOOD',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PostAdStep2Input, string>>>({});

  const handleFieldChange = <K extends keyof PostAdStep2Input>(
    field: K,
    value: PostAdStep2Input[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    onUpdateDraft({ [field]: value });

    // Clear error on edit
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      handleFieldChange('price', 0);
      return;
    }
    const parsed = parseFloat(rawVal.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) {
      handleFieldChange('price', parsed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = postAdStep2Schema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof PostAdStep2Input, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof PostAdStep2Input;
        if (path && !errors[path]) {
          errors[path] = issue.message;
        }
      }
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    onUpdateDraft(result.data);
    onNext();
  };

  const numPrice = Number(formData.price) || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Header */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <FileText className="h-4 w-4" />
          <span>Step 2: Ad Information</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Include some details
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Provide essential information such as item condition, title, price in PKR, and an accurate description.
        </p>
      </div>

      {/* Selected Category Header Banner */}
      <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-xl">
        <div className="flex items-center gap-2.5">
          <FolderTree className="h-4 w-4 text-primary" />
          <div className="text-xs">
            <span className="text-muted-foreground">Category: </span>
            <span className="font-semibold text-foreground">
              {draft.categoryName || 'Selected Category'}
            </span>
            {draft.subcategoryName && (
              <span className="text-primary font-bold"> &gt; {draft.subcategoryName}</span>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="text-xs h-7 px-2.5"
        >
          Change Category
        </Button>
      </div>

      {/* 1. Ad Title */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/80 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="ad-title" className="block text-xs font-bold uppercase tracking-wider text-foreground">
            Ad Title <span className="text-destructive">*</span>
          </label>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded ${
              formData.title.length < 10
                ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/20'
                : formData.title.length > 85
                ? 'text-rose-700 bg-rose-50'
                : 'text-emerald-700 bg-emerald-50'
            }`}
          >
            {formData.title.length}/100 {formData.title.length < 10 ? '(min 10)' : ''}
          </span>
        </div>

        <Input
          id="ad-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="e.g. Honda Civic Oriel 2021 UG Leather Seats or iPhone 13 Pro 256GB"
          maxLength={100}
          className={`h-11 text-xs sm:text-sm ${
            formErrors.title ? 'border-destructive focus-visible:ring-destructive' : ''
          }`}
        />

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Include brand, model, condition, and specs for faster discovery.</span>
          {formErrors.title && (
            <span className="font-medium text-destructive">{formErrors.title}</span>
          )}
        </div>
      </div>

      {/* 2. Condition Selection */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
            Condition <span className="text-destructive">*</span>
          </label>
          {formErrors.condition && (
            <span className="text-[11px] font-medium text-destructive">
              {formErrors.condition}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CONDITION_OPTIONS.map((opt) => {
            const isSelected = formData.condition === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFieldChange('condition', opt.value)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20'
                    : 'border-border/80 bg-background hover:bg-muted/40 hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`font-semibold text-xs sm:text-sm ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price & Negotiable */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/80 space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="ad-price" className="block text-xs font-bold uppercase tracking-wider text-foreground">
            Price (PKR) <span className="text-destructive">*</span>
          </label>
          {numPrice > 0 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              {formatCompactPKR(numPrice)} ({formatPKR(numPrice)})
            </span>
          )}
        </div>

        <div className="relative">
          <div className="absolute left-3.5 top-3 text-xs font-bold text-muted-foreground">
            Rs
          </div>
          <Input
            id="ad-price"
            type="number"
            min={0}
            step={1}
            value={formData.price === 0 ? '' : formData.price}
            onChange={handlePriceChange}
            placeholder="0"
            className={`pl-10 h-11 text-sm font-semibold ${
              formErrors.price ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
        </div>

        {formErrors.price && (
          <p className="text-[11px] font-medium text-destructive mt-1">
            {formErrors.price}
          </p>
        )}

        {/* Quick Amount Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-muted-foreground mr-1">Quick presets:</span>
          {[5000, 15000, 35000, 75000, 150000, 500000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleFieldChange('price', preset)}
              className="text-[10px] font-medium px-2 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors"
            >
              {formatCompactPKR(preset)}
            </button>
          ))}
        </div>

        {/* Negotiable Toggle Switch */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-primary" />
              Price is Negotiable
            </span>
            <p className="text-[11px] text-muted-foreground">
              Allow interested buyers to make reasonable offers.
            </p>
          </div>
          <Switch
            checked={formData.isNegotiable}
            onCheckedChange={(checked) => handleFieldChange('isNegotiable', checked)}
          />
        </div>
      </div>

      {/* 4. Description */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/80 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="ad-description" className="block text-xs font-bold uppercase tracking-wider text-foreground">
            Description <span className="text-destructive">*</span>
          </label>
          <span className="text-[11px] text-muted-foreground font-mono">
            {formData.description.length}/5000
          </span>
        </div>

        <textarea
          id="ad-description"
          rows={6}
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Describe what you are selling, its condition, included accessories, reason for selling, and any defects or warranty status..."
          maxLength={5000}
          className={`w-full p-3 text-xs sm:text-sm rounded-xl border bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            formErrors.description ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
          }`}
        />

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            At least 10 characters required. Be honest and clear to get quick responses.
          </span>
          {formErrors.description && (
            <span className="font-medium text-destructive">{formErrors.description}</span>
          )}
        </div>

        {/* Tips Box */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-xs mt-3">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Pro-tip for Pakistani sellers: </span>
            Include your PTA approval status, battery health, vehicle registration city, or genuine warranty details to get authentic buyers fast.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="h-11 px-5 font-semibold gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Category</span>
        </Button>

        <Button
          type="submit"
          className="h-11 px-6 font-semibold gap-2 shadow-xs"
        >
          <span>Continue to Photos</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
