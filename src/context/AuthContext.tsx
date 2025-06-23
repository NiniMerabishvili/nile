import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, type Profile, createCoachProfile } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isGymOwner: boolean
  isCoach: boolean
  signUp: (email: string, password: string, fullName: string, isGymOwner?: boolean, isCoach?: boolean) => Promise<{ user: User | null }>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Computed properties
  const isAdmin = profile?.role === 'admin'
  const isGymOwner = profile?.role === 'gym_owner'
  const isCoach = profile?.role === 'coach'

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
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          setLoading(true)
          await fetchOrCreateProfile(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setLoading(false)
        } else if (session?.user) {
          setUser(session.user)
          if (!profile) {
            setLoading(true)
            await fetchOrCreateProfile(session.user)
          }
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [initialized, profile])

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
          // Check if user has gym owner flag in metadata
          const isGymOwnerFromMetadata = user.user_metadata?.is_gym_owner || false
          await createProfile(user, isGymOwnerFromMetadata)
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

  const createProfile = async (user: User, isGymOwner: boolean = false, isCoach: boolean = false) => {
    try {
      const isGymOwnerFromMetadata = user.user_metadata?.is_gym_owner || isGymOwner
      const isCoachFromMetadata = user.user_metadata?.is_coach || isCoach
      
      let role: 'user' | 'gym_owner' | 'coach' = 'user'
      if (isCoachFromMetadata) {
        role = 'coach'
      } else if (isGymOwnerFromMetadata) {
        role = 'gym_owner'
      }

      const profileData = {
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        role
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
      
      // Do NOT automatically create coach profile - they need to complete step 2
      if (isCoachFromMetadata) {
        toast.success('Account created! Please complete your coach profile to start offering services.')
      }
      
    } catch (error) {
      console.error('Failed to create profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      setLoading(true)
      await fetchOrCreateProfile(user)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, isGymOwner: boolean = false, isCoach: boolean = false) => {
    setLoading(true)
    try {
      console.log('Starting signup with gym owner:', isGymOwner, 'coach:', isCoach)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: fullName,
            is_gym_owner: isGymOwner,
            is_coach: isCoach
          }
        }
      })

      if (error) throw error

      if (data.user) {
        console.log('User created:', data.user)
        await createProfile(data.user, isGymOwner, isCoach)
        setUser(data.user)
        toast.success('Account created and signed in successfully!')
        return { user: data.user }
      }
      
      return { user: null }
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
      
      // Force immediate state update
      setUser(data.user)
      
      // Fetch profile immediately
      if (data.user) {
        await fetchOrCreateProfile(data.user)
      }
      
      toast.success('Signed in successfully!')
      
    } catch (error: any) {
      console.error('Signin error:', error)
      toast.error(error.message || 'Failed to sign in')
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log('Signing out...')
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Force immediate state reset
      setUser(null)
      setProfile(null)
      
      console.log('Signout successful')
      toast.success('Signed out successfully!')
      
    } catch (error: any) {
      console.error('Signout error:', error)
      toast.error(error.message || 'Failed to sign out')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isGymOwner,
      isCoach,
      signUp,
      signIn,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 