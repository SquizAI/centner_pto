# Photo Gallery System - Implementation Guide

## Overview
Comprehensive photo gallery system for the Centner Academy PTO website with album management, photo metadata storage, Supabase Storage integration, and public viewing capabilities.

## Database Schema

### Tables

#### `photo_albums`
Stores photo collections/albums for events and activities.

**Key Fields:**
- `id` (UUID): Primary key
- `title` (TEXT): Album display name
- `slug` (TEXT): URL-friendly identifier (unique)
- `description` (TEXT): Optional album description
- `event_date` (DATE): When the event occurred
- `location` (TEXT): Event location
- `campus` (ENUM): 'all', 'preschool', 'elementary', 'middle-high'
- `cover_photo_url` (TEXT): Featured photo (auto-set to first photo)
- `published` (BOOLEAN): Visibility status
- `publish_date` (TIMESTAMPTZ): When album goes live
- `sort_order` (INTEGER): Manual ordering for featured albums
- `created_by` (UUID): Admin who created the album

**Constraints:**
- Slug must be lowercase with hyphens only (`^[a-z0-9]+(?:-[a-z0-9]+)*$`)
- Published albums must have a `publish_date`

#### `photos`
Stores individual photo metadata with Supabase Storage references.

**Key Fields:**
- `id` (UUID): Primary key
- `album_id` (UUID): Foreign key to photo_albums
- `storage_path` (TEXT): Path in Supabase Storage bucket
- `storage_bucket` (TEXT): Bucket name (default: 'event-photos')
- `url` (TEXT): Full public URL to photo
- `thumbnail_url` (TEXT): URL to optimized/thumbnail version
- `title`, `caption`, `alt_text` (TEXT): Photo metadata
- `file_name` (TEXT): Original filename
- `file_size` (BIGINT): Size in bytes
- `mime_type` (TEXT): e.g., 'image/jpeg', 'image/png'
- `width`, `height` (INTEGER): Image dimensions in pixels
- `sort_order` (INTEGER): Display order within album
- `featured` (BOOLEAN): Highlight in album
- `uploaded_by` (UUID): Admin who uploaded the photo

**Constraints:**
- `file_size` must be > 0
- If dimensions provided, both width and height must be > 0

## Indexes

### Performance Optimizations
The schema includes comprehensive indexes for common query patterns:

**Album Indexes:**
- Unique slug for URL routing
- Published albums by event date
- Campus filtering
- Manual sort ordering
- Admin creator tracking

**Photo Indexes:**
- Album photos with sort order
- Featured photos
- Storage path lookup
- Upload tracking
- MIME type filtering

## Helper Functions

### `generate_album_slug(album_title TEXT)`
Generates URL-safe slugs from album titles.

```sql
SELECT generate_album_slug('Spring Festival 2025!');
-- Returns: 'spring-festival-2025'
```

### `get_album_photo_count(album_uuid UUID)`
Returns the number of photos in an album.

```sql
SELECT get_album_photo_count('123e4567-e89b-12d3-a456-426614174000');
-- Returns: 42
```

### `get_album_storage_size(album_uuid UUID)`
Returns total file size in bytes for all photos in an album.

```sql
SELECT get_album_storage_size('123e4567-e89b-12d3-a456-426614174000');
-- Returns: 15728640 (15 MB)
```

### `get_album_with_stats(album_uuid UUID)`
Returns comprehensive album information including photo counts and storage size.

```sql
SELECT * FROM get_album_with_stats('123e4567-e89b-12d3-a456-426614174000');
```

### `get_recent_albums(album_limit INTEGER)`
Returns latest published albums with photo counts.

```sql
SELECT * FROM get_recent_albums(10);
```

### `auto_set_album_cover(album_uuid UUID)`
Sets album cover to first photo if not already set. Returns TRUE if updated.

```sql
SELECT auto_set_album_cover('123e4567-e89b-12d3-a456-426614174000');
```

## Triggers

### Auto-Update Timestamps
- `update_photo_albums_updated_at`: Updates `updated_at` on album modifications
- `update_photos_updated_at`: Updates `updated_at` on photo modifications

### Auto-Set Cover Photo
- `auto_set_cover_on_first_photo`: Automatically sets album cover when first photo is inserted

## Row-Level Security (RLS) Policies

### Photo Albums

**Public Access:**
- `SELECT`: View published albums where `published = TRUE` and `publish_date <= NOW()`

**Authenticated Users:**
- `SELECT`: View all albums (including drafts)

**Admins:**
- `INSERT`: Create new albums
- `UPDATE`: Modify any album
- `DELETE`: Remove albums

**Creators:**
- `UPDATE`: Modify their own albums

### Photos

**Public Access:**
- `SELECT`: View photos only from published albums

**Authenticated Users:**
- `SELECT`: View all photos (including from unpublished albums)

**Admins:**
- `INSERT`: Upload new photos
- `UPDATE`: Modify any photo metadata
- `DELETE`: Remove photos

**Uploaders:**
- `UPDATE`: Modify their own photo metadata

## Storage Integration

### Supabase Storage Bucket
**Bucket Name:** `event-photos`

**Configuration:**
- Public access: Yes (for public photo viewing)
- Max file size: 10MB recommended
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**Storage Policies** (already defined in migration 003):
- Public read access
- Admin-only write/update/delete

### File Organization
Recommended storage path structure:
```
event-photos/
├── {album-slug}/
│   ├── {photo-uuid}-original.jpg
│   ├── {photo-uuid}-thumbnail.jpg
│   └── ...
```

## Implementation Workflows

### Album Creation Workflow

```typescript
// 1. Create album
const { data: album, error } = await supabase
  .from('photo_albums')
  .insert({
    title: 'Spring Festival 2025',
    slug: 'spring-festival-2025',
    description: 'Annual spring festival...',
    event_date: '2025-04-15',
    location: 'Main Courtyard',
    campus: 'all',
    published: false,
    created_by: userId
  })
  .select()
  .single();

// 2. Upload photos (see photo upload workflow)
// 3. Publish album
await supabase
  .from('photo_albums')
  .update({
    published: true,
    publish_date: new Date().toISOString()
  })
  .eq('id', album.id);
```

### Photo Upload Workflow

```typescript
// 1. Upload file to Supabase Storage
const file = event.target.files[0];
const fileExt = file.name.split('.').pop();
const photoId = crypto.randomUUID();
const storagePath = `${albumSlug}/${photoId}-original.${fileExt}`;

const { data: uploadData, error: uploadError } = await supabase.storage
  .from('event-photos')
  .upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false
  });

// 2. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('event-photos')
  .getPublicUrl(storagePath);

// 3. Extract image metadata (optional - use canvas or library)
const img = new Image();
img.onload = async () => {
  const width = img.width;
  const height = img.height;

  // 4. Insert photo metadata
  await supabase.from('photos').insert({
    album_id: albumId,
    storage_path: storagePath,
    storage_bucket: 'event-photos',
    url: publicUrl,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    width: width,
    height: height,
    sort_order: 0,
    uploaded_by: userId
  });
};
img.src = URL.createObjectURL(file);

// 5. Cover photo is automatically set by trigger!
```

### Gallery Display Workflow

```typescript
// 1. Fetch recent albums
const { data: albums } = await supabase
  .rpc('get_recent_albums', { album_limit: 12 });

// 2. Display album cards
albums.forEach(album => {
  // Show: title, cover_photo_url, photo_count, event_date
});

// 3. On album click, fetch photos
const { data: photos } = await supabase
  .from('photos')
  .select('*')
  .eq('album_id', albumId)
  .order('sort_order', { ascending: true });

// 4. Render masonry layout
photos.forEach(photo => {
  // Use thumbnail_url for grid
  // Use url for lightbox/full view
  // Calculate aspect ratio from width/height
});
```

### Campus Filtering

```typescript
// Filter albums by campus
const { data: albums } = await supabase
  .from('photo_albums')
  .select('*, photos(count)')
  .eq('campus', 'elementary')
  .eq('published', true)
  .lte('publish_date', new Date().toISOString())
  .order('event_date', { ascending: false });
```

## Frontend Components

### Recommended Component Structure

```
components/
├── gallery/
│   ├── AlbumGrid.tsx          # Display album cards
│   ├── AlbumCard.tsx          # Individual album card
│   ├── AlbumDetail.tsx        # Full album view
│   ├── PhotoMasonry.tsx       # Masonry photo layout
│   ├── PhotoLightbox.tsx      # Full-size photo viewer
│   ├── CampusFilter.tsx       # Campus selection
│   └── admin/
│       ├── AlbumForm.tsx      # Create/edit albums
│       ├── PhotoUpload.tsx    # Bulk photo upload
│       ├── PhotoGrid.tsx      # Admin photo management
│       └── PhotoEditor.tsx    # Edit photo metadata
```

## Masonry Layout Implementation

### CSS Grid Approach

```css
.photo-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px;
  gap: 16px;
}

.photo-item {
  grid-row-end: span var(--row-span);
}
```

```typescript
// Calculate row span based on aspect ratio
const rowSpan = Math.ceil((photo.height / photo.width) * 25);
element.style.setProperty('--row-span', rowSpan);
```

### Library Recommendations
- **React Masonry CSS**: Lightweight, CSS-based masonry
- **React Photo Gallery**: Feature-rich with lightbox integration
- **Yet Another React Lightbox**: Modern lightbox component

## Admin Features

### Recommended Admin Capabilities

1. **Album Management**
   - Create/edit/delete albums
   - Set cover photo
   - Schedule publishing
   - Reorder albums (sort_order)

2. **Photo Upload**
   - Drag-and-drop bulk upload
   - Progress indicators
   - Auto-extract EXIF data
   - Image preview before upload

3. **Photo Management**
   - Reorder photos (sort_order)
   - Mark as featured
   - Edit captions and alt text
   - Delete photos (with storage cleanup)

4. **Analytics Dashboard**
   - Total photos and storage used
   - Most viewed albums
   - Recent uploads
   - Storage by campus

## Performance Optimization

### Image Optimization

```typescript
// Generate thumbnail on upload
import sharp from 'sharp';

const thumbnail = await sharp(file)
  .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer();

// Upload thumbnail
const thumbnailPath = `${albumSlug}/${photoId}-thumbnail.webp`;
await supabase.storage
  .from('event-photos')
  .upload(thumbnailPath, thumbnail);
```

### Lazy Loading

```typescript
// Use Intersection Observer for lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target as HTMLImageElement;
      img.src = img.dataset.src!;
      observer.unobserve(img);
    }
  });
});

// Observe images
document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

### Pagination

```typescript
// Paginate albums
const PAGE_SIZE = 12;
const { data: albums, count } = await supabase
  .from('photo_albums')
  .select('*, photos(count)', { count: 'exact' })
  .eq('published', true)
  .order('event_date', { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

## Accessibility Considerations

1. **Alt Text**: Always populate `alt_text` field for screen readers
2. **Keyboard Navigation**: Ensure lightbox supports keyboard (Esc, Arrow keys)
3. **ARIA Labels**: Use proper ARIA attributes on interactive elements
4. **Focus Management**: Trap focus in lightbox, restore on close
5. **Contrast**: Ensure sufficient contrast for captions and overlays

## Security Best Practices

1. **File Validation**: Verify MIME types and file sizes on both client and server
2. **Sanitize Inputs**: Clean user-provided captions and descriptions
3. **Storage Limits**: Enforce max file size (10MB) and total storage quotas
4. **RLS Policies**: Never bypass RLS - always use service role key carefully
5. **Rate Limiting**: Implement upload rate limiting to prevent abuse

## Testing Checklist

- [ ] Album CRUD operations work correctly
- [ ] Photo upload successfully stores in Supabase Storage
- [ ] Photo metadata is extracted and saved
- [ ] Cover photo auto-sets on first photo upload
- [ ] RLS policies enforce correct access control
- [ ] Public users can view published albums only
- [ ] Admins can manage all albums and photos
- [ ] Campus filtering works correctly
- [ ] Masonry layout renders properly on all screen sizes
- [ ] Lightbox opens and navigates correctly
- [ ] Image lazy loading improves performance
- [ ] Alt text is properly set for accessibility
- [ ] Photo deletion removes from both DB and storage
- [ ] Schedule publishing works (future publish_date)

## Migration Checklist

- [x] Create migration file: `20251015100000_create_photo_gallery.sql`
- [ ] Apply migration to Supabase database
- [ ] Verify `event-photos` storage bucket exists
- [ ] Apply RLS policies (documented in migration)
- [ ] Generate TypeScript types from schema
- [ ] Create API client functions
- [ ] Build admin upload interface
- [ ] Build public gallery interface
- [ ] Implement image optimization
- [ ] Add analytics tracking
- [ ] Test all user flows
- [ ] Deploy to production

## Troubleshooting

### Issue: Cover photo not auto-setting
**Solution**: Check trigger is enabled and first photo has valid `url` field.

```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'auto_set_cover_on_first_photo';

-- Manually run function
SELECT auto_set_album_cover('album-uuid');
```

### Issue: Photos not visible to public
**Solution**: Verify album is published and RLS policies are applied.

```sql
-- Check album status
SELECT id, title, published, publish_date FROM photo_albums WHERE id = 'album-uuid';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('photo_albums', 'photos');
```

### Issue: Storage upload fails
**Solution**: Verify bucket exists, policies are correct, and user has admin role.

```sql
-- Check storage policies
SELECT * FROM storage.objects WHERE bucket_id = 'event-photos' LIMIT 1;

-- Verify user role
SELECT id, email, raw_user_meta_data->>'role' as role FROM auth.users WHERE id = 'user-uuid';
```

## API Endpoint Examples

### REST API Endpoints (Recommended)

```typescript
// GET /api/albums - List published albums
// GET /api/albums/:slug - Get album with photos
// GET /api/albums/:id/photos - List photos in album

// POST /api/admin/albums - Create album (admin only)
// PATCH /api/admin/albums/:id - Update album (admin only)
// DELETE /api/admin/albums/:id - Delete album (admin only)

// POST /api/admin/photos - Upload photo (admin only)
// PATCH /api/admin/photos/:id - Update photo metadata (admin only)
// DELETE /api/admin/photos/:id - Delete photo (admin only)
```

## Future Enhancements

1. **Photo Tagging**: Add tags/categories to photos for advanced filtering
2. **Social Sharing**: Generate shareable links for individual photos
3. **Download Options**: Allow downloading original photos or albums as ZIP
4. **Comments**: Enable commenting on albums (with moderation)
5. **Photo Contests**: Voting system for best photos
6. **Automated Optimization**: Auto-convert to WebP, generate multiple sizes
7. **EXIF Metadata**: Display camera info, location (if available)
8. **Duplicate Detection**: Prevent uploading duplicate photos
9. **Facial Recognition**: Auto-blur faces for privacy (optional)
10. **Integration**: Link albums to events in events table

## Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
- [Masonry Layout Patterns](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Masonry_Layout)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Created:** October 15, 2025
**Migration File:** `20251015100000_create_photo_gallery.sql`
**Status:** Ready for implementation
