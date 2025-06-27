-- First, let's see what we're dealing with
SELECT 
  id, 
  name, 
  owner_id,
  pg_typeof(id) as id_type,
  CASE 
    WHEN id ~ '^\d+$' THEN 'NUMERIC_STRING'
    WHEN id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN 'UUID_STRING'
    ELSE 'OTHER'
  END as id_format
FROM gyms 
ORDER BY created_at DESC;

-- Convert any numeric IDs to proper UUIDs
DO $$
DECLARE
    gym_record RECORD;
    new_uuid UUID;
BEGIN
    -- Find gyms with numeric IDs
    FOR gym_record IN 
        SELECT id, name, owner_id FROM gyms 
        WHERE id ~ '^\d+$'  -- Only numeric characters
    LOOP
        -- Generate a new UUID
        new_uuid := gen_random_uuid();
        
        -- Update all references first (if any foreign keys exist)
        -- Update gyms_to_categories if it exists
        UPDATE gyms_to_categories 
        SET gym_id = new_uuid::text 
        WHERE gym_id = gym_record.id;
        
        -- Update coaches table if it references gym_id
        UPDATE coaches 
        SET gym_id = new_uuid::text 
        WHERE gym_id = gym_record.id;
        
        -- Finally update the gym itself
        UPDATE gyms 
        SET id = new_uuid::text 
        WHERE id = gym_record.id;
        
        RAISE NOTICE 'Converted gym "%" from numeric ID % to UUID %', 
                     gym_record.name, gym_record.id, new_uuid;
    END LOOP;
END $$;

-- Verify all IDs are now UUIDs
SELECT 
  id, 
  name,
  CASE 
    WHEN id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN 'VALID_UUID'
    ELSE 'INVALID_UUID'
  END as id_status
FROM gyms 
WHERE id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'; 