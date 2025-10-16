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

  try {
    // Fetch all albums (migration may not be applied yet)
    // Using simple query that doesn't depend on published column
    const { data: albums, error } = await supabase
      .from('photo_albums')
      .select(`
        *,
        photos:photos(count)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching albums:', error);
      // Return empty array instead of throwing to show empty state
      return [];
    }

    // Transform the data to match AlbumWithStats type
    return (albums || []).map((album: any) => ({
      ...album,
      photo_count: album.photos?.[0]?.count || 0,
    })) as AlbumWithStats[];
  } catch (error) {
    console.error('Error in getPublishedAlbums:', error);
    // Return empty array for graceful degradation
    return [];
  }
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
