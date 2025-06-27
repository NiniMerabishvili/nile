-- Note: Run these one by one in the Supabase SQL Editor

-- Policy for public read access
CREATE POLICY "Anyone can view gym images" ON storage.objects
FOR SELECT USING (bucket_id = 'gym-images');

-- Policy for authenticated gym owners to insert
CREATE POLICY "Gym owners can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gym-images' 
  AND auth.uid() IS NOT NULL
);

-- Policy for authenticated users to update their own images
CREATE POLICY "Users can update own gym images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'gym-images' 
  AND auth.uid() IS NOT NULL
);

-- Policy for authenticated users to delete their own images  
CREATE POLICY "Users can delete own gym images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gym-images' 
  AND auth.uid() IS NOT NULL
); 