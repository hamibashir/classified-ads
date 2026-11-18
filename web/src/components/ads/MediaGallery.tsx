'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Maximize2,
  X,
} from 'lucide-react';
import { AdImage } from '@/types/ad';

interface MediaGalleryProps {
  images?: AdImage[];
  title: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ images = [], title }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const validImages = images && images.length > 0 ? images : [];
  const currentImage = validImages[activeIndex];

  const handleNext = useCallback(() => {
    if (validImages.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const handlePrev = useCallback(() => {
    if (validImages.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  const handleImageError = (index: number) => {
    setImgErrors((prev) => ({ ...prev, [index]: true }));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev]);

  return (
    <>
      <div className="w-full space-y-3">
        {/* Main Viewport */}
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[500px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-sm flex items-center justify-center group select-none">
          {validImages.length > 0 && currentImage && !imgErrors[activeIndex] ? (
            <div
              className="w-full h-full relative flex items-center justify-center cursor-zoom-in overflow-hidden"
              onClick={() => setIsLightboxOpen(true)}
            >
              {/* Ambient blurred backdrop so any aspect ratio fills cleanly without blank gaps */}
              <img
                src={currentImage.url}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
              />

              {/* Main adjusted showcase image */}
              <img
                src={currentImage.url}
                alt={`${title} - Photo ${activeIndex + 1}`}
                className="relative z-[1] max-w-full max-h-full w-full h-full object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
                onError={() => handleImageError(activeIndex)}
              />

              {/* Click to Enlarge Overlay Pill */}
              <div className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-md">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Click to expand</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                <ImageIcon className="w-8 h-8" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                No photo available for this listing
              </p>
            </div>
          )}

          {/* Counter Pill */}
          {validImages.length > 0 && (
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 z-10 pointer-events-none">
              <ImageIcon className="w-3 h-3 text-teal-400" />
              <span>
                {activeIndex + 1} / {validImages.length}
              </span>
            </div>
          )}

          {/* Previous / Next Arrow Controls */}
          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-transform hover:scale-105 z-10 cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-transform hover:scale-105 z-10 cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Strip */}
        {validImages.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {validImages.map((img, idx) => {
              const isSelected = activeIndex === idx;
              const hasError = imgErrors[idx];

              return (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-20 h-16 sm:w-24 sm:h-[72px] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 ring-2 ring-teal-600/30 shadow-sm scale-[1.02]'
                      : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  {!hasError ? (
                    <img
                      src={img.url}
                      alt={`${title} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(idx)}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && validImages.length > 0 && currentImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div
            className="flex items-center justify-between text-white max-w-6xl mx-auto w-full z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-300 max-w-sm sm:max-w-md truncate">
                {title}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-teal-300 font-mono">
                {activeIndex + 1} / {validImages.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close fullscreen gallery"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Full-Size Image */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.url}
              alt={`${title} fullscreen view`}
              className="max-h-[78vh] max-w-full object-contain select-none transition-transform duration-200"
            />

            {/* Navigation Arrows */}
            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Thumbnails Strip */}
          {validImages.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 max-w-4xl mx-auto w-full no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {validImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeIndex === idx
                      ? 'border-teal-400 scale-105 opacity-100 ring-2 ring-teal-400/50'
                      : 'border-white/20 opacity-50 hover:opacity-90'
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
