# Photo Gallery Components

Comprehensive, accessible, and performant photo gallery components for the Centner Academy PTO website.

## Components Overview

### 1. AlbumCard
Individual album card component with cover image, metadata, and campus badge.

**Props:**
- `album: AlbumWithStats` - Album data with photo count
- `className?: string` - Optional CSS classes
- `priority?: boolean` - Image loading priority (default: false)

**Features:**
- Responsive aspect ratio (4:3)
- Cover image with fallback
- Campus badge overlay
- Photo count indicator
- Hover animations
- Skeleton loading state

**Example:**
```tsx
import { AlbumCard } from '@/components/gallery';

<AlbumCard album={album} priority={true} />
```

---

### 2. AlbumGrid
Responsive grid layout for displaying multiple albums.

**Props:**
- `albums: AlbumWithStats[]` - Array of albums to display
- `className?: string` - Optional CSS classes
- `loading?: boolean` - Show loading skeletons (default: false)

**Features:**
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Loading skeleton states
- Empty state message
- Staggered animation variant available

**Variants:**
- `AlbumGrid` - Standard grid
- `AlbumGridAnimated` - With staggered entry animations

**Example:**
```tsx
import { AlbumGrid } from '@/components/gallery';

<AlbumGrid albums={albums} loading={isLoading} />
```

---

### 3. AlbumFilter
Campus filter component for filtering albums.

**Props:**
- `selectedCampus: GalleryCampus | null` - Currently selected campus
- `onCampusChange: (campus: GalleryCampus | null) => void` - Selection handler
- `className?: string` - Optional CSS classes

**Features:**
- Keyboard navigation support
- Active state styling
- Accessible ARIA labels
- Smooth transitions

**Example:**
```tsx
import { AlbumFilter } from '@/components/gallery';
import { useGalleryFilter } from '@/components/gallery/useGalleryFilter';

const { selectedCampus, setSelectedCampus, filteredAlbums } = useGalleryFilter({ albums });

<AlbumFilter
  selectedCampus={selectedCampus}
  onCampusChange={setSelectedCampus}
/>
```

---

### 4. PhotoGallery
Masonry layout for displaying photos within an album.

**Props:**
- `photos: Photo[]` - Array of photos to display
- `onPhotoClick?: (photo: Photo, index: number) => void` - Click handler
- `className?: string` - Optional CSS classes
- `loading?: boolean` - Show loading state (default: false)

**Features:**
- CSS columns masonry layout
- Lazy loading with loading states
- Maintains aspect ratios
- Hover overlay with captions
- Keyboard navigation
- Loading skeletons
- Empty state

**Example:**
```tsx
import { PhotoGallery, useLightbox } from '@/components/gallery';

const { open } = useLightbox(photos);

<PhotoGallery
  photos={photos}
  onPhotoClick={(_photo, index) => open(index)}
/>
```

---

### 5. PhotoLightbox
Full-screen photo viewer with navigation.

**Props:**
- `photos: LightboxPhoto[]` - Array of photos for lightbox
- `currentIndex: number` - Current photo index
- `isOpen: boolean` - Lightbox open state
- `onClose: () => void` - Close handler
- `onNext: () => void` - Next photo handler
- `onPrevious: () => void` - Previous photo handler

**Features:**
- Full-screen overlay
- Previous/Next navigation
- Close button and ESC key support
- Keyboard navigation (arrow keys)
- Touch/swipe support for mobile
- Photo caption and metadata
- Loading states
- Photo counter

**Hook:**
Use the `useLightbox` hook for easy state management:

```tsx
const { isOpen, currentIndex, open, close, next, previous } = useLightbox(photos);
```

**Example:**
```tsx
import { PhotoLightbox, useLightbox } from '@/components/gallery';

const lightboxPhotos = photos.map(photo => ({
  id: photo.id,
  url: photo.url,
  title: photo.title,
  caption: photo.caption,
  alt_text: photo.alt_text,
  width: photo.width,
  height: photo.height,
}));

const { isOpen, currentIndex, open, close, next, previous } = useLightbox(lightboxPhotos);

<PhotoLightbox
  photos={lightboxPhotos}
  currentIndex={currentIndex}
  isOpen={isOpen}
  onClose={close}
  onNext={next}
  onPrevious={previous}
/>
```

---

### 6. PhotoUploadZone
Drag-and-drop photo upload interface (admin only).

**Props:**
- `onFilesSelected: (files: PhotoUploadFile[]) => void` - File selection handler
- `maxFiles?: number` - Maximum files allowed (default: 20)
- `className?: string` - Optional CSS classes
- `disabled?: boolean` - Disable upload (default: false)

**Features:**
- Drag and drop with visual feedback
- Click to browse files
- File type validation (images only)
- File size validation (max 10MB)
- Multiple file upload
- Preview thumbnails
- Remove files before upload
- Error handling and display
- Progress indicators

**Companion Component:**
`UploadProgress` - Shows upload progress for multiple files

**Example:**
```tsx
import { PhotoUploadZone } from '@/components/gallery';

const [files, setFiles] = useState<File[]>([]);

<PhotoUploadZone
  onFilesSelected={setFiles}
  maxFiles={50}
  disabled={uploading}
/>
```

---

## Hooks

### useGalleryFilter
Filter albums by campus with memoized results.

**Parameters:**
- `albums: AlbumWithStats[]` - Albums to filter
- `initialCampus?: GalleryCampus | null` - Initial campus selection

**Returns:**
- `selectedCampus: GalleryCampus | null` - Current selection
- `setSelectedCampus: (campus: GalleryCampus | null) => void` - Update selection
- `filteredAlbums: AlbumWithStats[]` - Filtered albums
- `totalCount: number` - Total album count
- `filteredCount: number` - Filtered album count

**Example:**
```tsx
import { useGalleryFilter } from '@/components/gallery/useGalleryFilter';

const { selectedCampus, setSelectedCampus, filteredAlbums } = useGalleryFilter({
  albums,
  initialCampus: 'elementary',
});
```

### useLightbox
Manage lightbox state and navigation.

**Parameters:**
- `photos: LightboxPhoto[]` - Photos for lightbox

**Returns:**
- `isOpen: boolean` - Lightbox open state
- `currentIndex: number` - Current photo index
- `open: (index: number) => void` - Open lightbox at index
- `close: () => void` - Close lightbox
- `next: () => void` - Navigate to next photo
- `previous: () => void` - Navigate to previous photo

---

## TypeScript Types

All types are exported from `@/types/gallery.types.ts`:

```typescript
import {
  AlbumWithStats,
  Photo,
  PhotoAlbum,
  GalleryCampus,
  LightboxPhoto,
  PhotoUploadFile,
  PhotoUploadError,
  GALLERY_CAMPUS_CONFIG,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from '@/types/gallery.types';
```

**Key Types:**
- `PhotoAlbum` - Database album type
- `Photo` - Database photo type
- `AlbumWithStats` - Album with computed photo_count
- `GalleryCampus` - Campus enum type
- `LightboxPhoto` - Simplified photo type for lightbox
- `PhotoUploadFile` - File with preview URL

---

## Accessibility Features

All components follow WCAG 2.1 AA standards:

- **Keyboard Navigation**: Full keyboard support with focus indicators
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Alt Text**: Required alt text for all images
- **Focus Management**: Proper focus trapping in lightbox
- **Semantic HTML**: Correct heading hierarchy and landmarks
- **Color Contrast**: Sufficient contrast ratios (4.5:1 minimum)
- **Touch Targets**: Minimum 44x44px touch targets

---

## Performance Optimizations

- **Next.js Image**: Automatic image optimization
- **Lazy Loading**: Images load on-demand
- **Preview URLs**: Thumbnail URLs for faster loading
- **CSS Columns**: Performant masonry layout
- **Memoization**: Filtered results cached with useMemo
- **Code Splitting**: Client components loaded on-demand
- **Loading States**: Skeleton screens for better perceived performance

---

## Styling

Components use Tailwind CSS and shadcn/ui:

- Consistent with existing Centner PTO design
- Teal primary color theme
- Responsive breakpoints
- Dark mode compatible
- Smooth animations with Framer Motion

---

## Server vs Client Components

**Server Components** (can be used in RSC):
- None - All gallery components require interactivity

**Client Components** (require 'use client'):
- All components (they use hooks, animations, and event handlers)

**Best Practice:**
Fetch data in Server Components, pass to Client Components:

```tsx
// app/gallery/page.tsx (Server Component)
import { AlbumGrid } from '@/components/gallery';

async function GalleryPage() {
  const albums = await fetchAlbumsWithStats();

  return <GalleryClientWrapper albums={albums} />;
}

// components/GalleryClientWrapper.tsx (Client Component)
'use client';

export function GalleryClientWrapper({ albums }) {
  // Client-side logic here
  return <AlbumGrid albums={albums} />;
}
```

---

## Complete Example

See `GalleryExample.tsx` for comprehensive usage examples including:
1. Album listing page with filtering
2. Album detail page with lightbox
3. Admin photo upload interface
4. Combined view with tabs

---

## Database Schema Reference

Photo gallery uses these Supabase tables:

**photo_albums**
- id, title, slug, description
- event_date, location, campus
- cover_photo_url, published, publish_date
- sort_order, created_by, timestamps

**photos**
- id, album_id, storage_path, storage_bucket
- url, thumbnail_url
- title, caption, alt_text
- file_name, file_size, mime_type
- width, height, sort_order, featured
- uploaded_by, timestamps

See migration file for full schema details.

---

## API Integration

Expected API endpoints:

```typescript
// Get published albums with photo counts
GET /api/gallery/albums
Query: ?campus=elementary

// Get album by slug
GET /api/gallery/albums/[slug]

// Get photos for album
GET /api/gallery/albums/[slug]/photos

// Upload photo (admin only)
POST /api/gallery/albums/[id]/photos
Body: FormData with file

// Update photo metadata (admin only)
PATCH /api/gallery/photos/[id]
Body: { title, caption, alt_text }

// Delete photo (admin only)
DELETE /api/gallery/photos/[id]
```

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Android Chrome 80+
- Touch and mouse input
- Keyboard navigation

---

## Future Enhancements

Potential additions:
- [ ] Infinite scroll for large galleries
- [ ] Image zoom on hover
- [ ] Bulk photo management
- [ ] Photo tagging and search
- [ ] Social sharing
- [ ] Download original photos
- [ ] Photo comments
- [ ] Favorite photos
- [ ] Slideshow mode
- [ ] EXIF data display

---

## Support

For questions or issues, contact the development team or refer to:
- Component source code in `/src/components/gallery/`
- Type definitions in `/src/types/gallery.types.ts`
- Database migration in `/supabase/migrations/20251015100000_create_photo_gallery.sql`
