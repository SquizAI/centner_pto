# Photo Gallery Feature - Implementation Documentation

## Overview

Complete photo gallery feature for the Centner Academy PTO website built with Next.js 15 App Router, featuring album management, photo uploads, and public browsing capabilities.

## Features Implemented

### Public Features
- Browse published photo albums
- Filter albums by campus (All, Preschool, Elementary, Middle-High)
- View individual albums with masonry photo layout
- Full-screen photo lightbox with keyboard/touch navigation
- Share album functionality
- SEO-optimized metadata for albums
- Responsive design for mobile and desktop

### Admin Features
- Create and manage photo albums
- Bulk photo upload with drag-and-drop
- Publish/unpublish albums
- Delete albums and photos
- Album metadata management (title, description, date, location, campus)
- Protected admin routes with authentication

## File Structure

```
/src/app/gallery/
├── page.tsx                    # Main gallery listing page (Server Component)
├── gallery-client.tsx          # Client component for filtering
├── loading.tsx                 # Loading state for gallery
├── actions.ts                  # Server Actions for mutations
│
├── [slug]/                     # Dynamic album routes
│   ├── page.tsx               # Album detail page (Server Component)
│   ├── album-client.tsx       # Client component for lightbox
│   ├── loading.tsx            # Album loading state
│   └── not-found.tsx          # 404 page for missing albums
│
└── admin/                      # Admin interface
    ├── page.tsx               # Admin dashboard (Server Component)
    ├── admin-client.tsx       # Client component for album management
    └── loading.tsx            # Admin loading state
```

## Routes

### Public Routes

**`/gallery`** - Main gallery page
- Displays grid of published photo albums
- Campus filter for browsing
- Server-side data fetching with ISR (revalidates hourly)

**`/gallery/[slug]`** - Individual album page
- Shows album details and photos
- Masonry photo layout
- Full-screen lightbox viewer
- Share functionality
- Dynamic metadata for SEO

### Protected Routes

**`/gallery/admin`** - Admin dashboard
- Requires authentication and admin role
- Create new albums
- Upload photos to albums
- Manage album publish status
- Delete albums and photos

## Server Actions

All mutations are handled via Server Actions in `actions.ts`:

### `uploadPhotos(albumId, formData)`
- Uploads multiple photos to Supabase Storage
- Extracts image metadata (dimensions, file size)
- Creates photo records in database
- Returns photo IDs on success

### `createAlbum(data)`
- Creates new photo album
- Generates URL-safe slug from title
- Validates admin permissions
- Returns album ID and slug

### `deleteAlbum(albumId)`
- Deletes album and all associated photos
- Removes files from Supabase Storage
- Requires admin permissions
- Cascade deletes handled by database

### `updateAlbumPublishStatus(albumId, published)`
- Publishes or unpublishes an album
- Sets publish_date when publishing
- Requires admin permissions

### `deletePhoto(photoId)`
- Deletes individual photo
- Removes file from Supabase Storage
- Requires admin permissions

## Database Integration

### Tables Used

**`photo_albums`**
- Stores album metadata
- Fields: title, slug, description, event_date, location, campus, cover_photo_url
- Publishing controls: published, publish_date
- RLS policies for public read, admin write

**`photos`**
- Stores individual photo records
- Fields: storage_path, url, file_name, file_size, mime_type, width, height
- Metadata: title, caption, alt_text
- Display: sort_order, featured
- Cascade deletes with albums

### Database Functions Used

**`get_recent_albums(limit)`**
- Returns published albums with photo counts
- Ordered by event_date
- Includes: id, title, slug, description, event_date, campus, cover_photo_url, photo_count

**`generate_album_slug(title)`**
- Generates URL-safe slug from album title
- Converts to lowercase, replaces spaces with hyphens
- Removes special characters

## Components Used

All gallery UI components from `/src/components/gallery/`:

- **AlbumGrid** - Responsive grid layout for album cards
- **AlbumCard** - Individual album card with cover photo, metadata, badges
- **AlbumFilter** - Campus filter with badge selection
- **PhotoGallery** - Masonry layout for photos with lazy loading
- **PhotoLightbox** - Full-screen photo viewer with navigation
- **PhotoUploadZone** - Drag-and-drop photo upload interface
- **useLightbox** - Custom hook for lightbox state management

## Authentication & Authorization

### Route Protection

Admin routes are protected with server-side authentication checks:

```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login?redirect=/gallery/admin');

const { data: profile } = await supabase.from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (!['admin', 'super_admin'].includes(profile.role)) {
  redirect('/gallery');
}
```

### Server Action Security

All Server Actions validate:
1. User is authenticated
2. User has admin or super_admin role
3. Resource ownership (where applicable)

## Supabase Storage

### Bucket Configuration

Photos are stored in the `event-photos` bucket:
- Public read access for viewing photos
- Admin-only write access via RLS policies
- Organized by album ID in folder structure
- 10MB file size limit recommended

### File Upload Process

1. Client selects files via PhotoUploadZone
2. Files sent to uploadPhotos Server Action
3. Each file uploaded to Storage with unique name: `{albumId}/{timestamp}-{random}.{ext}`
4. Public URL retrieved from Storage
5. Photo record created in database with URL and metadata
6. Album cover_photo_url auto-set to first photo (database trigger)

## Caching & Revalidation

### ISR Configuration

**Gallery Page**: `revalidate = 3600` (1 hour)
- Regenerates static page every hour
- Shows fresh data for most visitors
- Reduces database load

**Album Pages**: `revalidate = 3600` (1 hour)
- Dynamic per-album page
- Refreshes metadata hourly

**Admin Pages**: `dynamic = 'force-dynamic'`
- Always server-rendered
- Shows real-time data

### Manual Revalidation

Server Actions use `revalidatePath()` to trigger immediate updates:

```typescript
revalidatePath('/gallery');
revalidatePath(`/gallery/${albumId}`);
revalidatePath('/gallery/admin');
```

## Performance Optimizations

### Image Optimization

- Next.js Image component for automatic optimization
- Responsive image sizing with `sizes` attribute
- Priority loading for above-the-fold images
- Lazy loading for gallery grids

### Data Fetching

- Server Components for zero client-side JS
- Parallel data fetching where possible
- Database functions for efficient queries with aggregations
- Proper indexing on frequently queried columns

### Loading States

- Dedicated loading.tsx files for each route
- Skeleton components for better UX
- Streaming with Suspense boundaries

## Error Handling

### Client-Side Errors

- Inline error messages in forms
- Success/error feedback for user actions
- No external toast library needed

### Server-Side Errors

- Try-catch blocks in all Server Actions
- Descriptive error messages
- Logging in development mode
- Error boundaries for React errors

### 404 Handling

- Custom not-found.tsx for missing albums
- User-friendly error messages
- Navigation back to gallery or home

## SEO & Metadata

### Static Metadata

Gallery page has static metadata for consistent branding.

### Dynamic Metadata

Album pages generate metadata from album data:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const album = await getAlbumBySlug(params.slug);

  return {
    title: `${album.title} | Photo Gallery`,
    description: album.description,
    openGraph: {
      images: [album.cover_photo_url],
      type: 'article',
    },
  };
}
```

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support in lightbox
- Alt text for all images
- Focus management in dialogs
- Screen reader friendly error messages

## Mobile Support

- Touch swipe navigation in lightbox
- Responsive grid layouts
- Mobile-optimized image sizes
- Touch-friendly UI controls
- Proper viewport meta tags

## Testing Checklist

### Public Features
- [ ] Gallery page loads with published albums
- [ ] Campus filter works correctly
- [ ] Album page displays photos in masonry layout
- [ ] Lightbox opens and navigates photos
- [ ] Keyboard arrows navigate lightbox
- [ ] Share button copies URL or opens native share
- [ ] 404 page shows for invalid album slugs
- [ ] Mobile responsiveness

### Admin Features
- [ ] Admin route redirects non-admins
- [ ] Create album form validates and submits
- [ ] Photo upload works with multiple files
- [ ] Publish/unpublish toggles correctly
- [ ] Delete album confirmation and execution
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Page refreshes show updated data

### Performance
- [ ] Images lazy load properly
- [ ] Page loads in under 3 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Proper caching headers

## Future Enhancements

Potential features for future development:

1. **Photo Editing**
   - Crop and rotate photos
   - Edit captions and alt text
   - Reorder photos within album

2. **Bulk Operations**
   - Bulk delete photos
   - Move photos between albums
   - Batch edit metadata

3. **Advanced Filtering**
   - Search albums by title
   - Filter by date range
   - Tag-based organization

4. **Social Features**
   - Comments on photos
   - Like/favorite photos
   - Download original photos

5. **Analytics**
   - View counts per album
   - Most popular photos
   - Engagement metrics

6. **Automatic Features**
   - Generate thumbnails automatically
   - EXIF data extraction
   - Automatic photo descriptions (AI)

## Troubleshooting

### Common Issues

**Photos not uploading**
- Check Supabase Storage bucket permissions
- Verify file size under 10MB limit
- Check network connectivity
- Verify admin role assignment

**Albums not showing**
- Ensure album is published
- Check publish_date is in the past
- Verify RLS policies are enabled
- Check database connection

**Lightbox not opening**
- Check browser console for errors
- Verify PhotoLightbox component is imported
- Ensure photos have valid URLs
- Check click handler is attached

## Support

For issues or questions:
1. Check console for error messages
2. Verify database schema matches migration
3. Ensure Supabase Storage bucket exists
4. Check RLS policies are configured
5. Review this documentation

## Version History

**v1.0.0** - Initial implementation
- Complete gallery system with public and admin features
- Full CRUD operations for albums and photos
- Responsive design and accessibility
- SEO optimization
- Server-side rendering with ISR
