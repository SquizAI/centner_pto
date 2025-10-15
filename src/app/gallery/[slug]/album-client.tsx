'use client';

import * as React from 'react';
import { PhotoGallery } from '@/components/gallery/PhotoGallery';
import { PhotoLightbox, useLightbox } from '@/components/gallery/PhotoLightbox';
import { PhotoWithUrl, LightboxPhoto } from '@/types/gallery.types';

interface AlbumPageClientProps {
  photos: PhotoWithUrl[];
  albumTitle: string;
}

export function AlbumPageClient({ photos, albumTitle }: AlbumPageClientProps) {
  // Convert photos to lightbox format
  const lightboxPhotos: LightboxPhoto[] = React.useMemo(
    () =>
      photos
        .filter((photo) => photo.url) // Only include photos with URLs
        .map((photo) => ({
          id: photo.id,
          url: photo.url!,
          title: photo.title,
          caption: photo.caption,
          alt_text: photo.alt_text,
          width: photo.width,
          height: photo.height,
        })),
    [photos]
  );

  // Use lightbox hook
  const lightbox = useLightbox(lightboxPhotos);

  // Handle photo click
  const handlePhotoClick = React.useCallback(
    (photo: PhotoWithUrl, index: number) => {
      lightbox.open(index);
    },
    [lightbox]
  );

  return (
    <>
      {/* Photo Gallery */}
      <PhotoGallery photos={photos} onPhotoClick={handlePhotoClick} />

      {/* Lightbox */}
      <PhotoLightbox
        photos={lightboxPhotos}
        currentIndex={lightbox.currentIndex}
        isOpen={lightbox.isOpen}
        onClose={lightbox.close}
        onNext={lightbox.next}
        onPrevious={lightbox.previous}
      />
    </>
  );
}
