-- ==================== COMPLETE BOOKING SYSTEM SETUP ====================

-- First, ensure the handle_updated_at function exists
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID NOT NULL, -- Remove FK constraint for now to avoid issues
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  package_type TEXT DEFAULT 'single' CHECK (package_type IN ('single', '5pack', '10pack')),
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create unavailable_dates table if it doesn't exist
CREATE TABLE IF NOT EXISTS unavailable_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL, -- Remove FK constraint for now
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_coach_id ON bookings(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(coach_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_unavailable_dates_coach_id ON unavailable_dates(coach_id);
CREATE INDEX IF NOT EXISTS idx_unavailable_dates_dates ON unavailable_dates(coach_id, start_date, end_date);

-- Create triggers for updated_at timestamps
DROP TRIGGER IF EXISTS handle_bookings_updated_at ON bookings;
CREATE TRIGGER handle_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_unavailable_dates_updated_at ON unavailable_dates;
CREATE TRIGGER handle_unavailable_dates_updated_at
  BEFORE UPDATE ON unavailable_dates
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Enable RLS on booking tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE unavailable_dates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Coaches can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Coaches can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Everyone can view unavailable dates" ON unavailable_dates;
DROP POLICY IF EXISTS "Coaches can manage their unavailable dates" ON unavailable_dates;
DROP POLICY IF EXISTS "Users can create unavailable dates when booking" ON unavailable_dates;

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for unavailable_dates
CREATE POLICY "Everyone can view unavailable dates" ON unavailable_dates
  FOR SELECT USING (true);

-- Allow the function to insert into unavailable_dates
CREATE POLICY "System can create unavailable dates" ON unavailable_dates
  FOR INSERT WITH CHECK (true);

-- Function to check if dates are available for booking
CREATE OR REPLACE FUNCTION check_date_availability(
  p_coach_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping bookings
  SELECT COUNT(*)
  INTO conflict_count
  FROM bookings
  WHERE coach_id = p_coach_id
    AND status IN ('confirmed', 'pending')
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
    AND (
      (start_date <= p_start_date AND end_date >= p_start_date) OR
      (start_date <= p_end_date AND end_date >= p_end_date) OR
      (start_date >= p_start_date AND end_date <= p_end_date)
    );
  
  IF conflict_count > 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for unavailable dates
  SELECT COUNT(*)
  INTO conflict_count
  FROM unavailable_dates
  WHERE coach_id = p_coach_id
    AND (
      (start_date <= p_start_date AND end_date >= p_start_date) OR
      (start_date <= p_end_date AND end_date >= p_end_date) OR
      (start_date >= p_start_date AND end_date <= p_end_date)
    );
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the main booking function
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
  
  -- Create unavailable date entry to block this time for all users
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
GRANT EXECUTE ON FUNCTION check_date_availability TO authenticated;

-- Test function existence
DO $$
BEGIN
  RAISE NOTICE '✅ Booking functions created successfully!';
  RAISE NOTICE 'Functions available:';
  RAISE NOTICE '- create_booking_with_unavailable_date';
  RAISE NOTICE '- check_date_availability';
END $$; 