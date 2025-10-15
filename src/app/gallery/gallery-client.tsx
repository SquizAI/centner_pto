'use client';

import * as React from 'react';
import { AlbumGrid } from '@/components/gallery/AlbumGrid';
import { AlbumFilter } from '@/components/gallery/AlbumFilter';
import { AlbumWithStats, GalleryCampus } from '@/types/gallery.types';

interface GalleryPageClientProps {
  albums: AlbumWithStats[];
}

export function GalleryPageClient({ albums }: GalleryPageClientProps) {
  const [selectedCampus, setSelectedCampus] = React.useState<GalleryCampus | null>(
    null
  );

  // Filter albums by campus
  const filteredAlbums = React.useMemo(() => {
    if (!selectedCampus) {
      return albums;
    }

    return albums.filter((album) => {
      // If 'all' campus filter is selected, show all albums
      if (selectedCampus === 'all') {
        return true;
      }
      // Otherwise filter by specific campus
      return album.campus === selectedCampus || album.campus === 'all';
    });
  }, [albums, selectedCampus]);

  return (
    <>
      {/* Filter Section */}
      <div className="mb-8">
        <AlbumFilter
          selectedCampus={selectedCampus}
          onCampusChange={setSelectedCampus}
        />
      </div>

      {/* Albums Grid */}
      <AlbumGrid albums={filteredAlbums} />
    </>
  );
}
