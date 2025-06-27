-- First, let's check if we can create the bucket with proper permissions
-- Run this as a superuser or admin

-- Temporarily disable RLS on buckets (if needed)
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'gym-images', 
  'gym-images', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Re-enable RLS on buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create bucket policy (if needed)
CREATE POLICY IF NOT EXISTS "Gym images bucket is public" ON storage.buckets
FOR SELECT USING (id = 'gym-images'); 