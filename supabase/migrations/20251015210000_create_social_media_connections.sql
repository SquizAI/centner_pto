-- =====================================================
-- CENTNER PTO DATABASE SCHEMA
-- Migration: Social Media Integration
-- Created: October 15, 2025
-- Timestamp: 20251015210000
-- Description: Creates social media connections and import tracking
--              for Instagram and Facebook photo imports
-- =====================================================

-- =====================================================
-- SOCIAL_MEDIA_CONNECTIONS TABLE
-- Stores OAuth connections to social media platforms
-- =====================================================
CREATE TABLE social_media_connections (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User Association
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Platform Information
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook')),
    account_id TEXT NOT NULL, -- Platform-specific account ID
    account_name TEXT, -- Display name or username
    account_username TEXT, -- Handle/username if available

    -- OAuth Tokens (encrypted at application layer)
    access_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ, -- When access token expires
    refresh_token TEXT, -- For token refresh (if supported)

    -- Connection Status
    is_active BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ, -- Last time posts were fetched
    last_error TEXT, -- Last error message if sync failed

    -- Additional Metadata
    metadata JSONB DEFAULT '{}', -- Platform-specific data (page ID, permissions, etc.)

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_platform_account UNIQUE (platform, account_id, user_id)
);

-- =====================================================
-- SOCIAL_MEDIA_IMPORTS TABLE
-- Tracks which posts have been imported to prevent duplicates
-- =====================================================
CREATE TABLE social_media_imports (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Keys
    connection_id UUID NOT NULL REFERENCES social_media_connections(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES photo_albums(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,

    -- Post Information
    post_id TEXT NOT NULL, -- Platform-specific post/media ID
    post_url TEXT, -- Link back to original post
    post_date TIMESTAMPTZ, -- When post was published on platform

    -- Import Metadata
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    imported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Additional Data
    metadata JSONB DEFAULT '{}', -- Original post data (caption, likes, etc.)

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_post_import UNIQUE (connection_id, post_id)
);

-- =====================================================
-- INDEXES
-- Optimized for common query patterns
-- =====================================================

-- ========== SOCIAL_MEDIA_CONNECTIONS INDEXES ==========

-- Query active connections by user
CREATE INDEX idx_connections_user_active
    ON social_media_connections(user_id, is_active)
    WHERE is_active = TRUE;

-- Query by platform
CREATE INDEX idx_connections_platform
    ON social_media_connections(platform, user_id);

-- Query by token expiration (for refresh jobs)
CREATE INDEX idx_connections_token_expiry
    ON social_media_connections(token_expires_at)
    WHERE is_active = TRUE AND token_expires_at IS NOT NULL;

-- Query by last sync time (for scheduled syncs)
CREATE INDEX idx_connections_last_sync
    ON social_media_connections(last_sync_at DESC NULLS LAST)
    WHERE is_active = TRUE;

-- ========== SOCIAL_MEDIA_IMPORTS INDEXES ==========

-- Query imports by connection
CREATE INDEX idx_imports_connection
    ON social_media_imports(connection_id, imported_at DESC);

-- Query imports by album
CREATE INDEX idx_imports_album
    ON social_media_imports(album_id, imported_at DESC);

-- Query imports by photo
CREATE INDEX idx_imports_photo
    ON social_media_imports(photo_id);

-- Query by post_id for duplicate detection
CREATE INDEX idx_imports_post_id
    ON social_media_imports(post_id);

-- Query imports by importer
CREATE INDEX idx_imports_user
    ON social_media_imports(imported_by);

-- Query imports by date
CREATE INDEX idx_imports_date
    ON social_media_imports(imported_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- Business logic functions for social media management
-- =====================================================

-- Function: Check if a post has already been imported
-- Returns TRUE if post_id exists for the given connection
-- Usage: SELECT is_post_imported('connection-uuid', 'instagram-post-id');
CREATE OR REPLACE FUNCTION is_post_imported(
    p_connection_id UUID,
    p_post_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM social_media_imports
        WHERE connection_id = p_connection_id
        AND post_id = p_post_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get connection statistics
-- Returns stats about imports for a connection
-- Usage: SELECT * FROM get_connection_stats('connection-uuid');
CREATE OR REPLACE FUNCTION get_connection_stats(p_connection_id UUID)
RETURNS TABLE(
    connection_id UUID,
    platform TEXT,
    account_name TEXT,
    total_imports BIGINT,
    last_import_date TIMESTAMPTZ,
    total_photos_imported BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS connection_id,
        c.platform,
        c.account_name,
        COUNT(i.id) AS total_imports,
        MAX(i.imported_at) AS last_import_date,
        COUNT(DISTINCT i.photo_id) AS total_photos_imported
    FROM social_media_connections c
    LEFT JOIN social_media_imports i ON c.id = i.connection_id
    WHERE c.id = p_connection_id
    GROUP BY c.id, c.platform, c.account_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER;

-- Function: Get recent imports for a connection
-- Returns recent import history
-- Usage: SELECT * FROM get_recent_imports('connection-uuid', 10);
CREATE OR REPLACE FUNCTION get_recent_imports(
    p_connection_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    import_id UUID,
    post_id TEXT,
    post_url TEXT,
    album_title TEXT,
    photo_url TEXT,
    imported_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id AS import_id,
        i.post_id,
        i.post_url,
        pa.title AS album_title,
        p.url AS photo_url,
        i.imported_at
    FROM social_media_imports i
    INNER JOIN photo_albums pa ON i.album_id = pa.id
    INNER JOIN photos p ON i.photo_id = p.id
    WHERE i.connection_id = p_connection_id
    ORDER BY i.imported_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER;

-- Function: Clean up expired connections
-- Deactivates connections with expired tokens
-- Usage: SELECT cleanup_expired_connections();
CREATE OR REPLACE FUNCTION cleanup_expired_connections()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE social_media_connections
    SET is_active = FALSE,
        last_error = 'Token expired'
    WHERE is_active = TRUE
    AND token_expires_at IS NOT NULL
    AND token_expires_at < NOW();

    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- Automated actions for data integrity
-- =====================================================

-- Trigger: Auto-update updated_at timestamp on social_media_connections
CREATE TRIGGER update_social_media_connections_updated_at
    BEFORE UPDATE ON social_media_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE COMMENTS
-- Documentation for maintainability
-- =====================================================

COMMENT ON TABLE social_media_connections IS 'OAuth connections to social media platforms (Instagram, Facebook)';
COMMENT ON COLUMN social_media_connections.id IS 'Unique identifier for the connection';
COMMENT ON COLUMN social_media_connections.user_id IS 'Admin user who connected this account';
COMMENT ON COLUMN social_media_connections.platform IS 'Social media platform: instagram or facebook';
COMMENT ON COLUMN social_media_connections.account_id IS 'Platform-specific account identifier';
COMMENT ON COLUMN social_media_connections.account_name IS 'Display name of the account';
COMMENT ON COLUMN social_media_connections.access_token IS 'OAuth access token (encrypted at app layer)';
COMMENT ON COLUMN social_media_connections.token_expires_at IS 'When the access token expires';
COMMENT ON COLUMN social_media_connections.refresh_token IS 'OAuth refresh token for renewing access';
COMMENT ON COLUMN social_media_connections.is_active IS 'Whether the connection is active';
COMMENT ON COLUMN social_media_connections.connected_at IS 'When the account was initially connected';
COMMENT ON COLUMN social_media_connections.last_sync_at IS 'Last time posts were fetched from this account';
COMMENT ON COLUMN social_media_connections.last_error IS 'Last error message if sync failed';
COMMENT ON COLUMN social_media_connections.metadata IS 'Platform-specific metadata (JSON)';

COMMENT ON TABLE social_media_imports IS 'Tracking table for imported social media posts';
COMMENT ON COLUMN social_media_imports.id IS 'Unique identifier for the import record';
COMMENT ON COLUMN social_media_imports.connection_id IS 'Reference to social_media_connections';
COMMENT ON COLUMN social_media_imports.album_id IS 'Reference to photo_albums where imported';
COMMENT ON COLUMN social_media_imports.photo_id IS 'Reference to photos created from import';
COMMENT ON COLUMN social_media_imports.post_id IS 'Platform-specific post/media ID';
COMMENT ON COLUMN social_media_imports.post_url IS 'URL to original post on social media';
COMMENT ON COLUMN social_media_imports.post_date IS 'When post was published on platform';
COMMENT ON COLUMN social_media_imports.imported_at IS 'When the post was imported into gallery';
COMMENT ON COLUMN social_media_imports.imported_by IS 'Admin user who performed the import';
COMMENT ON COLUMN social_media_imports.metadata IS 'Original post data and metadata (JSON)';

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE social_media_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_imports ENABLE ROW LEVEL SECURITY;

-- ========== SOCIAL_MEDIA_CONNECTIONS RLS ==========

-- POLICY: Only admins can view connections
CREATE POLICY "Admins can view all connections"
    ON social_media_connections
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- POLICY: Only admins can create connections
CREATE POLICY "Admins can create connections"
    ON social_media_connections
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
        AND user_id = auth.uid()
    );

-- POLICY: Only admins can update connections
CREATE POLICY "Admins can update connections"
    ON social_media_connections
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- POLICY: Only admins can delete connections
CREATE POLICY "Admins can delete connections"
    ON social_media_connections
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- ========== SOCIAL_MEDIA_IMPORTS RLS ==========

-- POLICY: Only admins can view imports
CREATE POLICY "Admins can view all imports"
    ON social_media_imports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- POLICY: Only admins can create import records
CREATE POLICY "Admins can create imports"
    ON social_media_imports
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
        AND imported_by = auth.uid()
    );

-- POLICY: Only admins can delete import records
CREATE POLICY "Admins can delete imports"
    ON social_media_imports
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================
--
-- Check if post already imported:
-- SELECT is_post_imported('connection-uuid', 'instagram_123456');
--
-- Get connection statistics:
-- SELECT * FROM get_connection_stats('connection-uuid');
--
-- Get recent imports:
-- SELECT * FROM get_recent_imports('connection-uuid', 20);
--
-- Clean up expired connections:
-- SELECT cleanup_expired_connections();
--
-- Get active connections for a user:
-- SELECT * FROM social_media_connections
-- WHERE user_id = 'user-uuid' AND is_active = TRUE
-- ORDER BY connected_at DESC;
--
-- Get all imports for an album:
-- SELECT * FROM social_media_imports
-- WHERE album_id = 'album-uuid'
-- ORDER BY imported_at DESC;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
