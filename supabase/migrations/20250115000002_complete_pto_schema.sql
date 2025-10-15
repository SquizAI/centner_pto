-- Complete PTO Website Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  campus TEXT CHECK (campus IN ('preschool', 'elementary', 'middle-high', 'all')),
  image_url TEXT,
  max_attendees INTEGER,
  rsvp_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled'))
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  num_adults INTEGER DEFAULT 1,
  num_children INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- News/Blog posts
CREATE TABLE IF NOT EXISTS news_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  campus TEXT CHECK (campus IN ('preschool', 'elementary', 'middle-high', 'all')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  views INTEGER DEFAULT 0
);

-- Volunteer opportunities
CREATE TABLE IF NOT EXISTS volunteer_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  campus TEXT CHECK (campus IN ('preschool', 'elementary', 'middle-high', 'all')),
  spots_available INTEGER,
  spots_filled INTEGER DEFAULT 0,
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'filled', 'closed'))
);

-- Volunteer signups
CREATE TABLE IF NOT EXISTS volunteer_signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled'))
);

-- Photo albums
CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  campus TEXT CHECK (campus IN ('preschool', 'elementary', 'middle-high', 'all')),
  cover_photo TEXT,
  event_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT true
);

-- Photos
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES photo_albums(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sort_order INTEGER DEFAULT 0
);

-- Donations
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'yearly')),
  campus_designation TEXT CHECK (campus_designation IN ('preschool', 'elementary', 'middle-high', 'general')),
  message TEXT,
  anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Board members
CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media posts cache
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter')),
  post_id TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  post_url TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, post_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_campus ON events(campus);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteer_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at);

-- Row Level Security Policies

-- Events: Public read, admin write
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events" ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Admins can update events" ON events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

-- Event RSVPs: Users can manage their own
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own RSVPs" ON event_rsvps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create RSVPs" ON event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own RSVPs" ON event_rsvps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all RSVPs" ON event_rsvps FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

-- News: Public read, admin write
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published news viewable by everyone" ON news_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage news" ON news_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

-- Volunteers: Public read, admin manage, users sign up
ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Volunteer opportunities viewable by everyone" ON volunteer_opportunities FOR SELECT USING (true);
CREATE POLICY "Admins can manage opportunities" ON volunteer_opportunities FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own signups" ON volunteer_signups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create signups" ON volunteer_signups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own signups" ON volunteer_signups FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own signups" ON volunteer_signups FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all signups" ON volunteer_signups FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Admins can manage all signups" ON volunteer_signups FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

-- Photos: Public read, admin write
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published albums viewable by everyone" ON photo_albums FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage albums" ON photo_albums FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photos viewable by everyone" ON photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM photo_albums WHERE photos.album_id = photo_albums.id AND photo_albums.published = true)
);
CREATE POLICY "Admins can manage photos" ON photos FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

-- Donations: Users can view their own, admins can view all
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own donations" ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create donations" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all donations" ON donations FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

-- Board members: Public read, admin write
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Board members viewable by everyone" ON board_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage board members" ON board_members FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

-- Site settings: Public read, admin write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by everyone" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

-- Social media: Public read, system write
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Social media posts viewable by everyone" ON social_media_posts FOR SELECT USING (true);

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('site_name', 'Centner Academy PTO', 'Website name'),
  ('contact_email', 'pto@centneracademy.com', 'Contact email'),
  ('facebook_url', '', 'Facebook page URL'),
  ('instagram_url', '', 'Instagram profile URL'),
  ('twitter_url', '', 'Twitter profile URL'),
  ('donation_goal', '50000', 'Annual donation goal in dollars')
ON CONFLICT (key) DO NOTHING;

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteers_updated_at BEFORE UPDATE ON volunteer_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON photo_albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_updated_at BEFORE UPDATE ON board_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
