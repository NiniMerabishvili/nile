-- Add photo field to coaches table for storing coach photos
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS photo TEXT;

-- Create an index on the photo column for better performance when filtering coaches with photos
CREATE INDEX IF NOT EXISTS idx_coaches_photo ON coaches(photo) WHERE photo IS NOT NULL;

-- Update the Coach interface types to include photo
-- This will require updating the TypeScript interfaces 

-- Update any existing coaches query to include the photo field
-- This ensures the new field is available in all coach-related operations 