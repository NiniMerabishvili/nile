-- Add policy to allow users to create unavailable_dates when booking sessions
CREATE POLICY "Users can create unavailable dates when booking" ON unavailable_dates
  FOR INSERT WITH CHECK (
    -- Allow if the user has an active booking with this coach
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.coach_id = unavailable_dates.coach_id 
      AND bookings.user_id = auth.uid()
      AND bookings.status IN ('confirmed', 'pending')
    )
  ); 