-- Add name column for gym coaches
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS name TEXT;

-- Add gym_id column if it doesn't exist  
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;

-- Drop the foreign key constraint on id so we can insert non-auth UUIDs
ALTER TABLE coaches DROP CONSTRAINT IF EXISTS coaches_id_fkey;

-- Add a check constraint for data integrity
ALTER TABLE coaches ADD CONSTRAINT coach_identity_check 
CHECK (
  (name IS NOT NULL AND gym_id IS NOT NULL) OR  -- Gym coach must have name and gym_id
  (name IS NULL AND EXISTS(SELECT 1 FROM auth.users WHERE id = coaches.id))  -- User coach must exist in auth.users
); 