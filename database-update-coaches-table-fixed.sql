-- Add name column to coaches table for gym coaches who don't have user accounts
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS name TEXT;

-- Add gym_id column if it doesn't exist
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;

-- Since PRIMARY KEY cannot be nullable, we need to change the primary key structure
-- First, drop the existing primary key constraint
ALTER TABLE coaches DROP CONSTRAINT IF EXISTS coaches_pkey;

-- Add a new UUID primary key column that's independent of user accounts
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS coach_uuid UUID DEFAULT gen_random_uuid();

-- Make coach_uuid the new primary key
ALTER TABLE coaches ADD CONSTRAINT coaches_pkey PRIMARY KEY (coach_uuid);

-- Add a check constraint to ensure data integrity
ALTER TABLE coaches ADD CONSTRAINT coach_identity_check 
CHECK (
  (id IS NOT NULL AND name IS NULL) OR  -- User coach (has auth.users id, no name)
  (id IS NULL AND name IS NOT NULL AND gym_id IS NOT NULL)  -- Gym coach (no auth.users id, has name and gym_id)
); 

-- Create index on the old id column for performance
CREATE INDEX IF NOT EXISTS idx_coaches_user_id ON coaches(id); 