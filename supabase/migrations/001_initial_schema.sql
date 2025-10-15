-- =====================================================
-- CENTNER PTO DATABASE SCHEMA
-- Migration 001: Initial Schema
-- Created: October 14, 2025
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Stores PTO member and admin profiles
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'volunteer', 'admin', 'super_admin')),
    campus TEXT CHECK (campus IN ('preschool', 'elementary', 'middle_high')),
    student_grades TEXT[], -- Array of grades (e.g., ['PreK', '3rd', '8th'])
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENTS TABLE
-- Stores PTO events and activities
-- =====================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    campus TEXT[] DEFAULT ARRAY['all'], -- Which campuses this event is for
    event_type TEXT CHECK (event_type IN ('fundraiser', 'meeting', 'volunteer', 'student_event', 'other')),
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENT_RSVPS TABLE
-- Track event registrations
-- =====================================================
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlist', 'cancelled')),
    guests_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- DONATIONS TABLE
-- Track all donations
-- =====================================================
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    donation_type TEXT DEFAULT 'general' CHECK (donation_type IN (
        'general', 'playground', 'stem', 'arts', 'field_trips',
        'scholarships', 'campus_specific', 'teacher_appreciation'
    )),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'quarterly', 'annual')),
    student_grade TEXT,
    campus TEXT,
    donor_name TEXT,
    donor_email TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHOTO_ALBUMS TABLE
-- Organize event photos into albums
-- =====================================================
CREATE TABLE photo_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    cover_image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    campus TEXT[] DEFAULT ARRAY['all'],
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHOTOS TABLE
-- Store individual photos
-- =====================================================
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES photo_albums(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    file_name TEXT NOT NULL,
    caption TEXT,
    photographer TEXT,
    display_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NEWS_POSTS TABLE
-- Blog-style news and announcements
-- =====================================================
CREATE TABLE news_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category TEXT CHECK (category IN ('news', 'announcement', 'spotlight', 'event_recap')),
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES profiles(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VOLUNTEER_OPPORTUNITIES TABLE
-- Track volunteer needs and sign-ups
-- =====================================================
CREATE TABLE volunteer_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    date TIMESTAMPTZ,
    duration_hours NUMERIC(4,2),
    location TEXT,
    slots_available INTEGER NOT NULL,
    slots_filled INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'filled', 'closed')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VOLUNTEER_SIGNUPS TABLE
-- Track volunteer commitments
-- =====================================================
CREATE TABLE volunteer_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
    hours_completed NUMERIC(4,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, user_id)
);

-- =====================================================
-- INDEXES
-- Optimize common queries
-- =====================================================

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_campus ON events USING GIN(campus);
CREATE INDEX idx_events_status ON events(status) WHERE status = 'published';
CREATE INDEX idx_donations_user ON donations(user_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created ON donations(created_at DESC);
CREATE INDEX idx_photos_album ON photos(album_id);
CREATE INDEX idx_news_posts_published ON news_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_volunteer_opportunities_status ON volunteer_opportunities(status) WHERE status = 'open';

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photo_albums_updated_at BEFORE UPDATE ON photo_albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_posts_updated_at BEFORE UPDATE ON news_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_opportunities_updated_at BEFORE UPDATE ON volunteer_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
