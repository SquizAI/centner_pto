import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

import { createClient } from '@/lib/supabase/server';
import { AlbumPageClient } from './album-client';
import { AlbumWithStats, Photo } from '@/types/gallery.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GALLERY_CAMPUS_CONFIG, GalleryCampus } from '@/types/gallery.types';
import { cn } from '@/lib/utils';

// Make this route dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

// Fetch album by slug
async function getAlbumBySlug(slug: string): Promise<AlbumWithStats | null> {
  const supabase = await createClient();

  const { data: album, error } = await supabase
    .from('photo_albums')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !album) {
    return null;
  }

  // Get photo count
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('album_id', album.id);

  return {
    ...album,
    photo_count: count || 0,
  } as AlbumWithStats;
}

// Fetch photos for an album
async function getAlbumPhotos(albumId: string): Promise<Photo[]> {
  const supabase = await createClient();

  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', albumId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }

  return photos || [];
}

// Generate dynamic metadata for SEO
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const album = await getAlbumBySlug(slug);

  if (!album) {
    return {
      title: 'Album Not Found | Centner Academy PTO',
    };
  }

  const title = `${album.title} | Photo Gallery | Centner Academy PTO`;
  const description =
    album.description ||
    `View photos from ${album.title} at Centner Academy PTO`;
  const imageUrl = album.cover_image_url || '/default-album-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: album.created_at || undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: album.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function AlbumPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const album = await getAlbumBySlug(slug);

  // If album not found or not published, show 404
  if (!album) {
    notFound();
  }

  // Fetch photos
  const photos = await getAlbumPhotos(album.id);

  const campusKey = (album.campus || 'all') as GalleryCampus;
  const campusConfig = GALLERY_CAMPUS_CONFIG[campusKey];
  const eventDate = album.created_at ? new Date(album.created_at) : null;

  return (
    <div className="min-h-screen">
      {/* Back to Gallery Link */}
      <div className="container mx-auto px-4 pt-8">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery
        </Link>
      </div>

      {/* Album Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="max-w-4xl">
          {/* Campus Badge */}
          <div className="mb-4">
            <Badge
              className={cn(
                'font-semibold',
                campusConfig.bgColor,
                campusConfig.textColor,
                'border-none'
              )}
            >
              {campusConfig.label}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{album.title}</h1>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
            {eventDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <time dateTime={eventDate.toISOString()}>
                  {format(eventDate, 'MMMM d, yyyy')}
                </time>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span>
                {album.photo_count} {album.photo_count === 1 ? 'photo' : 'photos'}
              </span>
            </div>
          </div>

          {/* Description */}
          {album.description && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {album.description}
            </p>
          )}

          {/* Share Button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: album.title,
                    text: album.description || `Check out ${album.title}`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Share Album
            </Button>
          </div>
        </div>
      </header>

      {/* Photos Section - Client Component for lightbox */}
      <section className="container mx-auto px-4 py-8">
        <AlbumPageClient photos={photos} albumTitle={album.title} />
      </section>

      {/* Call to Action */}
      <section className="bg-primary/5 py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">View More Albums</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Explore more photo albums from our school events and activities.
          </p>
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Browse All Albums
          </Link>
        </div>
      </section>
    </div>
  );
}
