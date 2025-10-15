import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { GalleryPageClient } from './gallery-client';
import { AlbumWithStats } from '@/types/gallery.types';

export const metadata: Metadata = {
  title: 'Photo Gallery | Centner Academy PTO',
  description:
    'Browse photo albums from Centner Academy PTO events and activities. View photos from preschool, elementary, and middle-high school events.',
  openGraph: {
    title: 'Photo Gallery | Centner Academy PTO',
    description:
      'Browse photo albums from Centner Academy PTO events and activities.',
    type: 'website',
  },
};

// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

async function getPublishedAlbums(): Promise<AlbumWithStats[]> {
  const supabase = await createClient();

  // Use the database function to get albums with stats
  const { data: albums, error } = await supabase.rpc('get_recent_albums', {
    album_limit: 100,
  });

  if (error) {
    console.error('Error fetching albums:', error);
    throw new Error('Failed to fetch albums');
  }

  return (albums || []) as AlbumWithStats[];
}

export default async function GalleryPage() {
  try {
    const albums = await getPublishedAlbums();

    return (
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Photo Gallery</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse photo albums from our school events and activities. Click on any
            album to view the full collection.
          </p>
        </header>

        {/* Gallery Content - Client Component for filtering */}
        <GalleryPageClient albums={albums} />
      </div>
    );
  } catch (error) {
    console.error('Error in GalleryPage:', error);
    throw error;
  }
}
