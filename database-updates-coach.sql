-- Update profiles table to include coach role
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'gym_owner', 'coach'));

-- Update function to handle coach role in signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'is_coach')::boolean = true THEN 'coach'
      WHEN (NEW.raw_user_meta_data->>'is_gym_owner')::boolean = true THEN 'gym_owner'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create coaches table for coach-specific information
CREATE TABLE IF NOT EXISTS coaches (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  platform_fee_percentage DECIMAL(5,2) DEFAULT 5.00,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tutorials table for online video content
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  price DECIMAL(10,2) NOT NULL,
  coach_earnings DECIMAL(10,2) NOT NULL, -- After platform fee deduction
  platform_fee DECIMAL(10,2) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tutorial packages (for bundled pricing)
CREATE TABLE IF NOT EXISTS tutorial_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  package_type TEXT DEFAULT 'bundle' CHECK (package_type IN ('bundle', 'monthly_subscription')),
  price DECIMAL(10,2) NOT NULL,
  coach_earnings DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  duration_days INTEGER, -- For subscription packages
  tutorial_ids UUID[] DEFAULT '{}', -- For bundle packages
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create feedback requests table for personalized feedback service
CREATE TABLE IF NOT EXISTS feedback_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  workout_video_urls TEXT[] NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  coach_earnings DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  feedback_text TEXT,
  feedback_video_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create purchases table to track tutorial and package purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('tutorial', 'package', 'feedback')),
  item_id UUID NOT NULL, -- References tutorial_id, package_id, or feedback_request_id
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  coach_earnings DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  expires_at TIMESTAMP WITH TIME ZONE, -- For subscription packages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add triggers for updated_at timestamps
CREATE TRIGGER handle_coaches_updated_at
  BEFORE UPDATE ON coaches
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_tutorials_updated_at
  BEFORE UPDATE ON tutorials
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_tutorial_packages_updated_at
  BEFORE UPDATE ON tutorial_packages
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_feedback_requests_updated_at
  BEFORE UPDATE ON feedback_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Enable RLS on new tables
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coaches
CREATE POLICY "Coaches are viewable by everyone" ON coaches
  FOR SELECT USING (true);

CREATE POLICY "Coaches can update own profile" ON coaches
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert coach profile" ON coaches
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for tutorials
CREATE POLICY "Published tutorials are viewable by everyone" ON tutorials
  FOR SELECT USING (is_published = true);

CREATE POLICY "Coaches can view own tutorials" ON tutorials
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can manage own tutorials" ON tutorials
  FOR ALL USING (auth.uid() = coach_id);

-- RLS Policies for tutorial_packages
CREATE POLICY "Active packages are viewable by everyone" ON tutorial_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can view own packages" ON tutorial_packages
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can manage own packages" ON tutorial_packages
  FOR ALL USING (auth.uid() = coach_id);

-- RLS Policies for feedback_requests
CREATE POLICY "Users can view own feedback requests" ON feedback_requests
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = coach_id);

CREATE POLICY "Users can create feedback requests" ON feedback_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can update feedback requests" ON feedback_requests
  FOR UPDATE USING (auth.uid() = coach_id);

-- RLS Policies for purchases
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view purchases of their content" ON purchases
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Users can create purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to calculate coach earnings after platform fee
CREATE OR REPLACE FUNCTION calculate_coach_earnings(price DECIMAL, fee_percentage DECIMAL DEFAULT 5.0)
RETURNS DECIMAL AS $$
BEGIN
  RETURN price * (1 - fee_percentage / 100.0);
END;
$$ LANGUAGE plpgsql; 