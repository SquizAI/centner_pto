-- =====================================================
-- STORAGE BUCKETS AND POLICIES
-- Migration 003: Storage Setup
-- Created: October 14, 2025
-- =====================================================

-- Note: Storage buckets are typically created via the Supabase Dashboard
-- This SQL file documents the storage policies to apply

-- =====================================================
-- STORAGE BUCKETS
-- Create these via Supabase Dashboard or SQL
-- =====================================================

/*
CREATE BUCKETS:
1. event-photos (public: true)
2. news-images (public: true)
3. avatars (public: true)
4. documents (public: false)
*/

-- =====================================================
-- EVENT-PHOTOS BUCKET POLICIES
-- =====================================================

-- Allow public read access to event photos
CREATE POLICY "Public can view event photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-photos');

-- Allow admins to upload event photos
CREATE POLICY "Admins can upload event photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-photos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Allow admins to update event photos
CREATE POLICY "Admins can update event photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-photos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Allow admins to delete event photos
CREATE POLICY "Admins can delete event photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-photos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- NEWS-IMAGES BUCKET POLICIES
-- =====================================================

-- Allow public read access to news images
CREATE POLICY "Public can view news images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'news-images');

-- Allow admins to upload news images
CREATE POLICY "Admins can upload news images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'news-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Allow admins to update news images
CREATE POLICY "Admins can update news images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'news-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Allow admins to delete news images
CREATE POLICY "Admins can delete news images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'news-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- AVATARS BUCKET POLICIES
-- =====================================================

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- DOCUMENTS BUCKET POLICIES (Private)
-- =====================================================

-- Only admins can view documents
CREATE POLICY "Admins can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Only admins can upload documents
CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Only admins can update documents
CREATE POLICY "Admins can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Only admins can delete documents
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
