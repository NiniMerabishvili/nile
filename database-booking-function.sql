-- Create a secure function to handle booking creation with unavailable dates
CREATE OR REPLACE FUNCTION create_booking_with_unavailable_date(
  p_coach_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_total_price DECIMAL(10,2),
  p_notes TEXT DEFAULT NULL,
  p_unavailable_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  booking_id UUID;
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Check if time slot is available
  IF NOT check_date_availability(p_coach_id, p_start_date, p_end_date) THEN
    RAISE EXCEPTION 'Time slot is not available';
  END IF;
  
  -- Create the booking
  INSERT INTO bookings (
    user_id,
    coach_id,
    start_date,
    end_date,
    start_time,
    end_time,
    status,
    package_type,
    total_price,
    notes
  ) VALUES (
    current_user_id,
    p_coach_id,
    p_start_date,
    p_end_date,
    p_start_time,
    p_end_time,
    'confirmed',
    'single',
    p_total_price,
    p_notes
  ) RETURNING id INTO booking_id;
  
  -- Create unavailable date entry
  INSERT INTO unavailable_dates (
    coach_id,
    start_date,
    end_date,
    reason
  ) VALUES (
    p_coach_id,
    p_start_date,
    p_end_date,
    COALESCE(p_unavailable_reason, 'Booked session (' || p_start_time || ' - ' || p_end_time || ')')
  );
  
  RETURN booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_booking_with_unavailable_date TO authenticated; 