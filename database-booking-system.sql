-- Create bookings table for trainer availability system
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
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

-- Create unavailable_dates table for coaches to block specific dates
CREATE TABLE IF NOT EXISTS unavailable_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
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

-- Enable RLS on booking tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE unavailable_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view their bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM coaches 
      WHERE coaches.id = bookings.coach_id 
      AND coaches.id = auth.uid()
    )
  );

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Coaches can update their bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM coaches 
      WHERE coaches.id = bookings.coach_id 
      AND coaches.id = auth.uid()
    )
  );

-- RLS Policies for unavailable_dates
CREATE POLICY "Everyone can view unavailable dates" ON unavailable_dates
  FOR SELECT USING (true);

CREATE POLICY "Coaches can manage their unavailable dates" ON unavailable_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM coaches 
      WHERE coaches.id = unavailable_dates.coach_id 
      AND coaches.id = auth.uid()
    )
  );

-- Create triggers for updated_at timestamps
CREATE TRIGGER handle_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_unavailable_dates_updated_at
  BEFORE UPDATE ON unavailable_dates
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

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

-- Function to get unavailable dates for a coach
CREATE OR REPLACE FUNCTION get_unavailable_dates(p_coach_id UUID)
RETURNS TABLE(
  date_range daterange,
  reason TEXT,
  type TEXT
) AS $$
BEGIN
  -- Return booked dates
  RETURN QUERY
  SELECT 
    daterange(b.start_date, b.end_date, '[]') as date_range,
    COALESCE(b.notes, 'Booked') as reason,
    'booking'::TEXT as type
  FROM bookings b
  WHERE b.coach_id = p_coach_id
    AND b.status IN ('confirmed', 'pending')
    AND b.end_date >= CURRENT_DATE;
    
  -- Return manually blocked dates
  RETURN QUERY
  SELECT 
    daterange(u.start_date, u.end_date, '[]') as date_range,
    COALESCE(u.reason, 'Unavailable') as reason,
    'unavailable'::TEXT as type
  FROM unavailable_dates u
  WHERE u.coach_id = p_coach_id
    AND u.end_date >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 