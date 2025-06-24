-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can insert coach profile" ON coaches;

-- Create a more permissive policy for coach creation
CREATE POLICY "Allow authenticated users to create coaches" ON coaches
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- Regular user creating their own profile
      (id = auth.uid()) OR
      -- Gym owner creating coach for their gym
      (gym_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM gyms 
        WHERE gyms.id = gym_id 
        AND gyms.owner_id = auth.uid()
      ))
    )
  ); 