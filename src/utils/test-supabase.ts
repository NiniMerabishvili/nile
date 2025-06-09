// Test utility to check Supabase connection
import { supabase } from '../lib/supabase'

export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('Environment variables:')
  console.log('- VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables!')
    console.log('\n📝 To fix this:')
    console.log('1. Create a .env file in your project root')
    console.log('2. Add your Supabase credentials:')
    console.log('   VITE_SUPABASE_URL=https://your-project-id.supabase.co')
    console.log('   VITE_SUPABASE_ANON_KEY=your-anon-key')
    console.log('3. Restart your development server')
    return false
  }
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Supabase connection error:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Current session:', data.session ? 'User logged in' : 'No active session')
    
    // Test profiles table access
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (profileError) {
        console.warn('⚠️ Profiles table access error:', profileError.message)
        console.log('Make sure you have created the profiles table in your Supabase database')
      } else {
        console.log('✅ Profiles table accessible')
      }
    } catch (err) {
      console.warn('⚠️ Profiles table test failed:', err)
    }
    
    return true
  } catch (error) {
    console.error('❌ Supabase test failed:', error)
    return false
  }
}

// Call this in development mode
if (import.meta.env.DEV) {
  testSupabaseConnection()
} 