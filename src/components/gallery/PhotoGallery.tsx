'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Photo } from '@/types/gallery.types';

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo, index: number) => void;
  className?: string;
  loading?: boolean;
}

export function PhotoGallery({
  photos,
  onPhotoClick,
  className,
  loading = false,
}: PhotoGalleryProps) {
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set());

  const handleImageLoad = React.useCallback((photoId: string) => {
    setLoadedImages((prev) => new Set(prev).add(photoId));
  }, []);

  if (loading) {
    return (
      <div
        className={cn(
          'columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4',
          className
        )}
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <PhotoSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'flex flex-col items-center justify-center py-16 px-4',
          className
        )}
      >
        <div className="text-center max-w-md">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            No Photos Yet
          </h3>
          <p className="text-muted-foreground">
            This album doesn&apos;t have any photos yet. Check back soon!
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4',
        className
      )}
    >
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="break-inside-avoid"
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-lg bg-muted',
              'cursor-pointer group transition-all duration-300',
              'hover:shadow-lg hover:scale-[1.02]',
              onPhotoClick && 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
            onClick={() => onPhotoClick?.(photo, index)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onPhotoClick) {
                e.preventDefault();
                onPhotoClick(photo, index);
              }
            }}
            role={onPhotoClick ? 'button' : undefined}
            tabIndex={onPhotoClick ? 0 : undefined}
            aria-label={
              onPhotoClick
                ? `View ${photo.title || photo.alt_text || 'photo'} in fullscreen`
                : undefined
            }
          >
            {/* Aspect ratio container */}
            <div
              className="relative w-full"
              style={{
                aspectRatio:
                  photo.width && photo.height
                    ? `${photo.width} / ${photo.height}`
                    : '4 / 3',
              }}
            >
              <Image
                src={photo.thumbnail_url || photo.url}
                alt={photo.alt_text || photo.title || 'Photo'}
                fill
                className={cn(
                  'object-cover transition-all duration-300',
                  'group-hover:scale-105',
                  !loadedImages.has(photo.id) && 'blur-sm'
                )}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onLoad={() => handleImageLoad(photo.id)}
              />

              {/* Overlay on hover */}
              {(photo.title || photo.caption) && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    {photo.title && (
                      <p className="font-semibold text-sm line-clamp-1 mb-1">
                        {photo.title}
                      </p>
                    )}
                    {photo.caption && (
                      <p className="text-xs line-clamp-2 opacity-90">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {!loadedImages.has(photo.id) && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Skeleton component for loading state
function PhotoSkeleton() {
  // Random aspect ratio for more natural skeleton
  const aspectRatios = ['aspect-square', 'aspect-[4/3]', 'aspect-[3/4]', 'aspect-video'];
  const randomAspect = aspectRatios[Math.floor(Math.random() * aspectRatios.length)];

  return (
    <div className="break-inside-avoid">
      <div className={cn('w-full bg-muted animate-pulse rounded-lg', randomAspect)} />
    </div>
  );
}
