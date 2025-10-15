import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminPageClient } from './admin-client';
import { AlbumWithStats } from '@/types/gallery.types';

export const metadata: Metadata = {
  title: 'Gallery Admin | Centner Academy PTO',
  description: 'Manage photo albums and upload photos for Centner Academy PTO',
};

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

async function getAllAlbums(): Promise<AlbumWithStats[]> {
  const supabase = await createClient();

  // Get all albums (not just published ones) with photo counts
  const { data: albums, error } = await supabase
    .from('photo_albums')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching albums:', error);
    throw new Error('Failed to fetch albums');
  }

  // Get photo counts for each album
  const albumsWithStats: AlbumWithStats[] = await Promise.all(
    (albums || []).map(async (album) => {
      const { count } = await supabase
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('album_id', album.id);

      return {
        ...album,
        photo_count: count || 0,
      };
    })
  );

  return albumsWithStats;
}

export default async function GalleryAdminPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/gallery/admin');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/gallery');
  }

  try {
    const albums = await getAllAlbums();

    return (
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gallery Admin</h1>
          <p className="text-muted-foreground text-lg">
            Create albums, upload photos, and manage the photo gallery.
          </p>
        </header>

        {/* Admin Interface - Client Component */}
        <AdminPageClient albums={albums} />
      </div>
    );
  } catch (error) {
    console.error('Error in GalleryAdminPage:', error);
    throw error;
  }
}
