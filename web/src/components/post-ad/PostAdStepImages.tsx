'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { PostAdDraft } from '@/types/ad';
import {
  MAX_AD_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  AdImageItem,
  postAdStep3Schema,
  reorderImages,
  setCoverImage,
} from '@/lib/validations/ad';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Upload,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface PostAdStepImagesProps {
  draft: PostAdDraft;
  onUpdateDraft: (updates: Partial<PostAdDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function PostAdStepImages({
  draft,
  onUpdateDraft,
  onBack,
  onNext,
}: PostAdStepImagesProps) {
  const [images, setImages] = useState<AdImageItem[]>(draft.images || []);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncImages = (newImages: AdImageItem[]) => {
    setImages(newImages);
    onUpdateDraft({ images: newImages });
  };

  const handleUploadFiles = async (fileList: FileList | File[]) => {
    setUploadError(null);
    const files = Array.from(fileList);
    if (files.length === 0) return;

    // Check remaining slots
    const availableSlots = MAX_AD_IMAGES - images.length;
    if (availableSlots <= 0) {
      setUploadError(`Maximum ${MAX_AD_IMAGES} photos allowed per ad. Please delete existing photos to add new ones.`);
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      setUploadError(`Only ${availableSlots} more photo(s) could be added (max ${MAX_AD_IMAGES} photos total).`);
    }

    // Validate size & MIME types
    const validFiles: File[] = [];
    for (const file of filesToProcess) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setUploadError(`Unsupported format: ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setUploadError(`File too large: ${file.name}. Maximum size is 5MB per photo.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      for (const file of validFiles) {
        formData.append('images', file);
      }

      const response = await apiClient.post<{
        urls: string[];
        images: { url: string; publicId?: string }[];
      }>('/upload', formData);

      const uploadedImages = response.data?.images || [];
      const newItems: AdImageItem[] = uploadedImages.map((uploaded, idx) => ({
        url: uploaded.url,
        order: images.length + idx,
        publicId: uploaded.publicId || null,
      }));

      const updatedList = [...images, ...newItems].map((item, idx) => ({
        ...item,
        order: idx,
      }));

      syncImages(updatedList);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload photos. Please try again.';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = (index: number) => {
    const updated = images
      .filter((_, idx) => idx !== index)
      .map((item, idx) => ({ ...item, order: idx }));
    syncImages(updated);
    setUploadError(null);
  };

  const handleMoveLeft = (index: number) => {
    if (index <= 0) return;
    const updated = reorderImages(images, index, index - 1);
    syncImages(updated);
  };

  const handleMoveRight = (index: number) => {
    if (index >= images.length - 1) return;
    const updated = reorderImages(images, index, index + 1);
    syncImages(updated);
  };

  const handleSetCover = (index: number) => {
    const updated = setCoverImage(images, index);
    syncImages(updated);
  };

  const handleContinue = () => {
    const validation = postAdStep3Schema.safeParse({ images });
    if (!validation.success) {
      setUploadError(validation.error.issues[0]?.message || 'Please upload at least 1 photo.');
      return;
    }

    setUploadError(null);
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border space-y-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <Camera className="h-4 w-4" />
          <span>Step 3: Photos &amp; Media</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Upload Photos of Your Item
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Add up to {MAX_AD_IMAGES} clear photos. The first photo will be used as the main cover image across marketplace search.
        </p>
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{uploadError}</div>
        </div>
      )}

      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && images.length < MAX_AD_IMAGES && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-primary bg-primary/10 ring-4 ring-primary/10 scale-[0.99]'
            : images.length >= MAX_AD_IMAGES
            ? 'border-border bg-muted/40 cursor-not-allowed opacity-60'
            : 'border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          disabled={isUploading || images.length >= MAX_AD_IMAGES}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              {isUploading
                ? 'Uploading photos to server...'
                : images.length >= MAX_AD_IMAGES
                ? 'Maximum 8 photos reached'
                : 'Drag & drop photos here, or browse files'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Supports JPEG, PNG, WebP (up to 5MB per file) • {images.length}/{MAX_AD_IMAGES} uploaded
            </p>
          </div>

          {images.length < MAX_AD_IMAGES && !isUploading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 h-9 px-4 text-xs font-semibold gap-2 border-border"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Choose Photos</span>
            </Button>
          )}
        </div>
      </div>

      {/* Uploaded Photos Gallery */}
      {images.length > 0 && (
        <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Uploaded Photos ({images.length}/{MAX_AD_IMAGES})
              </span>
              <span className="text-[11px] text-muted-foreground">
                Drag or use arrows to reorder
              </span>
            </div>

            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Cover Photo Selected</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {images.map((img, index) => {
              const isCover = index === 0;

              return (
                <div
                  key={`${img.url}-${index}`}
                  className={`group relative rounded-xl overflow-hidden border transition-all ${
                    isCover
                      ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-border/80 bg-muted/20'
                  }`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
                    <Image
                      src={img.url}
                      alt={`Ad photo ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover transition-transform group-hover:scale-105 duration-200"
                    />

                    {/* Cover Photo Badge */}
                    {isCover && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Star className="h-3 w-3 fill-primary-foreground" />
                        <span>Cover Photo</span>
                      </div>
                    )}

                    {/* Order Index Badge */}
                    <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-xs text-foreground text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-border/50">
                      #{index + 1}
                    </div>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-background/85 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground flex items-center justify-center transition-colors shadow-sm"
                      title="Delete photo"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Bottom Control Bar */}
                  <div className="p-2 bg-card border-t border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(index)}
                        disabled={index === 0}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move photo left"
                        aria-label="Move photo left"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveRight(index)}
                        disabled={index === images.length - 1}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move photo right"
                        aria-label="Move photo right"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5"
                      >
                        <Star className="h-3 w-3" />
                        <span>Make Cover</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selling Guidelines Tip Box */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-foreground">
            Tips for high-response ads in Pakistan
          </h4>
          <ul className="text-muted-foreground space-y-0.5 leading-relaxed text-[11px] list-disc list-inside">
            <li>Take photos in daylight or good lighting from multiple sides.</li>
            <li>For cars &amp; bikes: capture front, back, interior, engine bay, and odometer.</li>
            <li>For mobiles &amp; laptops: capture screen on, serial/IMEI box, battery health, and accessories.</li>
            <li>Original, authentic photos receive 3x more WhatsApp inquiries than stock images.</li>
          </ul>
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
          <span>Back to Details</span>
        </Button>

        <Button
          type="button"
          onClick={handleContinue}
          disabled={images.length === 0 || isUploading}
          className="h-11 px-6 font-semibold gap-2 shadow-xs"
        >
          <span>Continue to Location</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
