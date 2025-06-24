-- Add gym_id column to coaches table to link coaches to gyms
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;

-- Update RLS policies for coaches table to handle gym owners managing coaches

-- Allow gym owners to insert coaches for their gyms
CREATE POLICY "Gym owners can add coaches to their gyms" ON coaches
  FOR INSERT WITH CHECK (
    gym_id IS NULL OR -- For independent coaches
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- Allow gym owners to view coaches from their gyms
CREATE POLICY "Gym owners can view their gym coaches" ON coaches
  FOR SELECT USING (
    gym_id IS NULL OR -- Independent coaches are viewable by everyone
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = gym_id 
      AND gyms.owner_id = auth.uid()
    )
  );

-- Allow gym owners to update coaches from their gyms
CREATE POLICY "Gym owners can update their gym coaches" ON coaches
  FOR UPDATE USING (
    auth.uid() = id OR -- Coach can update their own profile
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = gym_id 
      AND gyms.owner_id = auth.uid()
    )
  ); 