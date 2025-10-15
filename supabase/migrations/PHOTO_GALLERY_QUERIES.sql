-- =====================================================
-- PHOTO GALLERY - COMMON QUERIES
-- Quick reference for developers
-- =====================================================

-- =====================================================
-- ALBUM QUERIES
-- =====================================================

-- Get all published albums with photo counts
SELECT
    pa.id,
    pa.title,
    pa.slug,
    pa.description,
    pa.event_date,
    pa.campus,
    pa.cover_photo_url,
    pa.publish_date,
    COUNT(p.id) AS photo_count
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.published = TRUE
  AND pa.publish_date <= NOW()
GROUP BY pa.id
ORDER BY pa.event_date DESC NULLS LAST;

-- Get album by slug (for public view)
SELECT
    pa.*,
    COUNT(p.id) AS photo_count,
    COALESCE(SUM(p.file_size), 0) AS total_size
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.slug = 'spring-festival-2025'
  AND pa.published = TRUE
  AND pa.publish_date <= NOW()
GROUP BY pa.id;

-- Get recent albums (using helper function)
SELECT * FROM get_recent_albums(10);

-- Filter albums by campus
SELECT
    pa.id,
    pa.title,
    pa.slug,
    pa.event_date,
    COUNT(p.id) AS photo_count
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.campus = 'elementary'
  AND pa.published = TRUE
  AND pa.publish_date <= NOW()
GROUP BY pa.id
ORDER BY pa.event_date DESC;

-- Search albums by title
SELECT
    pa.id,
    pa.title,
    pa.slug,
    pa.event_date,
    COUNT(p.id) AS photo_count
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.published = TRUE
  AND pa.publish_date <= NOW()
  AND pa.title ILIKE '%festival%'
GROUP BY pa.id
ORDER BY pa.event_date DESC;

-- Get draft albums (admin only)
SELECT
    pa.id,
    pa.title,
    pa.slug,
    pa.created_at,
    COUNT(p.id) AS photo_count
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.published = FALSE
GROUP BY pa.id
ORDER BY pa.created_at DESC;

-- Get albums by creator (admin view)
SELECT
    pa.id,
    pa.title,
    pa.slug,
    pa.published,
    pa.created_at,
    COUNT(p.id) AS photo_count
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.created_by = 'YOUR-USER-UUID'
GROUP BY pa.id
ORDER BY pa.created_at DESC;

-- Get featured albums (manually ordered)
SELECT
    pa.id,
    pa.title,
    pa.slug,
    pa.cover_photo_url,
    pa.sort_order,
    COUNT(p.id) AS photo_count
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.published = TRUE
  AND pa.publish_date <= NOW()
GROUP BY pa.id
ORDER BY pa.sort_order DESC, pa.created_at DESC
LIMIT 5;

-- =====================================================
-- PHOTO QUERIES
-- =====================================================

-- Get all photos for an album (ordered)
SELECT
    id,
    url,
    thumbnail_url,
    title,
    caption,
    alt_text,
    width,
    height,
    sort_order,
    featured
FROM photos
WHERE album_id = 'ALBUM-UUID'
ORDER BY sort_order ASC, created_at ASC;

-- Get featured photos only
SELECT
    id,
    url,
    thumbnail_url,
    title,
    caption,
    width,
    height
FROM photos
WHERE album_id = 'ALBUM-UUID'
  AND featured = TRUE
ORDER BY sort_order ASC;

-- Get first photo from album (for cover)
SELECT
    id,
    url,
    thumbnail_url
FROM photos
WHERE album_id = 'ALBUM-UUID'
ORDER BY sort_order ASC, created_at ASC
LIMIT 1;

-- Get photos by uploader (admin analytics)
SELECT
    p.id,
    p.file_name,
    p.file_size,
    p.uploaded_at,
    pa.title AS album_title
FROM photos p
JOIN photo_albums pa ON p.album_id = pa.id
WHERE p.uploaded_by = 'USER-UUID'
ORDER BY p.uploaded_at DESC;

-- Get large photos (optimization candidates)
SELECT
    p.id,
    p.file_name,
    p.file_size,
    p.width,
    p.height,
    pa.title AS album_title
FROM photos p
JOIN photo_albums pa ON p.album_id = pa.id
WHERE p.file_size > 5000000 -- Larger than 5MB
ORDER BY p.file_size DESC;

-- =====================================================
-- STATISTICS & ANALYTICS
-- =====================================================

-- Total albums and photos count
SELECT
    COUNT(DISTINCT pa.id) AS total_albums,
    COUNT(p.id) AS total_photos,
    COALESCE(SUM(p.file_size), 0) AS total_storage_bytes,
    pg_size_pretty(COALESCE(SUM(p.file_size), 0)::bigint) AS total_storage_readable
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.published = TRUE;

-- Album statistics (using helper function)
SELECT * FROM get_album_with_stats('ALBUM-UUID');

-- Photos per album statistics
SELECT
    pa.title,
    COUNT(p.id) AS photo_count,
    COALESCE(SUM(p.file_size), 0) AS total_size,
    pg_size_pretty(COALESCE(SUM(p.file_size), 0)::bigint) AS size_readable,
    AVG(p.file_size)::bigint AS avg_photo_size
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.published = TRUE
GROUP BY pa.id, pa.title
ORDER BY photo_count DESC;

-- Campus distribution
SELECT
    campus,
    COUNT(*) AS album_count,
    SUM(photo_count) AS total_photos
FROM (
    SELECT
        pa.campus,
        COUNT(p.id) AS photo_count
    FROM photo_albums pa
    LEFT JOIN photos p ON pa.id = p.album_id
    WHERE pa.published = TRUE
    GROUP BY pa.id, pa.campus
) AS album_stats
GROUP BY campus
ORDER BY album_count DESC;

-- Photos uploaded per month (last 12 months)
SELECT
    TO_CHAR(uploaded_at, 'YYYY-MM') AS month,
    COUNT(*) AS photos_uploaded,
    pg_size_pretty(SUM(file_size)::bigint) AS storage_used
FROM photos
WHERE uploaded_at >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month DESC;

-- Most active uploaders
SELECT
    u.email,
    COUNT(p.id) AS photos_uploaded,
    pg_size_pretty(SUM(p.file_size)::bigint) AS total_storage
FROM photos p
JOIN auth.users u ON p.uploaded_by = u.id
GROUP BY u.id, u.email
ORDER BY photos_uploaded DESC
LIMIT 10;

-- =====================================================
-- ADMIN MANAGEMENT QUERIES
-- =====================================================

-- Albums without cover photos
SELECT
    id,
    title,
    slug,
    cover_photo_url
FROM photo_albums
WHERE cover_photo_url IS NULL
  AND published = TRUE;

-- Albums with no photos
SELECT
    pa.id,
    pa.title,
    pa.slug,
    pa.created_at
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE p.id IS NULL
ORDER BY pa.created_at DESC;

-- Recently uploaded photos (last 7 days)
SELECT
    p.id,
    p.file_name,
    p.uploaded_at,
    pa.title AS album_title,
    u.email AS uploaded_by_email
FROM photos p
JOIN photo_albums pa ON p.album_id = pa.id
JOIN auth.users u ON p.uploaded_by = u.id
WHERE p.uploaded_at >= NOW() - INTERVAL '7 days'
ORDER BY p.uploaded_at DESC;

-- Scheduled albums (future publish dates)
SELECT
    id,
    title,
    slug,
    publish_date,
    published
FROM photo_albums
WHERE publish_date > NOW()
ORDER BY publish_date ASC;

-- Unpublished albums older than 30 days (cleanup candidates)
SELECT
    id,
    title,
    slug,
    created_at,
    published
FROM photo_albums
WHERE published = FALSE
  AND created_at < NOW() - INTERVAL '30 days'
ORDER BY created_at ASC;

-- =====================================================
-- UPDATE QUERIES (ADMIN OPERATIONS)
-- =====================================================

-- Publish an album
UPDATE photo_albums
SET
    published = TRUE,
    publish_date = NOW(),
    updated_at = NOW()
WHERE id = 'ALBUM-UUID';

-- Update album cover photo
UPDATE photo_albums
SET
    cover_photo_url = 'https://...',
    updated_at = NOW()
WHERE id = 'ALBUM-UUID';

-- Reorder photos in album
UPDATE photos
SET
    sort_order = 1,
    updated_at = NOW()
WHERE id = 'PHOTO-UUID-1';

UPDATE photos
SET
    sort_order = 2,
    updated_at = NOW()
WHERE id = 'PHOTO-UUID-2';

-- Mark photo as featured
UPDATE photos
SET
    featured = TRUE,
    updated_at = NOW()
WHERE id = 'PHOTO-UUID';

-- Update photo caption and alt text
UPDATE photos
SET
    caption = 'Students enjoying the spring festival',
    alt_text = 'Group of elementary students smiling at spring festival',
    updated_at = NOW()
WHERE id = 'PHOTO-UUID';

-- Bulk update sort_order (reset to creation order)
WITH ordered_photos AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS new_order
    FROM photos
    WHERE album_id = 'ALBUM-UUID'
)
UPDATE photos
SET
    sort_order = ordered_photos.new_order,
    updated_at = NOW()
FROM ordered_photos
WHERE photos.id = ordered_photos.id;

-- Auto-set cover photo for album
SELECT auto_set_album_cover('ALBUM-UUID');

-- =====================================================
-- DELETE QUERIES (ADMIN OPERATIONS)
-- =====================================================

-- Delete a photo (metadata only - storage cleanup done separately)
DELETE FROM photos WHERE id = 'PHOTO-UUID';

-- Delete an album and all its photos (CASCADE)
DELETE FROM photo_albums WHERE id = 'ALBUM-UUID';

-- Delete unpublished albums older than 90 days
DELETE FROM photo_albums
WHERE published = FALSE
  AND created_at < NOW() - INTERVAL '90 days';

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Find orphaned photos (album deleted but photos remain)
-- This should not happen due to CASCADE, but useful for verification
SELECT
    p.id,
    p.file_name,
    p.album_id,
    p.storage_path
FROM photos p
LEFT JOIN photo_albums pa ON p.album_id = pa.id
WHERE pa.id IS NULL;

-- Verify storage paths are unique
SELECT
    storage_path,
    COUNT(*) AS duplicate_count
FROM photos
GROUP BY storage_path
HAVING COUNT(*) > 1;

-- Find photos with missing dimensions
SELECT
    id,
    file_name,
    width,
    height,
    url
FROM photos
WHERE width IS NULL OR height IS NULL;

-- Verify all published albums have cover photos
SELECT
    pa.id,
    pa.title,
    pa.cover_photo_url,
    COUNT(p.id) AS photo_count
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.published = TRUE
  AND pa.cover_photo_url IS NULL
GROUP BY pa.id;

-- =====================================================
-- SEARCH & FILTER COMBINATIONS
-- =====================================================

-- Search albums with filters
SELECT
    pa.id,
    pa.title,
    pa.slug,
    pa.event_date,
    pa.campus,
    COUNT(p.id) AS photo_count
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.published = TRUE
  AND pa.publish_date <= NOW()
  AND (
      -- Campus filter (pass 'all' to show all campuses)
      'all' = 'all' OR pa.campus = 'elementary'
  )
  AND (
      -- Date range filter
      pa.event_date >= '2025-01-01' AND pa.event_date <= '2025-12-31'
  )
  AND (
      -- Search query
      pa.title ILIKE '%festival%' OR pa.description ILIKE '%festival%'
  )
GROUP BY pa.id
ORDER BY pa.event_date DESC
LIMIT 20 OFFSET 0; -- Pagination

-- =====================================================
-- HELPER FUNCTION USAGE
-- =====================================================

-- Generate slug from title
SELECT generate_album_slug('Spring Festival 2025!');

-- Get photo count for album
SELECT get_album_photo_count('ALBUM-UUID');

-- Get storage size for album
SELECT get_album_storage_size('ALBUM-UUID');
SELECT pg_size_pretty(get_album_storage_size('ALBUM-UUID')::bigint);

-- Get recent albums with stats
SELECT * FROM get_recent_albums(10);

-- Get album with full statistics
SELECT * FROM get_album_with_stats('ALBUM-UUID');

-- =====================================================
-- PERFORMANCE TESTING
-- =====================================================

-- Test query performance with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT
    pa.id,
    pa.title,
    COUNT(p.id) AS photo_count
FROM photo_albums pa
LEFT JOIN photos p ON pa.id = p.album_id
WHERE pa.published = TRUE
  AND pa.publish_date <= NOW()
GROUP BY pa.id
ORDER BY pa.event_date DESC
LIMIT 10;

-- Verify indexes are being used
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM photos
WHERE album_id = 'ALBUM-UUID'
ORDER BY sort_order ASC;

-- =====================================================
-- DATA VALIDATION
-- =====================================================

-- Check for invalid slugs
SELECT id, title, slug
FROM photo_albums
WHERE slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$';

-- Check for published albums without publish_date
SELECT id, title, published, publish_date
FROM photo_albums
WHERE published = TRUE AND publish_date IS NULL;

-- Check for negative file sizes
SELECT id, file_name, file_size
FROM photos
WHERE file_size <= 0;

-- Check for invalid dimensions
SELECT id, file_name, width, height
FROM photos
WHERE (width IS NOT NULL AND width <= 0)
   OR (height IS NOT NULL AND height <= 0);

-- =====================================================
-- NOTES
-- =====================================================
-- Replace placeholder UUIDs with actual values:
-- - 'ALBUM-UUID': Album ID from photo_albums.id
-- - 'PHOTO-UUID': Photo ID from photos.id
-- - 'USER-UUID': User ID from auth.users.id
-- - 'YOUR-USER-UUID': Replace with your admin user UUID
--
-- All queries respect RLS policies when executed via Supabase client.
-- Use service role key for admin operations that bypass RLS.
-- =====================================================
