# Supabase Authentication Setup Guide

## Environment Variables Setup

Your application needs Supabase environment variables to work properly. Follow these steps:

### 1. Create a `.env` file in your project root

Create a file named `.env` in the `nile` directory with the following content:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Get your Supabase credentials

1. Go to your [Supabase project dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on "Settings" in the sidebar
4. Click on "API" in the settings menu
5. Copy the following values:
   - **Project URL** → Use this for `VITE_SUPABASE_URL`
   - **Project API keys** → **anon public** → Use this for `VITE_SUPABASE_ANON_KEY`

### 3. Database Setup

Make sure your Supabase database has the `profiles` table with the following structure:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 4. Disable Email Authentication Confirmation

**Important:** In your Supabase dashboard:
1. Go to Authentication → Settings
2. Under the "Email" section, **DISABLE** "Enable email confirmations"
3. This allows users to sign up and immediately sign in without email verification
4. Save the settings

### 5. Test the Setup

After setting up the environment variables:
1. Restart your development server: `npm run dev`
2. Try to sign up with a new account
3. You should be immediately signed in without needing to verify your email
4. Check if the user appears in your Supabase Auth users table
5. Check if a profile is created in the profiles table

## Troubleshooting

### "useAuth must be used within an AuthProvider" Error
This error usually occurs due to React StrictMode double-mounting components. The updated AuthContext should handle this properly.

### Profile not created in Supabase
1. Check that your environment variables are correctly set
2. Check the browser console for any errors
3. Verify that your profiles table has the correct structure and RLS policies
4. Make sure email confirmation is disabled in Supabase settings

### Authentication not working
1. Ensure your Supabase project URL and anon key are correct
2. Check that email confirmation is **disabled** in Supabase
3. Look for any error messages in the browser console 