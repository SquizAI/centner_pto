'use client';

/**
 * GalleryExample Component
 *
 * This is a comprehensive example showing how to use all the photo gallery
 * components together. Use this as a reference for building your gallery pages.
 *
 * USAGE:
 *
 * For the main gallery listing page (/gallery):
 * ```tsx
 * import { AlbumGrid, AlbumFilter, useGalleryFilter } from '@/components/gallery';
 *
 * const albums = await fetchAlbumsWithStats();
 *
 * // Then use the client component pattern shown below
 * ```
 *
 * For individual album pages (/gallery/[slug]):
 * ```tsx
 * import { PhotoGallery, PhotoLightbox, useLightbox } from '@/components/gallery';
 *
 * const photos = await fetchPhotosForAlbum(albumId);
 *
 * // Then use the client component pattern shown below
 * ```
 */

import * as React from 'react';
import {
  AlbumGrid,
  AlbumFilter,
  PhotoGallery,
  PhotoLightbox,
  useLightbox,
  PhotoUploadZone,
} from '@/components/gallery';
import { useGalleryFilter } from '@/components/gallery/useGalleryFilter';
import { AlbumWithStats, PhotoWithUrl, LightboxPhoto } from '@/types/gallery.types';

// ============================================================================
// EXAMPLE 1: Album Listing Page with Filtering
// ============================================================================

interface AlbumListingExampleProps {
  albums: AlbumWithStats[];
}

export function AlbumListingExample({ albums }: AlbumListingExampleProps) {
  const { selectedCampus, setSelectedCampus, filteredAlbums } = useGalleryFilter({
    albums,
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Photo Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse photos from our events and activities across all campuses
        </p>
      </div>

      {/* Filters */}
      <AlbumFilter
        selectedCampus={selectedCampus}
        onCampusChange={setSelectedCampus}
      />

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAlbums.length} of {albums.length} albums
      </div>

      {/* Album Grid */}
      <AlbumGrid albums={filteredAlbums} />
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Individual Album Page with Lightbox
// ============================================================================

interface AlbumDetailExampleProps {
  album: AlbumWithStats;
  photos: PhotoWithUrl[];
}

export function AlbumDetailExample({ album, photos }: AlbumDetailExampleProps) {
  // Convert photos to lightbox format
  const lightboxPhotos: LightboxPhoto[] = React.useMemo(
    () =>
      photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        title: photo.title,
        caption: photo.caption,
        alt_text: photo.alt_text,
        width: photo.width,
        height: photo.height,
      })),
    [photos]
  );

  // Lightbox state management
  const { isOpen, currentIndex, open, close, next, previous } =
    useLightbox(lightboxPhotos);

  // Handle photo click
  const handlePhotoClick = React.useCallback(
    (_photo: PhotoWithUrl, index: number) => {
      open(index);
    },
    [open]
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Album Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{album.title}</h1>
        {album.description && (
          <p className="text-lg text-muted-foreground">{album.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {album.event_date && (
            <span>
              <strong>Date:</strong>{' '}
              {new Date(album.event_date).toLocaleDateString()}
            </span>
          )}
          {album.location && (
            <span>
              <strong>Location:</strong> {album.location}
            </span>
          )}
          <span>
            <strong>Photos:</strong> {album.photo_count}
          </span>
        </div>
      </div>

      {/* Photo Gallery */}
      <PhotoGallery photos={photos} onPhotoClick={handlePhotoClick} />

      {/* Lightbox */}
      <PhotoLightbox
        photos={lightboxPhotos}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={close}
        onNext={next}
        onPrevious={previous}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Admin Photo Upload Interface
// ============================================================================

export function PhotoUploadExample() {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);

  const handleFilesSelected = React.useCallback((files: File[]) => {
    setSelectedFiles(files);
  }, []);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      // TODO: Implement actual upload logic
      // Example:
      // for (const file of selectedFiles) {
      //   const formData = new FormData();
      //   formData.append('file', file);
      //   await uploadPhoto(albumId, formData);
      // }

      console.log('Uploading files:', selectedFiles);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear files after successful upload
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload Photos</h1>
          <p className="text-muted-foreground">
            Add photos to your album. All photos will be reviewed before publishing.
          </p>
        </div>

        {/* Upload Zone */}
        <PhotoUploadZone
          onFilesSelected={handleFilesSelected}
          maxFiles={50}
          disabled={uploading}
        />

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {uploading
                ? `Uploading ${selectedFiles.length} photos...`
                : `Upload ${selectedFiles.length} photos`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Combined View with Tabs
// ============================================================================

export function CombinedGalleryExample({
  albums,
  photos,
}: {
  albums: AlbumWithStats[];
  photos: PhotoWithUrl[];
}) {
  const [view, setView] = React.useState<'albums' | 'photos'>('albums');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* View Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setView('albums')}
          className={`px-4 py-2 font-semibold transition-colors ${
            view === 'albums'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Albums
        </button>
        <button
          onClick={() => setView('photos')}
          className={`px-4 py-2 font-semibold transition-colors ${
            view === 'photos'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Photos
        </button>
      </div>

      {/* Content */}
      {view === 'albums' ? (
        <AlbumListingExample albums={albums} />
      ) : (
        <PhotoGallery photos={photos} />
      )}
    </div>
  );
}
