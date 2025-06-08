import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, type Profile } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initialized) return

    setInitialized(true)

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchOrCreateProfile(session.user)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          setLoading(true)
          await fetchOrCreateProfile(session.user)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [initialized])

  const fetchOrCreateProfile = async (user: User) => {
    try {
      console.log('Fetching profile for user:', user.id)
      
      // Try to fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.log('Profile fetch error:', error)
        
        // If profile doesn't exist (PGRST116 = no rows), create it
        if (error.code === 'PGRST116') {
          console.log('Creating new profile...')
          await createProfile(user)
        } else {
          console.error('Error fetching profile:', error)
          setLoading(false)
        }
      } else {
        console.log('Profile found:', data)
        setProfile(data)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error in fetchOrCreateProfile:', error)
      setLoading(false)
    }
  }

  const createProfile = async (user: User) => {
    try {
      const profileData = {
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        role: 'user' as const
      }

      console.log('Creating profile with data:', profileData)

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        throw error
      }

      console.log('Profile created successfully:', data)
      setProfile(data)
      
    } catch (error) {
      console.error('Failed to create profile:', error)
      // Still set loading to false even if profile creation fails
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    try {
      console.log('Starting signup...')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) throw error

      if (data.user) {
        console.log('User created:', data.user)
        
        // If user is immediately confirmed, create profile
        if (data.user.email_confirmed_at) {
          await createProfile(data.user)
        }
        
        toast.success('Account created successfully! Please check your email to verify your account.')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Failed to create account')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log('Starting signin...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      console.log('Signin successful:', data.user)
      
      // Profile creation will be handled by the onAuthStateChange listener
      toast.success('Signed in successfully!')
      
    } catch (error: any) {
      console.error('Signin error:', error)
      toast.error(error.message || 'Failed to sign in')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Signed out successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 