'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostAdDraft } from '@/types/ad';

const STORAGE_KEY = 'classifieds_post_ad_draft';
const STEP_KEY = 'classifieds_post_ad_step';

const defaultDraft: PostAdDraft = {
  categoryId: '',
  subcategoryId: '',
  categoryName: '',
  subcategoryName: '',
  title: '',
  description: '',
  price: '',
  currency: 'PKR',
  isNegotiable: false,
  condition: 'USED_GOOD',
  images: [],
  locationCity: 'Lahore',
  locationState: 'Punjab',
  locationAddress: '',
  latitude: null,
  longitude: null,
  showPhone: true,
  allowWhatsapp: true,
};

export function usePostAdDraft() {
  const [draft, setDraft] = useState<PostAdDraft>(defaultDraft);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const storedDraft = localStorage.getItem(STORAGE_KEY);
      if (storedDraft) {
        const parsed = JSON.parse(storedDraft);
        setDraft((prev) => ({ ...prev, ...parsed }));
      }

      const storedStep = localStorage.getItem(STEP_KEY);
      if (storedStep) {
        const parsedStep = parseInt(storedStep, 10);
        if (parsedStep >= 1 && parsedStep <= 5) {
          setCurrentStep(parsedStep);
        }
      }
    } catch {
      // Storage unavailable or invalid JSON; fallback to defaults
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync draft to localStorage when updated
  const updateDraft = useCallback((updates: Partial<PostAdDraft>) => {
    setDraft((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage full or quota exceeded
      }
      return updated;
    });
  }, []);

  // Update step and sync to localStorage
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
      try {
        localStorage.setItem(STEP_KEY, String(step));
      } catch {
        // Ignore
      }
    }
  }, []);

  // Reset/discard draft
  const resetDraft = useCallback(() => {
    setDraft(defaultDraft);
    setCurrentStep(1);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    draft,
    currentStep,
    isHydrated,
    updateDraft,
    goToStep,
    resetDraft,
  };
}
