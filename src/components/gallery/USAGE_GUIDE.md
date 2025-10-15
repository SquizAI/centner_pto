# Photo Gallery - Implementation Guide

Complete guide for implementing the photo gallery feature in the Centner Academy PTO website.

## Quick Start

### 1. Install Dependencies (Already Installed)
```bash
npm install framer-motion react-dropzone date-fns
```

### 2. Import Components
```tsx
import {
  AlbumCard,
  AlbumGrid,
  AlbumFilter,
  PhotoGallery,
  PhotoLightbox,
  PhotoUploadZone,
  useLightbox,
} from '@/components/gallery';
```

### 3. Import Types
```tsx
import {
  AlbumWithStats,
  Photo,
  GalleryCampus,
  LightboxPhoto,
} from '@/types/gallery.types';
```

---

## Implementation Patterns

### Pattern 1: Gallery Listing Page

**File:** `/app/gallery/page.tsx`

```tsx
// Server Component (fetches data)
import { createClient } from '@/lib/supabase/server';
import { GalleryClientWrapper } from './GalleryClientWrapper';

export default async function GalleryPage() {
  const supabase = await createClient();

  // Fetch published albums with photo counts
  const { data: albums } = await supabase
    .rpc('get_recent_albums', { album_limit: 100 });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Photo Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Browse photos from our events and activities
        </p>
      </div>

      <GalleryClientWrapper albums={albums || []} />
    </div>
  );
}
```

**File:** `/app/gallery/GalleryClientWrapper.tsx`

```tsx
'use client';

import { useState } from 'react';
import { AlbumGrid, AlbumFilter } from '@/components/gallery';
import { useGalleryFilter } from '@/components/gallery/useGalleryFilter';
import { AlbumWithStats } from '@/types/gallery.types';

export function GalleryClientWrapper({ albums }: { albums: AlbumWithStats[] }) {
  const { selectedCampus, setSelectedCampus, filteredAlbums } = useGalleryFilter({
    albums,
  });

  return (
    <div className="space-y-8">
      {/* Filter */}
      <AlbumFilter
        selectedCampus={selectedCampus}
        onCampusChange={setSelectedCampus}
      />

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAlbums.length} of {albums.length} albums
      </div>

      {/* Grid */}
      <AlbumGrid albums={filteredAlbums} />
    </div>
  );
}
```

---

### Pattern 2: Album Detail Page

**File:** `/app/gallery/[slug]/page.tsx`

```tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { AlbumDetailClientWrapper } from './AlbumDetailClientWrapper';

export default async function AlbumPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  // Fetch album by slug
  const { data: album } = await supabase
    .from('photo_albums')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single();

  if (!album) notFound();

  // Fetch photos for album
  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', album.id)
    .order('sort_order', { ascending: true });

  // Get photo count
  const photo_count = photos?.length || 0;

  return (
    <AlbumDetailClientWrapper
      album={{ ...album, photo_count }}
      photos={photos || []}
    />
  );
}
```

**File:** `/app/gallery/[slug]/AlbumDetailClientWrapper.tsx`

```tsx
'use client';

import { useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import { PhotoGallery, PhotoLightbox, useLightbox } from '@/components/gallery';
import { Badge } from '@/components/ui/badge';
import { AlbumWithStats, Photo, LightboxPhoto, GALLERY_CAMPUS_CONFIG } from '@/types/gallery.types';

interface Props {
  album: AlbumWithStats;
  photos: Photo[];
}

export function AlbumDetailClientWrapper({ album, photos }: Props) {
  const campusConfig = GALLERY_CAMPUS_CONFIG[album.campus];

  // Convert to lightbox format
  const lightboxPhotos: LightboxPhoto[] = useMemo(
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

  // Lightbox state
  const { isOpen, currentIndex, open, close, next, previous } = useLightbox(lightboxPhotos);

  const handlePhotoClick = useCallback(
    (_photo: Photo, index: number) => {
      open(index);
    },
    [open]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Album Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={`${campusConfig.bgColor} ${campusConfig.textColor}`}>
            {campusConfig.label}
          </Badge>
        </div>

        <h1 className="text-4xl font-bold">{album.title}</h1>

        {album.description && (
          <p className="text-lg text-muted-foreground max-w-3xl">
            {album.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          {album.event_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={album.event_date}>
                {format(new Date(album.event_date), 'MMMM d, yyyy')}
              </time>
            </div>
          )}

          {album.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{album.location}</span>
            </div>
          )}

          <div className="text-muted-foreground">
            <span className="font-medium">{album.photo_count}</span>{' '}
            {album.photo_count === 1 ? 'photo' : 'photos'}
          </div>
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
```

---

### Pattern 3: Admin Photo Upload

**File:** `/app/admin/gallery/upload/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoUploadZone, UploadProgress } from '@/components/gallery';
import { Button } from '@/components/ui/button';
import { PhotoUploadFile } from '@/types/gallery.types';

export default function PhotoUploadPage({ params }: { params: { albumId: string } }) {
  const router = useRouter();
  const [files, setFiles] = useState<PhotoUploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    Array<{ name: string; progress: number; status: 'uploading' | 'success' | 'error' }>
  >([]);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const progress = files.map((file) => ({
      name: file.name,
      progress: 0,
      status: 'uploading' as const,
    }));
    setUploadProgress(progress);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/gallery/albums/${params.albumId}/photos`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        // Update progress
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, progress: 100, status: 'success' } : p
          )
        );
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error' } : p
          )
        );
      }
    }

    setUploading(false);

    // Redirect after successful upload
    setTimeout(() => {
      router.push(`/admin/gallery/${params.albumId}`);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload Photos</h1>
          <p className="text-muted-foreground">
            Add photos to your album. Supported formats: JPG, PNG, WEBP, GIF
          </p>
        </div>

        <PhotoUploadZone
          onFilesSelected={setFiles}
          maxFiles={50}
          disabled={uploading}
        />

        {uploadProgress.length > 0 && (
          <UploadProgress files={uploadProgress} />
        )}

        {files.length > 0 && !uploading && (
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setFiles([])}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              Upload {files.length} {files.length === 1 ? 'photo' : 'photos'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## API Routes

Create these API routes for full functionality:

### GET Albums
**File:** `/app/api/gallery/albums/route.ts`

```tsx
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campus = searchParams.get('campus');

  const supabase = await createClient();

  let query = supabase
    .rpc('get_recent_albums', { album_limit: 100 });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter by campus if specified
  const filteredData = campus && campus !== 'all'
    ? data?.filter((album) => album.campus === campus || album.campus === 'all')
    : data;

  return NextResponse.json(filteredData);
}
```

### GET Album Photos
**File:** `/app/api/gallery/albums/[slug]/photos/route.ts`

```tsx
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient();

  // Get album by slug
  const { data: album } = await supabase
    .from('photo_albums')
    .select('id')
    .eq('slug', params.slug)
    .eq('published', true)
    .single();

  if (!album) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }

  // Get photos
  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .eq('album_id', album.id)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(photos);
}
```

### POST Upload Photo
**File:** `/app/api/gallery/albums/[albumId]/photos/route.ts`

```tsx
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { albumId: string } }
) {
  const supabase = await createClient();

  // Check user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Upload to storage
  const fileName = `${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('event-photos')
    .upload(`${params.albumId}/${fileName}`, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('event-photos')
    .getPublicUrl(uploadData.path);

  // Insert photo record
  const { data: photo, error: dbError } = await supabase
    .from('photos')
    .insert({
      album_id: params.albumId,
      storage_path: uploadData.path,
      storage_bucket: 'event-photos',
      url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(photo);
}
```

---

## Navigation Setup

Add gallery links to your navigation:

**File:** `/src/components/layout/header.tsx`

```tsx
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/news', label: 'News' },
  { href: '/events', label: 'Events' },
  { href: '/volunteer', label: 'Volunteer' },
  { href: '/gallery', label: 'Gallery' }, // Add this
];
```

---

## Testing Checklist

- [ ] Albums display in responsive grid
- [ ] Campus filter works correctly
- [ ] Album detail page shows photos
- [ ] Lightbox opens on photo click
- [ ] Lightbox navigation (prev/next) works
- [ ] Keyboard navigation (arrow keys, ESC) works
- [ ] Touch swipe works on mobile
- [ ] Loading states display correctly
- [ ] Empty states display when no data
- [ ] Photo upload drag-and-drop works
- [ ] File validation works (type, size)
- [ ] Upload progress displays
- [ ] Images are lazy loaded
- [ ] Alt text is present for accessibility
- [ ] Focus indicators are visible
- [ ] Screen reader navigation works

---

## Performance Tips

1. **Optimize Images**: Use Next.js Image with proper sizes prop
2. **Lazy Load**: Only load images in viewport
3. **Thumbnails**: Use thumbnail_url for grid views
4. **Pagination**: Implement infinite scroll for large albums
5. **CDN**: Serve images from Supabase Storage CDN
6. **Memoization**: Use useMemo for filtered results
7. **Code Splitting**: Keep components client-side only when needed

---

## Troubleshooting

**Issue: Images not loading**
- Check Supabase Storage bucket is public
- Verify RLS policies allow public read access
- Check URL format is correct

**Issue: Upload fails**
- Verify user has admin role
- Check file size is under 10MB
- Ensure storage bucket exists
- Check RLS policies allow admin upload

**Issue: Lightbox not closing**
- Check ESC key handler is attached
- Verify close button onClick is working
- Check no z-index conflicts

**Issue: Filter not working**
- Verify campus values match exactly
- Check useGalleryFilter hook is used correctly
- Ensure albums have campus property

---

## Next Steps

1. Create gallery pages using the patterns above
2. Set up API routes for data fetching
3. Configure Supabase Storage bucket
4. Add admin upload interface
5. Test all components thoroughly
6. Deploy and monitor performance

For more details, see README.md and GalleryExample.tsx.
