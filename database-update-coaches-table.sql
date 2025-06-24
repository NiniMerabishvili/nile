-- Add name column to coaches table for gym coaches who don't have user accounts
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS name TEXT;

-- Make the id column not require a foreign key to auth.users for gym coaches
-- We'll keep the existing foreign key but allow null ids with names
ALTER TABLE coaches ALTER COLUMN id DROP NOT NULL;

-- Add a check constraint to ensure either id (for user coaches) or name (for gym coaches) is provided
ALTER TABLE coaches ADD CONSTRAINT coach_identity_check 
CHECK ((id IS NOT NULL) OR (name IS NOT NULL AND gym_id IS NOT NULL)); 