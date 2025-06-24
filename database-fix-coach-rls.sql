-- Drop the conflicting policy that only allows users to insert their own coach profiles
DROP POLICY IF EXISTS "Users can insert coach profile" ON coaches;

-- Create a comprehensive policy that handles both user coaches and gym coaches
CREATE POLICY "Allow coach profile creation" ON coaches
  FOR INSERT WITH CHECK (
    -- Case 1: User creating their own coach profile (id = auth.uid())
    (id IS NOT NULL AND auth.uid() = id) OR
    -- Case 2: Gym owner creating coach for their gym (id = null, gym_id provided)
    (id IS NULL AND gym_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM gyms 
      WHERE gyms.id = gym_id 
      AND gyms.owner_id = auth.uid()
    )) OR
    -- Case 3: Independent coaches without gym association
    (id IS NOT NULL AND gym_id IS NULL AND auth.uid() = id)
  );

-- Also update the existing gym owners policy to avoid conflicts
DROP POLICY IF EXISTS "Gym owners can add coaches to their gyms" ON coaches;

-- The new comprehensive policy above already handles gym owner insertions 