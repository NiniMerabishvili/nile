-- Add status field to tutorials table for approval workflow
ALTER TABLE tutorials 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing tutorials to approved status
UPDATE tutorials SET status = 'approved' WHERE status IS NULL;

-- Update RLS policies for tutorials
DROP POLICY IF EXISTS "Published tutorials are viewable by everyone" ON tutorials;
DROP POLICY IF EXISTS "Coaches can view own tutorials" ON tutorials;
DROP POLICY IF EXISTS "Coaches can manage own tutorials" ON tutorials;

-- New RLS policies with status-based access
CREATE POLICY "Approved tutorials are viewable by everyone" ON tutorials
  FOR SELECT USING (status = 'approved' AND is_published = true);

CREATE POLICY "Coaches can view own tutorials" ON tutorials
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can manage own tutorials" ON tutorials
  FOR ALL USING (auth.uid() = coach_id);

-- Admins can view and update all tutorials
CREATE POLICY "Admins can view all tutorials" ON tutorials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tutorial status" ON tutorials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  ); 