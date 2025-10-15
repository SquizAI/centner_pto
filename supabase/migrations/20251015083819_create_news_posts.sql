-- =====================================================
-- CENTNER PTO DATABASE SCHEMA
-- Migration: Enhanced News Posts Table
-- Created: October 15, 2025
-- Description: Creates comprehensive news/blog feature with RLS policies
-- =====================================================

-- Drop existing news_posts table if it exists (from initial schema)
-- This will cascade to any dependent objects
DROP TABLE IF EXISTS news_posts CASCADE;

-- =====================================================
-- NEWS_POSTS TABLE
-- Stores blog posts and announcements for PTO
-- =====================================================
CREATE TABLE news_posts (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content Fields
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL, -- Rich text content (HTML/Markdown)
    excerpt TEXT, -- Short summary for cards (recommended ~150-200 chars)

    -- Media
    featured_image_url TEXT,

    -- Authorship
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Publishing
    publish_date TIMESTAMPTZ, -- When post goes live (can be scheduled)
    published BOOLEAN DEFAULT FALSE,

    -- Campus Targeting
    campus TEXT NOT NULL DEFAULT 'all'
        CHECK (campus IN ('all', 'preschool', 'elementary', 'middle-high')),

    -- Categorization
    tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- For filtering and search

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT published_requires_publish_date CHECK (
        (published = FALSE) OR
        (published = TRUE AND publish_date IS NOT NULL)
    )
);

-- =====================================================
-- INDEXES
-- Optimized for common query patterns
-- =====================================================

-- Unique index on slug for URL routing
CREATE UNIQUE INDEX idx_news_posts_slug ON news_posts(slug);

-- Composite index for published posts listing (most common query)
-- Allows efficient filtering by published status and ordering by date
CREATE INDEX idx_news_posts_published_date ON news_posts(published, publish_date DESC)
    WHERE published = TRUE AND publish_date <= NOW();

-- Index on publish_date for chronological ordering
CREATE INDEX idx_news_posts_publish_date ON news_posts(publish_date DESC)
    WHERE publish_date IS NOT NULL;

-- Index on campus for filtering by school
CREATE INDEX idx_news_posts_campus ON news_posts(campus);

-- Index on published status for draft/published filtering
CREATE INDEX idx_news_posts_published ON news_posts(published);

-- Index on author_id for author-specific queries
CREATE INDEX idx_news_posts_author ON news_posts(author_id);

-- GIN index on tags array for tag-based filtering and search
CREATE INDEX idx_news_posts_tags ON news_posts USING GIN(tags);

-- Index for created_at (useful for admin dashboard sorting)
CREATE INDEX idx_news_posts_created_at ON news_posts(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp on row modification
-- (Assumes update_updated_at_column() function exists from initial migration)
CREATE TRIGGER update_news_posts_updated_at
    BEFORE UPDATE ON news_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- NOTE: These policies are DOCUMENTED here but should be applied by
-- the supabase-integration agent. Do not uncomment until ready.
--
-- Enable RLS on news_posts table:
-- ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
--
-- POLICY 1: Public Read Access
-- Description: Anonymous and authenticated users can view published posts
--              that have reached their publish_date
-- SQL:
-- CREATE POLICY "Public users can view published posts"
--     ON news_posts
--     FOR SELECT
--     USING (
--         published = TRUE
--         AND publish_date IS NOT NULL
--         AND publish_date <= NOW()
--     );
--
-- POLICY 2: Admin Full Access
-- Description: Users with 'admin' or 'super_admin' role can perform all operations
-- NOTE: Requires joining with profiles table to check role
-- SQL:
-- CREATE POLICY "Admins can manage all posts"
--     ON news_posts
--     FOR ALL
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
-- POLICY 3: Author Edit Own Drafts
-- Description: Authors can update their own draft posts (not yet published)
-- SQL:
-- CREATE POLICY "Authors can edit own drafts"
--     ON news_posts
--     FOR UPDATE
--     USING (
--         auth.uid() = author_id
--         AND published = FALSE
--     )
--     WITH CHECK (
--         auth.uid() = author_id
--         AND published = FALSE
--     );
--
-- POLICY 4: Admin Insert
-- Description: Only admins can create new posts
-- SQL:
-- CREATE POLICY "Admins can create posts"
--     ON news_posts
--     FOR INSERT
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- POLICY 5: Admin Delete
-- Description: Only admins can delete posts
-- SQL:
-- CREATE POLICY "Admins can delete posts"
--     ON news_posts
--     FOR DELETE
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- =====================================================
-- HELPER FUNCTIONS (Optional)
-- =====================================================

-- Function to generate URL-safe slug from title
-- Usage: SELECT generate_slug('My Post Title!');
-- Returns: 'my-post-title'
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get published posts count by campus
-- Useful for analytics
CREATE OR REPLACE FUNCTION get_published_posts_count(campus_filter TEXT DEFAULT 'all')
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM news_posts
        WHERE published = TRUE
        AND publish_date <= NOW()
        AND (campus_filter = 'all' OR campus = campus_filter)
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- COMMENTS
-- Document table and columns for maintainability
-- =====================================================

COMMENT ON TABLE news_posts IS 'Blog posts and announcements created by PTO admins';
COMMENT ON COLUMN news_posts.id IS 'Unique identifier for the post';
COMMENT ON COLUMN news_posts.title IS 'Display title of the post';
COMMENT ON COLUMN news_posts.slug IS 'URL-friendly identifier (must be lowercase with hyphens only)';
COMMENT ON COLUMN news_posts.content IS 'Full post content (supports HTML/Markdown)';
COMMENT ON COLUMN news_posts.excerpt IS 'Short summary shown in post cards (recommended 150-200 characters)';
COMMENT ON COLUMN news_posts.featured_image_url IS 'URL to featured/hero image';
COMMENT ON COLUMN news_posts.author_id IS 'Reference to auth.users - who created this post';
COMMENT ON COLUMN news_posts.publish_date IS 'When the post should go live (supports scheduling)';
COMMENT ON COLUMN news_posts.published IS 'Whether post is published (false = draft)';
COMMENT ON COLUMN news_posts.campus IS 'Target campus: all, preschool, elementary, or middle-high';
COMMENT ON COLUMN news_posts.tags IS 'Array of tags for categorization and filtering';
COMMENT ON COLUMN news_posts.created_at IS 'When the post record was created';
COMMENT ON COLUMN news_posts.updated_at IS 'When the post was last modified (auto-updated)';

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample posts for development/testing
--
-- INSERT INTO news_posts (
--     title,
--     slug,
--     content,
--     excerpt,
--     author_id,
--     publish_date,
--     published,
--     campus,
--     tags
-- ) VALUES
-- (
--     'Welcome to the New PTO Website',
--     'welcome-to-new-pto-website',
--     '<p>We are excited to announce the launch of our new PTO website!</p>',
--     'Introducing our new PTO website with enhanced features and easier navigation.',
--     (SELECT id FROM auth.users LIMIT 1), -- Replace with actual admin user ID
--     NOW(),
--     TRUE,
--     'all',
--     ARRAY['announcement', 'website']
-- ),
-- (
--     'Spring Fundraiser Event Recap',
--     'spring-fundraiser-recap',
--     '<p>Thank you to everyone who participated in our spring fundraiser!</p>',
--     'Highlights and photos from our successful spring fundraiser event.',
--     (SELECT id FROM auth.users LIMIT 1),
--     NOW() - INTERVAL '7 days',
--     TRUE,
--     'all',
--     ARRAY['fundraiser', 'event-recap']
-- );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next Steps:
-- 1. Apply RLS policies (via supabase-integration agent)
-- 2. Generate TypeScript types
-- 3. Create API endpoints for CRUD operations
-- 4. Build admin interface for post management
-- =====================================================
