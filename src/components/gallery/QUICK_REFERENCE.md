# Photo Gallery - Quick Reference Card

## Import Everything You Need
```tsx
// Components
import {
  AlbumCard,
  AlbumGrid,
  AlbumFilter,
  PhotoGallery,
  PhotoLightbox,
  PhotoUploadZone,
  useLightbox,
} from '@/components/gallery';

// Hook
import { useGalleryFilter } from '@/components/gallery/useGalleryFilter';

// Types
import {
  AlbumWithStats,
  Photo,
  GalleryCampus,
  LightboxPhoto,
} from '@/types/gallery.types';
```

## Common Patterns

### 1. Album Listing with Filter
```tsx
'use client';

const { selectedCampus, setSelectedCampus, filteredAlbums } = useGalleryFilter({ albums });

return (
  <>
    <AlbumFilter selectedCampus={selectedCampus} onCampusChange={setSelectedCampus} />
    <AlbumGrid albums={filteredAlbums} />
  </>
);
```

### 2. Photo Gallery with Lightbox
```tsx
'use client';

const lightboxPhotos = photos.map(p => ({
  id: p.id, url: p.url, title: p.title, caption: p.caption,
  alt_text: p.alt_text, width: p.width, height: p.height
}));

const { isOpen, currentIndex, open, close, next, previous } = useLightbox(lightboxPhotos);

return (
  <>
    <PhotoGallery photos={photos} onPhotoClick={(_, i) => open(i)} />
    <PhotoLightbox
      photos={lightboxPhotos}
      currentIndex={currentIndex}
      isOpen={isOpen}
      onClose={close}
      onNext={next}
      onPrevious={previous}
    />
  </>
);
```

### 3. Photo Upload
```tsx
'use client';

const [files, setFiles] = useState<File[]>([]);

return (
  <PhotoUploadZone onFilesSelected={setFiles} maxFiles={50} />
);
```

## Component Props Quick Ref

### AlbumCard
- `album: AlbumWithStats` - Required
- `priority?: boolean` - For above-fold images

### AlbumGrid
- `albums: AlbumWithStats[]` - Required
- `loading?: boolean` - Show skeletons

### AlbumFilter
- `selectedCampus: GalleryCampus | null` - Required
- `onCampusChange: (campus) => void` - Required

### PhotoGallery
- `photos: Photo[]` - Required
- `onPhotoClick?: (photo, index) => void` - For lightbox

### PhotoLightbox
- `photos: LightboxPhoto[]` - Required
- `currentIndex: number` - Required
- `isOpen: boolean` - Required
- `onClose: () => void` - Required
- `onNext: () => void` - Required
- `onPrevious: () => void` - Required

### PhotoUploadZone
- `onFilesSelected: (files) => void` - Required
- `maxFiles?: number` - Default: 20
- `disabled?: boolean` - For upload state

## Database Queries

### Fetch Albums
```tsx
const { data: albums } = await supabase
  .rpc('get_recent_albums', { album_limit: 100 });
```

### Fetch Album by Slug
```tsx
const { data: album } = await supabase
  .from('photo_albums')
  .select('*')
  .eq('slug', slug)
  .eq('published', true)
  .single();
```

### Fetch Photos
```tsx
const { data: photos } = await supabase
  .from('photos')
  .select('*')
  .eq('album_id', albumId)
  .order('sort_order', { ascending: true });
```

### Upload Photo
```tsx
const { data: file } = await supabase.storage
  .from('event-photos')
  .upload(`${albumId}/${fileName}`, file);

const { data: { publicUrl } } = supabase.storage
  .from('event-photos')
  .getPublicUrl(file.path);

const { data: photo } = await supabase
  .from('photos')
  .insert({ album_id, url: publicUrl, /* ... */ })
  .select()
  .single();
```

## Responsive Breakpoints
- **Mobile**: 1 column (< 768px)
- **Tablet**: 2 columns (768px - 1024px)
- **Desktop**: 3 columns (> 1024px)

## Keyboard Shortcuts

### Lightbox
- `ESC` - Close
- `←` - Previous photo
- `→` - Next photo

### Filter
- `Tab` - Navigate badges
- `Enter` or `Space` - Select badge

## Campus Values
```tsx
type GalleryCampus = 'all' | 'preschool' | 'elementary' | 'middle-high';
```

## File Upload Limits
- **Max File Size**: 10MB
- **Accepted Types**: JPG, PNG, WEBP, GIF
- **Max Files**: 20 (default, configurable)

## Color Palette
```tsx
const GALLERY_CAMPUS_CONFIG = {
  all: { bgColor: 'bg-primary', textColor: 'text-primary-foreground' },
  preschool: { bgColor: 'bg-purple-500', textColor: 'text-white' },
  elementary: { bgColor: 'bg-blue-500', textColor: 'text-white' },
  'middle-high': { bgColor: 'bg-teal-500', textColor: 'text-white' },
};
```

## Common Issues & Fixes

**Images not loading?**
- Check Storage bucket is public
- Verify RLS policies
- Check URL format

**Filter not working?**
- Use `useGalleryFilter` hook
- Ensure campus values match exactly

**Lightbox won't close?**
- Check ESC handler is attached
- Verify onClick on overlay
- Check z-index conflicts

**Upload fails?**
- Verify user is admin
- Check file size < 10MB
- Ensure bucket exists

## File Locations
- Components: `/src/components/gallery/`
- Types: `/src/types/gallery.types.ts`
- Migration: `/supabase/migrations/20251015100000_create_photo_gallery.sql`

## Documentation
- **API Reference**: `README.md`
- **Implementation**: `USAGE_GUIDE.md`
- **Examples**: `GalleryExample.tsx`
- **Summary**: `COMPONENT_SUMMARY.md`

---
Quick reference for Photo Gallery components v1.0.0
