-- =====================================================
-- CENTNER PTO DATABASE SCHEMA
-- Migration: Enhanced Volunteer Opportunities System
-- Created: October 15, 2025
-- Timestamp: 20251015093558
-- Description: Creates comprehensive volunteer management feature with
--              opportunities posting, signup tracking, and availability management
-- =====================================================

-- =====================================================
-- DROP EXISTING TABLES
-- Remove basic volunteer tables from initial schema
-- =====================================================
DROP TABLE IF EXISTS volunteer_signups CASCADE;
DROP TABLE IF EXISTS volunteer_opportunities CASCADE;

-- =====================================================
-- VOLUNTEER_OPPORTUNITIES TABLE
-- Stores volunteer opportunities posted by PTO admins
-- =====================================================
CREATE TABLE volunteer_opportunities (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core Information
    title TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Scheduling
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Location & Campus
    location TEXT NOT NULL,
    campus TEXT NOT NULL DEFAULT 'all'
        CHECK (campus IN ('all', 'preschool', 'elementary', 'middle-high')),

    -- Capacity Management
    max_volunteers INTEGER NOT NULL CHECK (max_volunteers > 0),
    current_signups INTEGER NOT NULL DEFAULT 0 CHECK (current_signups >= 0),

    -- Additional Details
    requirements TEXT, -- Special skills or requirements needed
    contact_email TEXT NOT NULL,

    -- Status Management
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'cancelled', 'completed')),

    -- Authorship
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT end_time_after_start_time CHECK (end_time > start_time),
    CONSTRAINT current_signups_not_exceed_max CHECK (current_signups <= max_volunteers),
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- =====================================================
-- VOLUNTEER_SIGNUPS TABLE (Junction Table)
-- Tracks which users signed up for which opportunities
-- =====================================================
CREATE TABLE volunteer_signups (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Keys
    opportunity_id UUID NOT NULL REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Signup Details
    signup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT, -- User notes when signing up

    -- Status
    status TEXT NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('confirmed', 'cancelled', 'completed')),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_user_opportunity UNIQUE (opportunity_id, user_id)
);

-- =====================================================
-- INDEXES
-- Optimized for common query patterns
-- =====================================================

-- ========== VOLUNTEER_OPPORTUNITIES INDEXES ==========

-- Primary query: Active opportunities ordered by date
CREATE INDEX idx_volunteer_opps_active_date
    ON volunteer_opportunities(status, date DESC)
    WHERE status = 'active' AND date >= CURRENT_DATE;

-- Filter by date (chronological listing)
CREATE INDEX idx_volunteer_opps_date
    ON volunteer_opportunities(date DESC);

-- Filter by campus
CREATE INDEX idx_volunteer_opps_campus
    ON volunteer_opportunities(campus)
    WHERE status = 'active';

-- Filter by status
CREATE INDEX idx_volunteer_opps_status
    ON volunteer_opportunities(status);

-- Admin management: View opportunities by creator
CREATE INDEX idx_volunteer_opps_created_by
    ON volunteer_opportunities(created_by);

-- Composite index for active opportunities by campus and date
CREATE INDEX idx_volunteer_opps_campus_date
    ON volunteer_opportunities(campus, date DESC, status)
    WHERE status = 'active';

-- Created timestamp for sorting in admin dashboard
CREATE INDEX idx_volunteer_opps_created_at
    ON volunteer_opportunities(created_at DESC);

-- ========== VOLUNTEER_SIGNUPS INDEXES ==========

-- Count signups for an opportunity
CREATE INDEX idx_volunteer_signups_opportunity
    ON volunteer_signups(opportunity_id);

-- User dashboard: View user's signups
CREATE INDEX idx_volunteer_signups_user
    ON volunteer_signups(user_id);

-- Count confirmed signups for availability checking
CREATE INDEX idx_volunteer_signups_opp_status
    ON volunteer_signups(opportunity_id, status)
    WHERE status = 'confirmed';

-- Unique constraint enforced with index (prevents duplicate signups)
CREATE UNIQUE INDEX idx_volunteer_signups_unique_user_opp
    ON volunteer_signups(opportunity_id, user_id);

-- Signup date for chronological sorting
CREATE INDEX idx_volunteer_signups_signup_date
    ON volunteer_signups(signup_date DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- Business logic functions for volunteer management
-- =====================================================

-- Function: Get available spots for an opportunity
-- Returns the number of remaining volunteer spots
-- Usage: SELECT get_available_spots('opportunity-uuid');
CREATE OR REPLACE FUNCTION get_available_spots(opportunity_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    available_spots INTEGER;
BEGIN
    SELECT (max_volunteers - current_signups)
    INTO available_spots
    FROM volunteer_opportunities
    WHERE id = opportunity_uuid;

    RETURN COALESCE(available_spots, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Check if opportunity is full
-- Returns TRUE if no more spots available
-- Usage: SELECT is_opportunity_full('opportunity-uuid');
CREATE OR REPLACE FUNCTION is_opportunity_full(opportunity_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_full BOOLEAN;
BEGIN
    SELECT (current_signups >= max_volunteers)
    INTO is_full
    FROM volunteer_opportunities
    WHERE id = opportunity_uuid;

    RETURN COALESCE(is_full, TRUE); -- Default to TRUE if opportunity not found
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get user's active signup count
-- Returns count of user's confirmed signups
-- Usage: SELECT get_user_signups_count('user-uuid');
CREATE OR REPLACE FUNCTION get_user_signups_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM volunteer_signups vs
        JOIN volunteer_opportunities vo ON vs.opportunity_id = vo.id
        WHERE vs.user_id = user_uuid
        AND vs.status = 'confirmed'
        AND vo.status = 'active'
        AND vo.date >= CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Get user's upcoming volunteer commitments
-- Returns array of opportunity titles and dates
-- Usage: SELECT get_user_upcoming_commitments('user-uuid');
CREATE OR REPLACE FUNCTION get_user_upcoming_commitments(user_uuid UUID)
RETURNS TABLE(
    opportunity_id UUID,
    title TEXT,
    date DATE,
    start_time TIME,
    end_time TIME,
    location TEXT,
    signup_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        vo.id,
        vo.title,
        vo.date,
        vo.start_time,
        vo.end_time,
        vo.location,
        vs.notes
    FROM volunteer_signups vs
    JOIN volunteer_opportunities vo ON vs.opportunity_id = vo.id
    WHERE vs.user_id = user_uuid
    AND vs.status = 'confirmed'
    AND vo.status = 'active'
    AND vo.date >= CURRENT_DATE
    ORDER BY vo.date ASC, vo.start_time ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- TRIGGERS
-- Automated actions for data integrity
-- =====================================================

-- Trigger: Auto-update updated_at timestamp on volunteer_opportunities
CREATE TRIGGER update_volunteer_opportunities_updated_at
    BEFORE UPDATE ON volunteer_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at timestamp on volunteer_signups
CREATE TRIGGER update_volunteer_signups_updated_at
    BEFORE UPDATE ON volunteer_signups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger Function: Increment/decrement current_signups counter
-- Automatically updates current_signups when signups are added/cancelled
CREATE OR REPLACE FUNCTION update_current_signups()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT: Increment counter if confirmed
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'confirmed' THEN
            UPDATE volunteer_opportunities
            SET current_signups = current_signups + 1
            WHERE id = NEW.opportunity_id;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle UPDATE: Adjust counter based on status change
    IF TG_OP = 'UPDATE' THEN
        -- Changed from confirmed to cancelled/completed: Decrement
        IF OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'completed') THEN
            UPDATE volunteer_opportunities
            SET current_signups = current_signups - 1
            WHERE id = NEW.opportunity_id;
        END IF;

        -- Changed from cancelled to confirmed: Increment (if not full)
        IF OLD.status = 'cancelled' AND NEW.status = 'confirmed' THEN
            -- Check if opportunity is full before allowing re-confirmation
            IF NOT is_opportunity_full(NEW.opportunity_id) THEN
                UPDATE volunteer_opportunities
                SET current_signups = current_signups + 1
                WHERE id = NEW.opportunity_id;
            ELSE
                RAISE EXCEPTION 'Cannot confirm signup: Opportunity is full';
            END IF;
        END IF;

        RETURN NEW;
    END IF;

    -- Handle DELETE: Decrement counter if was confirmed
    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'confirmed' THEN
            UPDATE volunteer_opportunities
            SET current_signups = current_signups - 1
            WHERE id = OLD.opportunity_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to volunteer_signups
CREATE TRIGGER manage_volunteer_signups_count
    AFTER INSERT OR UPDATE OR DELETE ON volunteer_signups
    FOR EACH ROW
    EXECUTE FUNCTION update_current_signups();

-- Trigger Function: Prevent signups when opportunity is full
CREATE OR REPLACE FUNCTION prevent_signup_if_full()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check on INSERT or when updating status to 'confirmed'
    IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') OR
       (TG_OP = 'UPDATE' AND OLD.status != 'confirmed' AND NEW.status = 'confirmed') THEN

        IF is_opportunity_full(NEW.opportunity_id) THEN
            RAISE EXCEPTION 'Cannot sign up: Volunteer opportunity is full (ID: %)', NEW.opportunity_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to volunteer_signups (runs BEFORE insert/update)
CREATE TRIGGER check_opportunity_capacity
    BEFORE INSERT OR UPDATE ON volunteer_signups
    FOR EACH ROW
    EXECUTE FUNCTION prevent_signup_if_full();

-- =====================================================
-- TABLE COMMENTS
-- Documentation for maintainability
-- =====================================================

COMMENT ON TABLE volunteer_opportunities IS 'Volunteer opportunities posted by PTO admins for parent participation';
COMMENT ON COLUMN volunteer_opportunities.id IS 'Unique identifier for the opportunity';
COMMENT ON COLUMN volunteer_opportunities.title IS 'Short title/name of the volunteer opportunity (e.g., "Book Fair Helper")';
COMMENT ON COLUMN volunteer_opportunities.description IS 'Detailed description of what volunteers will do';
COMMENT ON COLUMN volunteer_opportunities.date IS 'Date of the volunteer opportunity';
COMMENT ON COLUMN volunteer_opportunities.start_time IS 'Start time for the volunteer shift';
COMMENT ON COLUMN volunteer_opportunities.end_time IS 'End time for the volunteer shift';
COMMENT ON COLUMN volunteer_opportunities.location IS 'Where volunteers should report (e.g., "Library", "Main Office")';
COMMENT ON COLUMN volunteer_opportunities.campus IS 'Target campus: all, preschool, elementary, or middle-high';
COMMENT ON COLUMN volunteer_opportunities.max_volunteers IS 'Maximum number of volunteers needed';
COMMENT ON COLUMN volunteer_opportunities.current_signups IS 'Current number of confirmed signups (auto-updated)';
COMMENT ON COLUMN volunteer_opportunities.requirements IS 'Special requirements, skills, or qualifications needed';
COMMENT ON COLUMN volunteer_opportunities.contact_email IS 'Email for questions about the opportunity';
COMMENT ON COLUMN volunteer_opportunities.status IS 'Opportunity status: active, cancelled, or completed';
COMMENT ON COLUMN volunteer_opportunities.created_by IS 'Admin user who created this opportunity';
COMMENT ON COLUMN volunteer_opportunities.created_at IS 'When the opportunity was created';
COMMENT ON COLUMN volunteer_opportunities.updated_at IS 'When the opportunity was last modified (auto-updated)';

COMMENT ON TABLE volunteer_signups IS 'Junction table tracking user signups for volunteer opportunities';
COMMENT ON COLUMN volunteer_signups.id IS 'Unique identifier for the signup';
COMMENT ON COLUMN volunteer_signups.opportunity_id IS 'Reference to volunteer_opportunities table';
COMMENT ON COLUMN volunteer_signups.user_id IS 'Reference to auth.users - who signed up';
COMMENT ON COLUMN volunteer_signups.signup_date IS 'When the user signed up';
COMMENT ON COLUMN volunteer_signups.notes IS 'Optional notes from the user when signing up';
COMMENT ON COLUMN volunteer_signups.status IS 'Signup status: confirmed, cancelled, or completed';
COMMENT ON COLUMN volunteer_signups.created_at IS 'When the signup record was created';
COMMENT ON COLUMN volunteer_signups.updated_at IS 'When the signup was last modified (auto-updated)';

-- =====================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- NOTE: These policies are DOCUMENTED here for the supabase-integration agent.
-- They should be applied by the supabase-integration agent, not in this migration.
--
-- ========== VOLUNTEER_OPPORTUNITIES RLS ==========
--
-- Enable RLS:
-- ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
--
-- POLICY 1: Public users can view active opportunities
-- Description: Anonymous and authenticated users can view active opportunities
--              with dates in the present or future
-- SQL:
-- CREATE POLICY "Public users can view active opportunities"
--     ON volunteer_opportunities
--     FOR SELECT
--     USING (
--         status = 'active'
--         AND date >= CURRENT_DATE
--     );
--
-- POLICY 2: Authenticated users can view all opportunities
-- Description: Logged-in users can see all opportunities (including past/cancelled)
-- SQL:
-- CREATE POLICY "Authenticated users can view all opportunities"
--     ON volunteer_opportunities
--     FOR SELECT
--     USING (auth.uid() IS NOT NULL);
--
-- POLICY 3: Admins can create opportunities
-- Description: Only users with 'admin' or 'super_admin' role can create opportunities
-- SQL:
-- CREATE POLICY "Admins can create opportunities"
--     ON volunteer_opportunities
--     FOR INSERT
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- POLICY 4: Admins can update all opportunities
-- Description: Admins can modify any opportunity
-- SQL:
-- CREATE POLICY "Admins can update opportunities"
--     ON volunteer_opportunities
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
-- POLICY 5: Creators can update their own opportunities
-- Description: User who created an opportunity can modify it
-- SQL:
-- CREATE POLICY "Creators can update own opportunities"
--     ON volunteer_opportunities
--     FOR UPDATE
--     USING (auth.uid() = created_by)
--     WITH CHECK (auth.uid() = created_by);
--
-- POLICY 6: Admins can delete opportunities
-- Description: Only admins can delete opportunities
-- SQL:
-- CREATE POLICY "Admins can delete opportunities"
--     ON volunteer_opportunities
--     FOR DELETE
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- ========== VOLUNTEER_SIGNUPS RLS ==========
--
-- Enable RLS:
-- ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;
--
-- POLICY 1: Users can view their own signups
-- Description: Authenticated users can see their own volunteer signups
-- SQL:
-- CREATE POLICY "Users can view own signups"
--     ON volunteer_signups
--     FOR SELECT
--     USING (auth.uid() = user_id);
--
-- POLICY 2: Admins can view all signups
-- Description: Admins can see all volunteer signups for management
-- SQL:
-- CREATE POLICY "Admins can view all signups"
--     ON volunteer_signups
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- POLICY 3: Authenticated users can create their own signups
-- Description: Users can sign up for opportunities (if not full - checked by trigger)
-- SQL:
-- CREATE POLICY "Users can create own signups"
--     ON volunteer_signups
--     FOR INSERT
--     WITH CHECK (auth.uid() = user_id);
--
-- POLICY 4: Users can update their own signups
-- Description: Users can modify their own signups (e.g., change status to cancelled)
-- SQL:
-- CREATE POLICY "Users can update own signups"
--     ON volunteer_signups
--     FOR UPDATE
--     USING (auth.uid() = user_id)
--     WITH CHECK (auth.uid() = user_id);
--
-- POLICY 5: Users can delete their own signups
-- Description: Users can remove their own signups
-- SQL:
-- CREATE POLICY "Users can delete own signups"
--     ON volunteer_signups
--     FOR DELETE
--     USING (auth.uid() = user_id);
--
-- POLICY 6: Admins can update any signup
-- Description: Admins can modify any signup for management purposes
-- SQL:
-- CREATE POLICY "Admins can update any signup"
--     ON volunteer_signups
--     FOR UPDATE
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );
--
-- POLICY 7: Admins can delete any signup
-- Description: Admins can remove any signup if needed
-- SQL:
-- CREATE POLICY "Admins can delete any signup"
--     ON volunteer_signups
--     FOR DELETE
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.role IN ('admin', 'super_admin')
--         )
--     );

-- =====================================================
-- SAMPLE DATA (for testing/development)
-- =====================================================
-- Uncomment to insert sample volunteer opportunities for testing
--
-- NOTE: Replace 'YOUR-ADMIN-USER-UUID' with actual admin user ID
--
-- INSERT INTO volunteer_opportunities (
--     title,
--     description,
--     date,
--     start_time,
--     end_time,
--     location,
--     campus,
--     max_volunteers,
--     requirements,
--     contact_email,
--     status,
--     created_by
-- ) VALUES
-- (
--     'Book Fair Helper',
--     'Help students select books and manage checkout at our annual book fair. Great opportunity to encourage reading!',
--     CURRENT_DATE + INTERVAL '7 days',
--     '08:00:00',
--     '12:00:00',
--     'Library',
--     'elementary',
--     5,
--     'Comfortable with cashless payment systems and basic math',
--     'library@centneracademy.com',
--     'active',
--     'YOUR-ADMIN-USER-UUID'
-- ),
-- (
--     'Field Day Volunteer',
--     'Assist with setting up and running field day activities. Help students rotate through stations and keep score.',
--     CURRENT_DATE + INTERVAL '14 days',
--     '09:00:00',
--     '14:00:00',
--     'Athletic Field',
--     'all',
--     10,
--     'Ability to be outdoors for extended periods. High energy!',
--     'athletics@centneracademy.com',
--     'active',
--     'YOUR-ADMIN-USER-UUID'
-- ),
-- (
--     'STEM Night Setup',
--     'Help set up science stations and experiments for our family STEM night. Setup only, no need to stay for the event.',
--     CURRENT_DATE + INTERVAL '21 days',
--     '15:00:00',
--     '17:00:00',
--     'Science Lab',
--     'middle-high',
--     3,
--     NULL,
--     'stem@centneracademy.com',
--     'active',
--     'YOUR-ADMIN-USER-UUID'
-- ),
-- (
--     'Classroom Party Assistant',
--     'Assist teachers with classroom holiday party. Help with crafts, games, and snack distribution.',
--     CURRENT_DATE + INTERVAL '30 days',
--     '13:00:00',
--     '15:00:00',
--     'Preschool Wing - Room 105',
--     'preschool',
--     2,
--     'Must complete background check (we will provide instructions)',
--     'preschool@centneracademy.com',
--     'active',
--     'YOUR-ADMIN-USER-UUID'
-- );

-- =====================================================
-- EXPECTED TYPESCRIPT TYPES
-- =====================================================
-- For supabase-integration agent to generate types
--
-- export interface VolunteerOpportunity {
--   id: string; // UUID
--   title: string;
--   description: string;
--   date: string; // ISO 8601 date string
--   start_time: string; // HH:MM:SS format
--   end_time: string; // HH:MM:SS format
--   location: string;
--   campus: 'all' | 'preschool' | 'elementary' | 'middle-high';
--   max_volunteers: number;
--   current_signups: number;
--   requirements: string | null;
--   contact_email: string;
--   status: 'active' | 'cancelled' | 'completed';
--   created_by: string; // UUID
--   created_at: string; // ISO 8601 timestamp
--   updated_at: string; // ISO 8601 timestamp
-- }
--
-- export interface VolunteerSignup {
--   id: string; // UUID
--   opportunity_id: string; // UUID
--   user_id: string; // UUID
--   signup_date: string; // ISO 8601 timestamp
--   notes: string | null;
--   status: 'confirmed' | 'cancelled' | 'completed';
--   created_at: string; // ISO 8601 timestamp
--   updated_at: string; // ISO 8601 timestamp
-- }

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next Steps:
-- 1. Review and apply RLS policies (via supabase-integration agent)
-- 2. Generate TypeScript types from schema
-- 3. Create API endpoints for CRUD operations
-- 4. Build admin interface for opportunity management
-- 5. Build user interface for browsing and signing up
-- 6. Implement email notifications for signups/cancellations
-- =====================================================
