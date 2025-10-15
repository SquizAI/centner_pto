-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Migration 002: RLS Policies
-- Created: October 14, 2025
-- =====================================================

-- =====================================================
-- PROFILES TABLE RLS
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- EVENTS TABLE RLS
-- =====================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view published events
CREATE POLICY "Anyone can view published events"
    ON events FOR SELECT
    USING (status = 'published');

-- Admins can create events
CREATE POLICY "Admins can create events"
    ON events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can update events
CREATE POLICY "Admins can update events"
    ON events FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can delete events
CREATE POLICY "Admins can delete events"
    ON events FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- EVENT_RSVPS TABLE RLS
-- =====================================================

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Users can view their own RSVPs
CREATE POLICY "Users can view own RSVPs"
    ON event_rsvps FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all RSVPs
CREATE POLICY "Admins can view all RSVPs"
    ON event_rsvps FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Users can create their own RSVPs
CREATE POLICY "Users can create own RSVPs"
    ON event_rsvps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own RSVPs
CREATE POLICY "Users can update own RSVPs"
    ON event_rsvps FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own RSVPs
CREATE POLICY "Users can delete own RSVPs"
    ON event_rsvps FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- DONATIONS TABLE RLS
-- =====================================================

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Users can view their own donations (including anonymous donations)
CREATE POLICY "Users can view own donations"
    ON donations FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all donations
CREATE POLICY "Admins can view all donations"
    ON donations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Service role can create donations (for webhook processing)
CREATE POLICY "Service role can create donations"
    ON donations FOR INSERT
    WITH CHECK (true);

-- Service role can update donations (for webhook processing)
CREATE POLICY "Service role can update donations"
    ON donations FOR UPDATE
    USING (true);

-- =====================================================
-- PHOTO_ALBUMS TABLE RLS
-- =====================================================

ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

-- Anyone can view published albums
CREATE POLICY "Anyone can view published albums"
    ON photo_albums FOR SELECT
    USING (status = 'published');

-- Admins can manage albums
CREATE POLICY "Admins can create albums"
    ON photo_albums FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update albums"
    ON photo_albums FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can delete albums"
    ON photo_albums FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- PHOTOS TABLE RLS
-- =====================================================

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Anyone can view photos in published albums
CREATE POLICY "Anyone can view photos in published albums"
    ON photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM photo_albums
            WHERE id = photos.album_id AND status = 'published'
        )
    );

-- Admins can manage photos
CREATE POLICY "Admins can create photos"
    ON photos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update photos"
    ON photos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can delete photos"
    ON photos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- NEWS_POSTS TABLE RLS
-- =====================================================

ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts"
    ON news_posts FOR SELECT
    USING (status = 'published');

-- Admins can view all posts
CREATE POLICY "Admins can view all posts"
    ON news_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage posts
CREATE POLICY "Admins can create posts"
    ON news_posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update posts"
    ON news_posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can delete posts"
    ON news_posts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- VOLUNTEER_OPPORTUNITIES TABLE RLS
-- =====================================================

ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;

-- Anyone can view open opportunities
CREATE POLICY "Anyone can view open opportunities"
    ON volunteer_opportunities FOR SELECT
    USING (status = 'open');

-- Admins can view all opportunities
CREATE POLICY "Admins can view all opportunities"
    ON volunteer_opportunities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage opportunities
CREATE POLICY "Admins can create opportunities"
    ON volunteer_opportunities FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update opportunities"
    ON volunteer_opportunities FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can delete opportunities"
    ON volunteer_opportunities FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- VOLUNTEER_SIGNUPS TABLE RLS
-- =====================================================

ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;

-- Users can view their own signups
CREATE POLICY "Users can view own signups"
    ON volunteer_signups FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all signups
CREATE POLICY "Admins can view all signups"
    ON volunteer_signups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Users can create their own signups
CREATE POLICY "Users can create own signups"
    ON volunteer_signups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own signups
CREATE POLICY "Users can update own signups"
    ON volunteer_signups FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own signups
CREATE POLICY "Users can delete own signups"
    ON volunteer_signups FOR DELETE
    USING (auth.uid() = user_id);
