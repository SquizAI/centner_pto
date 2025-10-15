'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LightboxPhoto } from '@/types/gallery.types';

interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PhotoLightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: PhotoLightboxProps) {
  const currentPhoto = photos[currentIndex];
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  // Handle touch swipe
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrevious();
    }
  };

  // Prevent body scroll when lightbox is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset image loaded state when photo changes
  React.useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  if (!currentPhoto) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={onClose}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 focus:ring-white"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous Button */}
          {photos.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 z-50',
                'text-white hover:bg-white/20 focus:ring-white',
                'h-12 w-12'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Next Button */}
          {photos.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 z-50',
                'text-white hover:bg-white/20 focus:ring-white',
                'h-12 w-12'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="Next photo"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Image Container */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Loading Spinner */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Image */}
              <div
                className="relative"
                style={{
                  aspectRatio:
                    currentPhoto.width && currentPhoto.height
                      ? `${currentPhoto.width} / ${currentPhoto.height}`
                      : '16 / 9',
                  maxHeight: '80vh',
                  maxWidth: '90vw',
                }}
              >
                <Image
                  src={currentPhoto.url || '/placeholder-image.jpg'}
                  alt={currentPhoto.alt_text || currentPhoto.title || 'Photo'}
                  fill
                  className={cn(
                    'object-contain transition-opacity duration-300',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  sizes="90vw"
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>

            {/* Caption/Metadata */}
            {(currentPhoto.title || currentPhoto.caption) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-center text-white px-4"
              >
                {currentPhoto.title && (
                  <h3 className="text-lg font-semibold mb-1">
                    {currentPhoto.title}
                  </h3>
                )}
                {currentPhoto.caption && (
                  <p className="text-sm text-white/80">{currentPhoto.caption}</p>
                )}
              </motion.div>
            )}

            {/* Photo Counter */}
            {photos.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm"
              >
                {currentIndex + 1} / {photos.length}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing lightbox state
export function useLightbox(photos: LightboxPhoto[]) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const open = React.useCallback((index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const next = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const previous = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  return {
    isOpen,
    currentIndex,
    open,
    close,
    next,
    previous,
  };
}
