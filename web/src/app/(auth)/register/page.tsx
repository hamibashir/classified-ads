'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  registerSchema,
  RegisterInput,
  getSafeRedirectUrl,
  normalizePakistaniPhone,
} from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  UserPlus,
} from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectUrl = getSafeRedirectUrl(rawRedirect);

  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [formData, setFormData] = useState<RegisterInput>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, isAuthLoading, redirectUrl, router]);

  const handleChange = (field: keyof RegisterInput, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error when user types
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // 1. Zod Validation
    const validationResult = registerSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
      for (const issue of validationResult.error.issues) {
        const path = issue.path[0] as keyof RegisterInput;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setFormErrors(fieldErrors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const cleanedPhone = normalizePakistaniPhone(validationResult.data.phone);

      await register({
        name: validationResult.data.name,
        email: validationResult.data.email,
        password: validationResult.data.password,
        phone: cleanedPhone,
      });

      // Navigate to destination
      router.push(redirectUrl);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setServerError('An account with this email address already exists. Please sign in instead.');
        } else {
          setServerError(err.message || 'Unable to complete registration. Please try again.');
        }
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred during account creation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setServerError(null);
    try {
      setServerError('Google One-Tap is being initialized. For quick access, please complete the form below.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Join thousands of buyers & verified sellers across Pakistan.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{serverError}</div>
        </div>
      )}

      {/* Google Sign Up CTA */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignUp}
        disabled={isSubmitting || isGoogleLoading}
        className="w-full h-11 text-xs font-semibold gap-2.5 border-border hover:bg-muted/50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign up with Google</span>
      </Button>

      {/* Or Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-card px-3 text-muted-foreground font-medium tracking-wider">
            Or register with details
          </span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-foreground"
          >
            Full Name <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Muhammad Ali"
              disabled={isSubmitting}
              className={`pl-9 h-10 text-xs sm:text-sm ${
                formErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
            />
          </div>
          {formErrors.name && (
            <p className="text-[11px] font-medium text-destructive mt-1">
              {formErrors.name}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-foreground"
          >
            Email Address <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              disabled={isSubmitting}
              className={`pl-9 h-10 text-xs sm:text-sm ${
                formErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
            />
          </div>
          {formErrors.email && (
            <p className="text-[11px] font-medium text-destructive mt-1">
              {formErrors.email}
            </p>
          )}
        </div>

        {/* Phone Number (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="phone"
              className="block text-xs font-semibold text-foreground"
            >
              Mobile Number
            </label>
            <span className="text-[11px] text-muted-foreground">Optional</span>
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="0300 1234567 or +92 300 1234567"
              disabled={isSubmitting}
              className={`pl-9 h-10 text-xs sm:text-sm ${
                formErrors.phone ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
            />
          </div>
          {formErrors.phone ? (
            <p className="text-[11px] font-medium text-destructive mt-1">
              {formErrors.phone}
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              Enables buyers to reach you on WhatsApp & voice calls.
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-foreground"
            >
              Password <span className="text-destructive">*</span>
            </label>
            <span className="text-[11px] text-muted-foreground">
              Min. 6 characters
            </span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Create a password"
              disabled={isSubmitting}
              className={`pl-9 pr-10 h-10 text-xs sm:text-sm ${
                formErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-[11px] font-medium text-destructive mt-1">
              {formErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold text-foreground"
          >
            Confirm Password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Repeat your password"
              disabled={isSubmitting}
              className={`pl-9 pr-10 h-10 text-xs sm:text-sm ${
                formErrors.confirmPassword
                  ? 'border-destructive focus-visible:ring-destructive'
                  : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className="text-[11px] font-medium text-destructive mt-1">
              {formErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => handleChange('agreeTerms', e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 shrink-0"
            />
            <span>
              I agree to the{' '}
              <span className="text-foreground font-medium underline">Terms of Service</span>{' '}
              and{' '}
              <span className="text-foreground font-medium underline">Privacy Policy</span>.
            </span>
          </label>
          {formErrors.agreeTerms && (
            <p className="text-[11px] font-medium text-destructive mt-1">
              {formErrors.agreeTerms}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-xs sm:text-sm font-semibold gap-2 mt-3 shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Create Free Account</span>
            </>
          )}
        </Button>
      </form>

      {/* Login Link Switch */}
      <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/70">
        Already have an account?{' '}
        <Link
          href={`/login${rawRedirect ? `?redirect=${encodeURIComponent(rawRedirect)}` : ''}`}
          className="font-semibold text-primary hover:underline ml-1"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading registration...
          </p>
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
