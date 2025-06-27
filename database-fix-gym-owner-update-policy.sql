-- Add missing UPDATE policy for gym owners to update their own gyms
CREATE POLICY "Gym owners can update their own gyms." ON gyms
  FOR UPDATE USING (
    auth.uid() = owner_id
  )
  WITH CHECK (
    auth.uid() = owner_id
  );

-- Also add a SELECT policy for gym owners to see their own gyms (including pending/rejected)
CREATE POLICY "Gym owners can view their own gyms." ON gyms
  FOR SELECT USING (
    auth.uid() = owner_id
  ); 