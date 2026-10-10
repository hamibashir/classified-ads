'use client';

import React from 'react';
import { Check, FolderTree, FileText, Camera, MapPin, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostAdStepProgressProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  onDiscardDraft?: () => void;
  hasDraftData?: boolean;
}

const STEPS = [
  { step: 1, title: 'Category', icon: FolderTree },
  { step: 2, title: 'Details', icon: FileText },
  { step: 3, title: 'Photos', icon: Camera },
  { step: 4, title: 'Location', icon: MapPin },
  { step: 5, title: 'Review', icon: CheckCircle2 },
];

export function PostAdStepProgress({
  currentStep,
  onStepClick,
  onDiscardDraft,
  hasDraftData = false,
}: PostAdStepProgressProps) {
  return (
    <div className="w-full bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Step {currentStep} of 5
          </span>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            {STEPS[currentStep - 1]?.title || 'Post an Ad'}
          </h2>
        </div>

        {hasDraftData && onDiscardDraft && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDiscardDraft}
            className="text-xs text-muted-foreground hover:text-destructive gap-1.5 h-8 px-2.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Draft</span>
          </Button>
        )}
      </div>

      {/* Stepper Bar */}
      <div className="relative">
        {/* Track Line behind steps */}
        <div className="absolute top-4 sm:top-5 left-4 right-4 h-0.5 bg-muted -z-0" />
        <div
          className="absolute top-4 sm:top-5 left-4 h-0.5 bg-primary transition-all duration-300 -z-0"
          style={{
            width: `${((Math.min(currentStep, 5) - 1) / (STEPS.length - 1)) * 100}%`,
          }}
        />

        <div className="flex justify-between items-start relative z-10">
          {STEPS.map((item) => {
            const isCompleted = item.step < currentStep;
            const isCurrent = item.step === currentStep;
            const isClickable = onStepClick && item.step < currentStep;
            const Icon = item.icon;

            return (
              <button
                key={item.step}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(item.step)}
                className={`flex flex-col items-center group focus:outline-none ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 border-2 ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground shadow-xs'
                      : isCurrent
                      ? 'bg-background border-primary text-primary ring-4 ring-primary/10 shadow-xs'
                      : 'bg-muted/80 border-border text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-[10px] sm:text-xs font-semibold mt-1.5 transition-colors ${
                    isCurrent
                      ? 'text-primary font-bold'
                      : isCompleted
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
