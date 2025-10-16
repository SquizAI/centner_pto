-- =====================================================
-- ENHANCE EVENT RSVPS TABLE
-- Migration: Ensure RSVP table is correctly structured
-- Created: October 16, 2025
-- =====================================================

-- Ensure event_rsvps table exists with correct schema
DO $$
BEGIN
  -- Check if table exists, if not create it
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'event_rsvps') THEN
    CREATE TABLE event_rsvps (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      num_adults INTEGER DEFAULT 1,
      num_children INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(event_id, user_id)
    );
  END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_rsvps' AND column_name = 'parent_name'
  ) THEN
    ALTER TABLE event_rsvps ADD COLUMN parent_name TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_rsvps' AND column_name = 'parent_email'
  ) THEN
    ALTER TABLE event_rsvps ADD COLUMN parent_email TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_rsvps' AND column_name = 'num_adults'
  ) THEN
    ALTER TABLE event_rsvps ADD COLUMN num_adults INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_rsvps' AND column_name = 'num_children'
  ) THEN
    ALTER TABLE event_rsvps ADD COLUMN num_children INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_rsvps' AND column_name = 'notes'
  ) THEN
    ALTER TABLE event_rsvps ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_email ON event_rsvps(parent_email);

-- Row Level Security
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own RSVPs" ON event_rsvps;
DROP POLICY IF EXISTS "Users can create RSVPs" ON event_rsvps;
DROP POLICY IF EXISTS "Users can update their own RSVPs" ON event_rsvps;
DROP POLICY IF EXISTS "Users can delete their own RSVPs" ON event_rsvps;
DROP POLICY IF EXISTS "Admins can view all RSVPs" ON event_rsvps;
DROP POLICY IF EXISTS "Admins can manage all RSVPs" ON event_rsvps;

-- Users can view their own RSVPs
CREATE POLICY "Users can view their own RSVPs" ON event_rsvps
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR parent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Anyone can create RSVPs (for guest RSVP)
CREATE POLICY "Users can create RSVPs" ON event_rsvps
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own RSVPs
CREATE POLICY "Users can update their own RSVPs" ON event_rsvps
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR parent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can delete their own RSVPs
CREATE POLICY "Users can delete their own RSVPs" ON event_rsvps
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR parent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can view all RSVPs
CREATE POLICY "Admins can view all RSVPs" ON event_rsvps
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- Admins can manage all RSVPs
CREATE POLICY "Admins can manage all RSVPs" ON event_rsvps
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- Function to get RSVP count for an event
CREATE OR REPLACE FUNCTION get_event_rsvp_count(p_event_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM event_rsvps
  WHERE event_id = p_event_id;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total attendees count (including guests)
CREATE OR REPLACE FUNCTION get_event_total_attendees(p_event_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(num_adults + num_children), 0)
  INTO v_total
  FROM event_rsvps
  WHERE event_id = p_event_id;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE event_rsvps IS 'Stores RSVPs for events, supporting both authenticated and guest users';
COMMENT ON COLUMN event_rsvps.parent_name IS 'Full name of person RSVPing';
COMMENT ON COLUMN event_rsvps.parent_email IS 'Email address for confirmation and communication';
COMMENT ON COLUMN event_rsvps.num_adults IS 'Number of adults attending';
COMMENT ON COLUMN event_rsvps.num_children IS 'Number of children attending';
COMMENT ON COLUMN event_rsvps.notes IS 'Additional notes or special requirements';
COMMENT ON FUNCTION get_event_rsvp_count(UUID) IS 'Returns the total number of RSVPs for an event';
COMMENT ON FUNCTION get_event_total_attendees(UUID) IS 'Returns the total number of attendees (adults + children) for an event';
