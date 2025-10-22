-- =====================================================
-- ENHANCE PROFILES FOR PARENT/DONOR INFORMATION
-- Migration: 20251023000000
-- =====================================================

-- Add parent/donor specific fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_parent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS preferred_communication TEXT CHECK (preferred_communication IN ('email', 'phone', 'text')) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS name TEXT; -- For easier access than full_name

-- Update existing full_name values to name if name is empty
UPDATE profiles SET name = full_name WHERE name IS NULL;

-- =====================================================
-- CREATE STUDENTS TABLE
-- Track parent-student relationships
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    grade TEXT NOT NULL CHECK (grade IN (
        'PreK', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th',
        '7th', '8th', '9th', '10th', '11th', '12th'
    )),
    campus TEXT NOT NULL CHECK (campus IN ('preschool', 'elementary', 'middle_high')),
    date_of_birth DATE,
    allergies TEXT,
    medical_notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, first_name, last_name, grade)
);

-- =====================================================
-- ADD INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_campus ON students(campus);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_profiles_is_parent ON profiles(is_parent);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =====================================================
-- ROW LEVEL SECURITY FOR STUDENTS TABLE
-- =====================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Users can view their own students
CREATE POLICY "Users can view own students"
    ON students FOR SELECT
    USING (parent_id = auth.uid());

-- Users can insert their own students
CREATE POLICY "Users can insert own students"
    ON students FOR INSERT
    WITH CHECK (parent_id = auth.uid());

-- Users can update their own students
CREATE POLICY "Users can update own students"
    ON students FOR UPDATE
    USING (parent_id = auth.uid())
    WITH CHECK (parent_id = auth.uid());

-- Users can delete their own students
CREATE POLICY "Users can delete own students"
    ON students FOR DELETE
    USING (parent_id = auth.uid());

-- Admins can view all students
CREATE POLICY "Admins can view all students"
    ON students FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage all students
CREATE POLICY "Admins can manage all students"
    ON students FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- CREATE FUNCTION TO AUTO-UPDATE updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for students table
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- UPDATE DONATIONS TABLE TO LINK TO STUDENTS
-- =====================================================
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_donations_student_id ON donations(student_id);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE students IS 'Stores student information linked to parent profiles';
COMMENT ON COLUMN profiles.is_parent IS 'Indicates if the user is a parent with students in the system';
COMMENT ON COLUMN profiles.profile_completed IS 'Tracks if user has completed their full profile';
COMMENT ON COLUMN donations.student_id IS 'Links donation to a specific student if applicable';
