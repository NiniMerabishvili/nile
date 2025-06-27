-- Debug script to check gym ownership and permissions

-- 1. Check your current user ID
SELECT auth.uid() as current_user_id;

-- 2. Check your profile and role
SELECT id, full_name, email, role 
FROM profiles 
WHERE id = auth.uid();

-- 3. Check all gyms with their current IDs and owners
SELECT 
  id,
  name,
  owner_id,
  status,
  created_at,
  pg_typeof(id) as id_type,
  CASE 
    WHEN id ~ '^\d+$' THEN 'NUMERIC'
    WHEN id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN 'UUID'
    ELSE 'OTHER'
  END as id_format
FROM gyms 
ORDER BY created_at DESC;

-- 4. Check specifically if gym ID 41 exists and who owns it
SELECT 
  id,
  name,
  owner_id,
  status,
  auth.uid() = owner_id as is_owner,
  auth.uid() as current_user
FROM gyms 
WHERE id = '41';

-- 5. Check your gyms specifically
SELECT 
  id,
  name,
  owner_id,
  status,
  created_at
FROM gyms 
WHERE owner_id = auth.uid();

-- 6. Test update permissions - try to update gym 41
-- This will tell us if the issue is permissions or data
UPDATE gyms 
SET updated_at = NOW()
WHERE id = '41' AND owner_id = auth.uid()
RETURNING id, name, owner_id; 