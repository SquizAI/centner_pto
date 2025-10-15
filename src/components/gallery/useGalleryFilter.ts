'use client';

import * as React from 'react';
import { AlbumWithStats, GalleryCampus } from '@/types/gallery.types';

interface UseGalleryFilterOptions {
  albums: AlbumWithStats[];
  initialCampus?: GalleryCampus | null;
}

/**
 * Hook for filtering photo albums by campus
 * Provides filtered albums and campus selection state
 */
export function useGalleryFilter({
  albums,
  initialCampus = null,
}: UseGalleryFilterOptions) {
  const [selectedCampus, setSelectedCampus] = React.useState<GalleryCampus | null>(
    initialCampus
  );

  const filteredAlbums = React.useMemo(() => {
    if (!selectedCampus) {
      return albums;
    }

    return albums.filter((album) => {
      // Show albums that match the selected campus or are marked as 'all'
      return album.campus === selectedCampus || album.campus === 'all';
    });
  }, [albums, selectedCampus]);

  return {
    selectedCampus,
    setSelectedCampus,
    filteredAlbums,
    totalCount: albums.length,
    filteredCount: filteredAlbums.length,
  };
}
