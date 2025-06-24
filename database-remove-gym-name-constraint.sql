-- Remove the unique constraint on gym name if it exists
ALTER TABLE gyms DROP CONSTRAINT IF EXISTS gym_name_key; 