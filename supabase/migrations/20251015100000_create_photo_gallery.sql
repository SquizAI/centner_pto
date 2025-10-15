-- =====================================================
-- CENTNER PTO DATABASE SCHEMA
-- Migration: Photo Gallery System
-- Created: October 15, 2025
-- Timestamp: 20251015100000
-- Description: Creates comprehensive photo gallery feature with album management,
--              photo metadata storage, Supabase Storage integration, and RLS policies
--              for public viewing and admin upload capabilities
-- =====================================================

-- =====================================================
-- DROP EXISTING TABLES
-- Remove basic photo tables from initial schema
-- =====================================================
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS photo_albums CASCADE;

-- =====================================================
-- PHOTO_ALBUMS TABLE
-- Stores photo album/event collections
-- =====================================================
CREATE TABLE photo_albums (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core Information
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,

    -- Event Association
    event_date DATE, -- Date of the event/activity

    -- Location & Campus
    location TEXT, -- Where the event took place
    campus TEXT NOT NULL DEFAULT 'all'
        CHECK (campus IN ('all', 'preschool', 'elementary', 'middle-high')),

    -- Media
    cover_photo_url TEXT, -- URL to cover/featured photo

    -- Publishing
    published BOOLEAN DEFAULT FALSE,
    publish_date TIMESTAMPTZ, -- When album goes live (can be scheduled)

    -- Display Options
    sort_order INTEGER DEFAULT 0, -- Manual ordering for featured albums

    -- Authorship
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT published_requires_publish_date CHECK (
        (published = FALSE) OR
        (published = TRUE AND publish_date IS NOT NULL)
    )
);

-- =====================================================
-- PHOTOS TABLE
-- Stores individual photos with metadata and storage references
-- =====================================================
CREATE TABLE photos (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Key
    album_id UUID NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,

    -- Storage Reference
    storage_path TEXT NOT NULL, -- Path in Supabase Storage bucket
    storage_bucket TEXT NOT NULL DEFAULT 'event-photos',

    -- Generated URLs (for convenience)
    url TEXT NOT NULL, -- Full URL to photo
    thumbnail_url TEXT, -- URL to thumbnail/optimized version

    -- Photo Metadata
    title TEXT,
    caption TEXT,
    alt_text TEXT, -- For accessibility

    -- Technical Metadata
    file_name TEXT NOT NULL,
    file_size BIGINT, -- Size in bytes
    mime_type TEXT, -- e.g., 'image/jpeg', 'image/png'
    width INTEGER, -- Image width in pixels
    height INTEGER, -- Image height in pixels

    -- Display Options
    sort_order INTEGER DEFAULT 0, -- Order within album
    featured BOOLEAN DEFAULT FALSE, -- Mark as featured in album

    -- Authorship
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Timestamps
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size > 0),
    CONSTRAINT valid_dimensions CHECK (
        (width IS NULL AND height IS NULL) OR
        (width > 0 AND height > 0)
    )
);

-- =====================================================
-- INDEXES
-- Optimized for common query patterns
-- =====================================================

-- ========== PHOTO_ALBUMS INDEXES ==========

-- Unique index on slug for URL routing
CREATE UNIQUE INDEX idx_photo_albums_slug ON photo_albums(slug);

-- Primary query: Published albums ordered by event date
CREATE INDEX idx_photo_albums_published_date
    ON photo_albums(published, event_date DESC NULLS LAST)
    WHERE published = TRUE AND publish_date <= NOW();

-- Filter by campus
CREATE INDEX idx_photo_albums_campus
    ON photo_albums(campus)
    WHERE published = TRUE;

-- Sort by manual sort_order (for featured albums)
CREATE INDEX idx_photo_albums_sort_order
    ON photo_albums(sort_order DESC, created_at DESC)
    WHERE published = TRUE;

-- Filter by published status (admin view)
CREATE INDEX idx_photo_albums_published
    ON photo_albums(published);

-- Admin management: View albums by creator
CREATE INDEX idx_photo_albums_created_by
    ON photo_albums(created_by);

-- Created timestamp for sorting in admin dashboard
CREATE INDEX idx_photo_albums_created_at
    ON photo_albums(created_at DESC);

-- Event date for chronological browsing
CREATE INDEX idx_photo_albums_event_date
    ON photo_albums(event_date DESC NULLS LAST);

-- ========== PHOTOS INDEXES ==========

-- Primary query: Get all photos for an album
CREATE INDEX idx_photos_album
    ON photos(album_id, sort_order ASC);

-- Featured photos in album
CREATE INDEX idx_photos_album_featured
    ON photos(album_id, featured, sort_order ASC)
    WHERE featured = TRUE;

-- Admin management: View photos by uploader
CREATE INDEX idx_photos_uploaded_by
    ON photos(uploaded_by);

-- Storage path for efficient lookup/cleanup
CREATE INDEX idx_photos_storage_path
    ON photos(storage_bucket, storage_path);

-- Upload date for chronological sorting
CREATE INDEX idx_photos_uploaded_at
    ON photos(uploaded_at DESC);

-- File type filtering (admin analytics)
CREATE INDEX idx_photos_mime_type
    ON photos(mime_type);

-- =====================================================
-- HELPER FUNCTIONS
-- Business logic functions for photo gallery management
-- =====================================================

-- Function: Generate URL-safe slug from album title
-- Usage: SELECT generate_album_slug('Spring Festival 2025');
-- Returns: 'spring-festival-2025'
CREATE OR REPLACE FUNCTION generate_album_slug(album_title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(album_title, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get photo count for an album
-- Returns the number of photos in an album
-- Usage: SELECT get_album_photo_count('album-uuid');
CREATE OR REPLACE FUNCTION get_album_photo_count(album_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM photos
        WHERE album_id = album_uuid
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get total storage size for an album
-- Returns total file size in bytes for all photos in an album
-- Usage: SELECT get_album_storage_size('album-uuid');
CREATE OR REPLACE FUNCTION get_album_storage_size(album_uuid UUID)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(file_size), 0)
        FROM photos
        WHERE album_id = album_uuid
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get album statistics with photo count
-- Returns comprehensive album information including photo counts
-- Usage: SELECT * FROM get_album_with_stats('album-uuid');
CREATE OR REPLACE FUNCTION get_album_with_stats(album_uuid UUID)
RETURNS TABLE(
    id UUID,
    title TEXT,
    slug TEXT,
    description TEXT,
    event_date DATE,
    location TEXT,
    campus TEXT,
    cover_photo_url TEXT,
    published BOOLEAN,
    publish_date TIMESTAMPTZ,
    photo_count BIGINT,
    total_size BIGINT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pa.id,
        pa.title,
        pa.slug,
        pa.description,
        pa.event_date,
        pa.location,
        pa.campus,
        pa.cover_photo_url,
        pa.published,
        pa.publish_date,
        COUNT(p.id) AS photo_count,
        COALESCE(SUM(p.file_size), 0) AS total_size,
        pa.created_at
    FROM photo_albums pa
    LEFT JOIN photos p ON pa.id = p.album_id
    WHERE pa.id = album_uuid
    GROUP BY pa.id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER;

-- Function: Get recent albums with photo counts
-- Returns latest published albums with metadata
-- Usage: SELECT * FROM get_recent_albums(10);
CREATE OR REPLACE FUNCTION get_recent_albums(album_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    title TEXT,
    slug TEXT,
    description TEXT,
    event_date DATE,
    campus TEXT,
    cover_photo_url TEXT,
    photo_count BIGINT,
    publish_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pa.id,
        pa.title,
        pa.slug,
        pa.description,
        pa.event_date,
        pa.campus,
        pa.cover_photo_url,
        COUNT(p.id) AS photo_count,
        pa.publish_date
    FROM photo_albums pa
    LEFT JOIN photos p ON pa.id = p.album_id
    WHERE pa.published = TRUE
    AND pa.publish_date <= NOW()
    GROUP BY pa.id
    ORDER BY pa.event_date DESC NULLS LAST
    LIMIT album_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER;

-- Function: Auto-set cover photo to first photo if not set
-- Sets album cover_photo_url to the first photo's URL if cover is null
-- Usage: SELECT auto_set_album_cover('album-uuid');
CREATE OR REPLACE FUNCTION auto_set_album_cover(album_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    first_photo_url TEXT;
    album_cover_url TEXT;
BEGIN
    -- Get current cover photo
    SELECT cover_photo_url INTO album_cover_url
    FROM photo_albums
    WHERE id = album_uuid;

    -- If cover already set, no action needed
    IF album_cover_url IS NOT NULL THEN
        RETURN FALSE;
    END IF;

    -- Get first photo URL (by sort_order)
    SELECT url INTO first_photo_url
    FROM photos
    WHERE album_id = album_uuid
    ORDER BY sort_order ASC, created_at ASC
    LIMIT 1;

    -- Update album if photo found
    IF first_photo_url IS NOT NULL THEN
        UPDATE photo_albums
        SET cover_photo_url = first_photo_url
        WHERE id = album_uuid;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- Automated actions for data integrity
-- =====================================================

-- Trigger: Auto-update updated_at timestamp on photo_albums
CREATE TRIGGER update_photo_albums_updated_at
    BEFORE UPDATE ON photo_albums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at timestamp on photos
CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger Function: Auto-set album cover when first photo is added
-- Automatically sets cover_photo_url when the first photo is inserted
CREATE OR REPLACE FUNCTION trigger_auto_set_album_cover()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run on INSERT
    IF TG_OP = 'INSERT' THEN
        PERFORM auto_set_album_cover(NEW.album_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to photos table
CREATE TRIGGER auto_set_cover_on_first_photo
    AFTER INSERT ON photos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_set_album_cover();

-- =====================================================
-- TABLE COMMENTS
-- Documentation for maintainability
-- =====================================================

COMMENT ON TABLE photo_albums IS 'Photo albums/collections for PTO events and activities';
COMMENT ON COLUMN photo_albums.id IS 'Unique identifier for the album';
COMMENT ON COLUMN photo_albums.title IS 'Display title of the album (e.g., "Spring Festival 2025")';
COMMENT ON COLUMN photo_albums.slug IS 'URL-friendly identifier (must be lowercase with hyphens only)';
COMMENT ON COLUMN photo_albums.description IS 'Optional description of the album/event';
COMMENT ON COLUMN photo_albums.event_date IS 'Date when the event/activity took place';
COMMENT ON COLUMN photo_albums.location IS 'Where the event took place';
COMMENT ON COLUMN photo_albums.campus IS 'Target campus: all, preschool, elementary, or middle-high';
COMMENT ON COLUMN photo_albums.cover_photo_url IS 'URL to cover/featured photo (auto-set to first photo if null)';
COMMENT ON COLUMN photo_albums.published IS 'Whether album is published (false = draft)';
COMMENT ON COLUMN photo_albums.publish_date IS 'When the album should go live (supports scheduling)';
COMMENT ON COLUMN photo_albums.sort_order IS 'Manual ordering for featured albums (higher = shown first)';
COMMENT ON COLUMN photo_albums.created_by IS 'Admin user who created this album';
COMMENT ON COLUMN photo_albums.created_at IS 'When the album record was created';
COMMENT ON COLUMN photo_albums.updated_at IS 'When the album was last modified (auto-updated)';

COMMENT ON TABLE photos IS 'Individual photos stored in Supabase Storage with metadata';
COMMENT ON COLUMN photos.id IS 'Unique identifier for the photo';
COMMENT ON COLUMN photos.album_id IS 'Reference to photo_albums table';
COMMENT ON COLUMN photos.storage_path IS 'Path to photo in Supabase Storage bucket';
COMMENT ON COLUMN photos.storage_bucket IS 'Supabase Storage bucket name (default: event-photos)';
COMMENT ON COLUMN photos.url IS 'Full public URL to access the photo';
COMMENT ON COLUMN photos.thumbnail_url IS 'URL to thumbnail/optimized version of photo';
COMMENT ON COLUMN photos.title IS 'Optional title for the photo';
COMMENT ON COLUMN photos.caption IS 'Optional caption/description';
COMMENT ON COLUMN photos.alt_text IS 'Alternative text for accessibility (screen readers)';
COMMENT ON COLUMN photos.file_name IS 'Original filename when uploaded';
COMMENT ON COLUMN photos.file_size IS 'File size in bytes';
COMMENT ON COLUMN photos.mime_type IS 'MIME type (e.g., image/jpeg, image/png, image/webp)';
COMMENT ON COLUMN photos.width IS 'Image width in pixels';
COMMENT ON COLUMN photos.height IS 'Image height in pixels';
COMMENT ON COLUMN photos.sort_order IS 'Order within album (lower = shown first)';
COMMENT ON COLUMN photos.featured IS 'Whether photo is featured/highlighted in album';
COMMENT ON COLUMN photos.uploaded_by IS 'Admin user who uploaded this photo';
COMMENT ON COLUMN photos.uploaded_at IS 'When the photo was uploaded';
COMMENT ON COLUMN photos.created_at IS 'When the photo record was created';
COMMENT ON COLUMN photos.updated_at IS 'When the photo metadata was last modified (auto-updated)';

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- NOTE: These policies are DOCUMENTED here for the supabase-integration agent.
-- They should be applied by the supabase-integration agent, not in this migration.
--
-- ========== PHOTO_ALBUMS RLS ==========
--
-- Enable RLS:
-- ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
--
-- POLICY 1: Public users can view published albums
-- Description: Anonymous and authenticated users can view published albums
--              that have reached their publish_date
-- SQL:
-- CREATE POLICY "Public users can view published albums"
--     ON photo_albums
--     FOR SELECT
--     USING (
--         published = TRUE
--         AND publish_date IS NOT NULL
--         AND publish_date <= NOW()
--     );
--
-- POLICY 2: Authenticated users can view all albums
-- Description: Logged-in users can see all albums (including unpublished drafts)
-- SQL:
-- CREATE POLICY "Authenticated users can view all albums"
--     ON photo_albums
--     FOR SELECT
--     USING (auth.uid() IS NOT NULL);
--
-- POLICY 3: Admins can create albums
-- Description: Only users with 'admin' or 'super_admin' role can create albums
-- SQL:
-- CREATE POLICY "Admins can create albums"
--     ON photo_albums
--     FOR INSERT
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- POLICY 4: Admins can update albums
-- Description: Admins can modify any album
-- SQL:
-- CREATE POLICY "Admins can update albums"
--     ON photo_albums
--     FOR UPDATE
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     )
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- POLICY 5: Creators can update their own albums
-- Description: User who created an album can modify it
-- SQL:
-- CREATE POLICY "Creators can update own albums"
--     ON photo_albums
--     FOR UPDATE
--     USING (auth.uid() = created_by)
--     WITH CHECK (auth.uid() = created_by);
--
-- POLICY 6: Admins can delete albums
-- Description: Only admins can delete albums
-- SQL:
-- CREATE POLICY "Admins can delete albums"
--     ON photo_albums
--     FOR DELETE
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- ========== PHOTOS RLS ==========
--
-- Enable RLS:
-- ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
--
-- POLICY 1: Public users can view photos from published albums
-- Description: Anonymous and authenticated users can view photos
--              only if the parent album is published
-- SQL:
-- CREATE POLICY "Public users can view photos from published albums"
--     ON photos
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM photo_albums
--             WHERE photo_albums.id = photos.album_id
--             AND photo_albums.published = TRUE
--             AND photo_albums.publish_date IS NOT NULL
--             AND photo_albums.publish_date <= NOW()
--         )
--     );
--
-- POLICY 2: Authenticated users can view all photos
-- Description: Logged-in users can see all photos (including from unpublished albums)
-- SQL:
-- CREATE POLICY "Authenticated users can view all photos"
--     ON photos
--     FOR SELECT
--     USING (auth.uid() IS NOT NULL);
--
-- POLICY 3: Admins can upload photos
-- Description: Only users with 'admin' or 'super_admin' role can upload photos
-- SQL:
-- CREATE POLICY "Admins can upload photos"
--     ON photos
--     FOR INSERT
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- POLICY 4: Admins can update photos
-- Description: Admins can modify any photo metadata
-- SQL:
-- CREATE POLICY "Admins can update photos"
--     ON photos
--     FOR UPDATE
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     )
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- POLICY 5: Uploaders can update their own photos
-- Description: User who uploaded a photo can modify its metadata
-- SQL:
-- CREATE POLICY "Uploaders can update own photos"
--     ON photos
--     FOR UPDATE
--     USING (auth.uid() = uploaded_by)
--     WITH CHECK (auth.uid() = uploaded_by);
--
-- POLICY 6: Admins can delete photos
-- Description: Only admins can delete photos
-- SQL:
-- CREATE POLICY "Admins can delete photos"
--     ON photos
--     FOR DELETE
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- ========== STORAGE BUCKET POLICIES ==========
--
-- NOTE: Storage bucket policies should be added to migration 003_storage_buckets.sql
--       or applied separately via Supabase Dashboard. The 'event-photos' bucket
--       should already have appropriate policies for public read and admin write.
--
-- Expected Storage Bucket: event-photos
-- - Public: true (allows public read access)
-- - File size limit: 10MB recommended
-- - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif
--
-- Storage policies are already defined in 003_storage_buckets.sql for event-photos bucket.
-- No additional storage policies needed for this migration.

-- =====================================================
-- SAMPLE DATA (for testing/development)
-- =====================================================
-- Uncomment to insert sample photo albums for testing
--
-- NOTE: Replace 'YOUR-ADMIN-USER-UUID' with actual admin user ID
--
-- INSERT INTO photo_albums (
--     title,
--     slug,
--     description,
--     event_date,
--     location,
--     campus,
--     published,
--     publish_date,
--     created_by
-- ) VALUES
-- (
--     'Spring Festival 2025',
--     'spring-festival-2025',
--     'Annual spring festival celebrating our community with games, food, and fun activities for all ages.',
--     '2025-04-15',
--     'Main Courtyard',
--     'all',
--     TRUE,
--     NOW(),
--     'YOUR-ADMIN-USER-UUID'
-- ),
-- (
--     'Science Fair - Elementary',
--     'science-fair-elementary-2025',
--     'Elementary students showcase their amazing science projects and experiments.',
--     '2025-03-20',
--     'Elementary Building - Gymnasium',
--     'elementary',
--     TRUE,
--     NOW() - INTERVAL '7 days',
--     'YOUR-ADMIN-USER-UUID'
-- ),
-- (
--     'Field Day 2025',
--     'field-day-2025',
--     'Students compete in various athletic events and team-building activities.',
--     '2025-05-10',
--     'Athletic Field',
--     'all',
--     TRUE,
--     NOW(),
--     'YOUR-ADMIN-USER-UUID'
-- ),
-- (
--     'Art Exhibition - Middle School',
--     'art-exhibition-middle-school-2025',
--     'Middle school students display their creative artwork from throughout the year.',
--     '2025-06-01',
--     'Art Gallery',
--     'middle-high',
--     FALSE,
--     NULL,
--     'YOUR-ADMIN-USER-UUID'
-- );

-- =====================================================
-- EXPECTED TYPESCRIPT TYPES
-- =====================================================
-- For supabase-integration agent to generate types
--
-- export interface PhotoAlbum {
--   id: string; // UUID
--   title: string;
--   slug: string;
--   description: string | null;
--   event_date: string | null; // ISO 8601 date string
--   location: string | null;
--   campus: 'all' | 'preschool' | 'elementary' | 'middle-high';
--   cover_photo_url: string | null;
--   published: boolean;
--   publish_date: string | null; // ISO 8601 timestamp
--   sort_order: number;
--   created_by: string; // UUID
--   created_at: string; // ISO 8601 timestamp
--   updated_at: string; // ISO 8601 timestamp
-- }
--
-- export interface Photo {
--   id: string; // UUID
--   album_id: string; // UUID
--   storage_path: string;
--   storage_bucket: string;
--   url: string;
--   thumbnail_url: string | null;
--   title: string | null;
--   caption: string | null;
--   alt_text: string | null;
--   file_name: string;
--   file_size: number | null;
--   mime_type: string | null;
--   width: number | null;
--   height: number | null;
--   sort_order: number;
--   featured: boolean;
--   uploaded_by: string; // UUID
--   uploaded_at: string; // ISO 8601 timestamp
--   created_at: string; // ISO 8601 timestamp
--   updated_at: string; // ISO 8601 timestamp
-- }
--
-- export interface AlbumWithStats {
--   id: string;
--   title: string;
--   slug: string;
--   description: string | null;
--   event_date: string | null;
--   location: string | null;
--   campus: 'all' | 'preschool' | 'elementary' | 'middle-high';
--   cover_photo_url: string | null;
--   published: boolean;
--   publish_date: string | null;
--   photo_count: number;
--   total_size: number; // bytes
--   created_at: string;
-- }

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================
--
-- Query published albums with photo counts:
-- SELECT * FROM get_recent_albums(10);
--
-- Get album statistics:
-- SELECT * FROM get_album_with_stats('album-uuid');
--
-- Generate slug from title:
-- SELECT generate_album_slug('Spring Festival 2025!');
--
-- Get photos for an album (ordered):
-- SELECT * FROM photos WHERE album_id = 'album-uuid' ORDER BY sort_order ASC;
--
-- Get featured photos only:
-- SELECT * FROM photos WHERE album_id = 'album-uuid' AND featured = TRUE ORDER BY sort_order ASC;
--
-- Count photos in album:
-- SELECT get_album_photo_count('album-uuid');
--
-- Get total storage used by album:
-- SELECT get_album_storage_size('album-uuid');
--
-- Filter albums by campus:
-- SELECT * FROM photo_albums WHERE campus = 'elementary' AND published = TRUE ORDER BY event_date DESC;

-- =====================================================
-- INTEGRATION NOTES
-- =====================================================
--
-- STORAGE BUCKET CONFIGURATION:
-- - Bucket name: 'event-photos' (already configured in migration 003)
-- - Public access: Yes (for public photo viewing)
-- - Max file size: 10MB recommended
-- - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
--
-- UPLOAD WORKFLOW:
-- 1. Admin uploads photo file to Supabase Storage (event-photos bucket)
-- 2. Get returned storage path and public URL
-- 3. Insert photo metadata into photos table with storage_path and url
-- 4. Optionally generate thumbnail and store thumbnail_url
-- 5. Album cover_photo_url is automatically set to first photo if not specified
--
-- DISPLAY WORKFLOW:
-- 1. Query published albums: SELECT * FROM get_recent_albums(10)
-- 2. Display album cards with cover_photo_url and photo_count
-- 3. On album view, query photos: SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order
-- 4. Render photos in masonry/grid layout
-- 5. Use thumbnail_url for listing, url for full-size view/lightbox
--
-- MASONRY LAYOUT TIPS:
-- - Use width and height fields for aspect ratio calculations
-- - Load thumbnails first for faster rendering
-- - Lazy load full-size images on demand
-- - Consider implementing image optimization/transformation via Supabase Storage
--
-- ADMIN FEATURES:
-- - Bulk photo upload with drag-and-drop
-- - Auto-extract EXIF data (width, height, file_size)
-- - Reorder photos within album (update sort_order)
-- - Set featured photo
-- - Edit captions and alt text for accessibility
-- - Schedule album publishing with publish_date

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next Steps:
-- 1. Review and apply RLS policies (via supabase-integration agent)
-- 2. Verify event-photos storage bucket exists and has correct policies
-- 3. Generate TypeScript types from schema
-- 4. Create API endpoints for album/photo CRUD operations
-- 5. Build admin interface for album management and photo upload
-- 6. Build public gallery interface with masonry layout
-- 7. Implement image upload with metadata extraction
-- 8. Add image optimization/thumbnail generation
-- =====================================================
