-- Fix RLS policies on profiles table to prevent infinite recursion

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to view basic profile information (for displaying author names, etc.)
-- This uses auth.uid() directly which doesn't cause recursion
CREATE POLICY "Anyone can view basic profile info"
  ON profiles
  FOR SELECT
  USING (true);

-- Policy 2: Users can insert their own profile (during signup)
-- This uses auth.uid() directly without looking up the profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
-- This uses auth.uid() directly without looking up the profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy 4: Allow service role to do anything (for admin operations via service key)
-- Note: This policy uses current_setting which doesn't cause recursion
CREATE POLICY "Service role can do anything"
  ON profiles
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
