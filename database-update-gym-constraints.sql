-- Remove the old constraint
ALTER TABLE gyms DROP CONSTRAINT IF EXISTS gym_name_key;

-- Add a new constraint that allows same name in different cities
ALTER TABLE gyms ADD CONSTRAINT unique_gym_name_per_city UNIQUE (name, city); 