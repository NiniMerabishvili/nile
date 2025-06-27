-- Check current data types and sample data
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'gyms' AND column_name = 'id';

-- Check sample gym IDs to see their format
SELECT id, name, owner_id, created_at 
FROM gyms 
ORDER BY created_at DESC 
LIMIT 10;

-- If there are numeric IDs, we need to either:
-- 1. Convert them to UUIDs (recommended)
-- 2. Or update the schema to use integers

-- Option 1: Convert numeric IDs to UUIDs (if needed)
-- This will only run if there are actual numeric IDs stored as text
DO $$
DECLARE
    gym_record RECORD;
    new_uuid UUID;
BEGIN
    -- Check if there are any gyms with numeric-looking IDs
    FOR gym_record IN 
        SELECT id, name FROM gyms 
        WHERE id ~ '^\d+$'  -- Regex to match only numeric strings
    LOOP
        -- Generate a new UUID for this gym
        new_uuid := gen_random_uuid();
        
        -- Update the gym with the new UUID
        UPDATE gyms 
        SET id = new_uuid::text 
        WHERE id = gym_record.id;
        
        RAISE NOTICE 'Updated gym "%" from ID % to %', gym_record.name, gym_record.id, new_uuid;
    END LOOP;
END $$;

-- Ensure the id column is properly typed as UUID
-- This will fail if there are still non-UUID values
ALTER TABLE gyms ALTER COLUMN id TYPE UUID USING id::UUID; 