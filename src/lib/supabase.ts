import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Please create a .env file in your project root with:')
  console.error('VITE_SUPABASE_URL=your_supabase_project_url')
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.error('You can find these values in your Supabase project settings.')
  
  // Create a dummy client to prevent app crashes during development
  // This allows the app to run but auth won't work until env vars are set
  if (import.meta.env.DEV) {
    console.warn('Creating dummy Supabase client for development. Auth will not work!')
  }
  
  throw new Error(`Missing Supabase environment variables: ${!supabaseUrl ? 'VITE_SUPABASE_URL' : ''} ${!supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : ''}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Category interface
export interface Category {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Updated Gym interface to match your actual table structure
export interface Gym {
  id: string | number  // Temporarily allow both until data is migrated
  created_at: string
  updated_at?: string
  owner_id: string
  owner_name?: string
  name: string
  description: string
  address: string
  city: string
  country: string
  phone_number: string
  email: string
  website: string
  images: string[]
  latitude: number
  longitude: number
  status: 'pending' | 'approved' | 'rejected'
  categories?: Category[]
}

// Gym to Categories relationship
export interface GymToCategory {
  id: string
  gym_id: string
  category_id: string
  created_at: string
}

export interface Trainer {
  id: string
  name: string
  specialty: string
  location: string
  rating: number
  reviews: number
  image: string
  experience: string
  price: string
  bio: string
  certifications: string[]
  specialties: string[]
  availability: Record<string, string>
}

export interface Profile {
  id: string
  username?: string
  full_name?: string
  email?: string
  phone_number?: string
  avatar_url?: string
  role: 'user' | 'admin' | 'gym_owner' | 'coach'
  created_at?: string
  updated_at?: string
}

export interface Coach {
  id?: string  // Make id optional since we'll generate it
  name?: string  // Add name field for gym coaches
  photo?: string  // Add photo field for coaches
  bio?: string
  specialties: string[]
  experience_years: number
  certifications: string[]
  platform_fee_percentage: number
  is_verified: boolean
  gym_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface Tutorial {
  id: string
  coach_id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  category: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  duration_minutes?: number
  price: number
  coach_earnings: number
  platform_fee: number
  tags: string[]
  is_published: boolean
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  coach?: Profile
}

export interface TutorialPackage {
  id: string
  coach_id: string
  name: string
  description?: string
  package_type: 'bundle' | 'monthly_subscription'
  price: number
  coach_earnings: number
  platform_fee: number
  duration_days?: number
  tutorial_ids: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  tutorials?: Tutorial[]
  coach?: Profile
}

export interface FeedbackRequest {
  id: string
  user_id: string
  coach_id: string
  title: string
  description: string
  workout_video_urls: string[]
  price: number
  coach_earnings: number
  platform_fee: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  feedback_text?: string
  feedback_video_url?: string
  submitted_at: string
  completed_at?: string
  created_at: string
  updated_at: string
  user?: Profile
  coach?: Profile
}

export interface Purchase {
  id: string
  user_id: string
  coach_id: string
  item_type: 'tutorial' | 'package' | 'feedback'
  item_id: string
  amount: number
  platform_fee: number
  coach_earnings: number
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  expires_at?: string
  created_at: string
}

// Booking interfaces
export interface Booking {
  id: string
  user_id: string
  coach_id: string
  start_date: string // DATE in YYYY-MM-DD format
  end_date: string // DATE in YYYY-MM-DD format  
  start_time: string // TIME in HH:MM format
  end_time: string // TIME in HH:MM format
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  package_type: 'single' | '5pack' | '10pack'
  total_price: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface UnavailableDate {
  id: string
  coach_id: string
  start_date: string // DATE in YYYY-MM-DD format
  end_date: string // DATE in YYYY-MM-DD format
  reason?: string
  created_at: string
}

export interface TimeSlot {
  time: string
  available: boolean
  reason?: string // Why it's unavailable (if not available)
}

// Update the CoachWithGymInfo interface to handle the role type properly
export interface CoachWithGymInfo {
  id: string
  name?: string
  photo?: string  // Add photo field
  bio?: string
  specialties: string[]
  experience_years: number
  certifications: string[]
  platform_fee_percentage: number
  is_verified: boolean
  created_at: string
  updated_at: string
  gym_id?: string | null
  profile?: {
    id: string
    username?: string
    full_name?: string
    email?: string
    avatar_url?: string
    role: 'user' | 'admin' | 'gym_owner' | 'coach'
  } | null
  gym?: {
    id: string
    name: string
    city: string
    country: string
    address: string
  } | null
  display_name: string
  coach_type: 'user_coach' | 'gym_coach'
}

// Category-related functions
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return (data as Category[]) || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('You must be signed in to create categories')
  }

  // Check if user has permission (admin or gym_owner)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'gym_owner'].includes(profile.role)) {
    throw new Error('You do not have permission to create categories. Only admins and gym owners can create categories.')
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    throw new Error(error.message || 'Failed to create category')
  }

  return data as Category
}

// Updated utility functions for gyms
export async function getGyms() {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        categories:gyms_to_categories(
          category_id,
          categories(*)
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gyms:', error)
      // Fallback to basic gym data if categories tables don't exist
      const { data: basicData, error: basicError } = await supabase
        .from('gyms')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching basic gyms:', basicError)
        return []
      }

      return (basicData as Gym[]) || []
    }

    // Transform the data to flatten categories if they exist
    const transformedData = data?.map(gym => ({
      ...gym,
      categories: gym.categories?.map((gc: any) => gc.categories).filter(Boolean) || []
    })) || []

    return transformedData as Gym[]
  } catch (error) {
    console.error('Error in getGyms:', error)
    return []
  }
}

export async function getGymById(id: string | number) {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        categories:gyms_to_categories(
          category_id,
          categories(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching gym:', error)
      // Fallback to basic gym data if categories tables don't exist
      const { data: basicData, error: basicError } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', id)
        .single()

      if (basicError) {
        console.error('Error fetching basic gym:', basicError)
        return null
      }

      return basicData as Gym
    }

    // Transform the data to flatten categories if they exist
    const transformedData = {
      ...data,
      categories: data.categories?.map((gc: any) => gc.categories).filter(Boolean) || []
    }

    return transformedData as Gym
  } catch (error) {
    console.error('Error in getGymById:', error)
    return null
  }
}

export async function createGymWithCategories(
  gymData: Omit<Gym, 'id' | 'created_at' | 'categories'>, 
  categoryIds: string[]
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to create a gym')
  }

  // First, create the gym
  const { data: gym, error: gymError } = await supabase
    .from('gyms')
    .insert([{
      ...gymData,
      owner_id: user.id,
      status: 'pending'
    }])
    .select()
    .single()

  if (gymError) {
    console.error('Error creating gym:', gymError)
    throw gymError
  }

  // Then, create the category relationships if categories exist and IDs are provided
  if (categoryIds.length > 0) {
    try {
      const categoryRelations = categoryIds.map(categoryId => ({
        gym_id: gym.id.toString(),
        category_id: categoryId
      }))

      const { error: categoryError } = await supabase
        .from('gyms_to_categories')
        .insert(categoryRelations)

      if (categoryError) {
        console.error('Error creating gym categories:', categoryError)
        // Note: We don't throw here as the gym was created successfully
      }
    } catch (error) {
      console.error('Category tables may not exist yet:', error)
      // This is fine - categories are optional
    }
  }

  return gym as Gym
}

export async function updateGymCategories(gymId: string, categoryIds: string[]) {
  try {
    // First, delete existing category relationships
    await supabase
      .from('gyms_to_categories')
      .delete()
      .eq('gym_id', gymId)

    // Then, insert new category relationships
    if (categoryIds.length > 0) {
      const categoryRelations = categoryIds.map(categoryId => ({
        gym_id: gymId,
        category_id: categoryId
      }))

      const { error } = await supabase
        .from('gyms_to_categories')
        .insert(categoryRelations)

      if (error) {
        console.error('Error updating gym categories:', error)
        throw error
      }
    }
  } catch (error) {
    console.error('Error updating gym categories:', error)
    // Don't throw error if categories tables don't exist
  }
}

export async function getTrainers() {
  // Since the trainers table doesn't exist, return empty array
  console.warn('Trainers table does not exist, returning empty array')
  return []
}

export async function getTrainerById(_id: string) {
  console.warn('Trainers table does not exist, returning null')
  return null
}

export async function searchGyms(query: string) {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        categories:gyms_to_categories(
          category_id,
          categories(*)
        )
      `)
      .or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%,address.ilike.%${query}%`)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching gyms:', error)
      // Fallback to basic search
      const { data: basicData, error: basicError } = await supabase
        .from('gyms')
        .select('*')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%,address.ilike.%${query}%`)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error with basic search:', basicError)
        return []
      }

      return (basicData as Gym[]) || []
    }

    // Transform the data to flatten categories if they exist
    const transformedData = data?.map(gym => ({
      ...gym,
      categories: gym.categories?.map((gc: any) => gc.categories).filter(Boolean) || []
    })) || []

    return transformedData as Gym[]
  } catch (error) {
    console.error('Error in searchGyms:', error)
    return []
  }
}

export async function searchTrainers(_query: string) {
  console.warn('Trainers table does not exist, returning empty array')
  return []
}

export async function submitContactForm(formData: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert([formData])

  if (error) {
    console.error('Error submitting contact form:', error)
    throw error
  }

  return data
}

export async function signUp(email: string, password: string, fullName: string) {
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
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function getPendingGyms() {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        categories:gyms_to_categories(
          category_id,
          categories(*)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending gyms:', error)
      // Fallback to basic gym data if categories tables don't exist
      const { data: basicData, error: basicError } = await supabase
        .from('gyms')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching basic pending gyms:', basicError)
        return []
      }

      return (basicData as Gym[]) || []
    }

    // Transform the data to flatten categories if they exist
    const transformedData = data?.map(gym => ({
      ...gym,
      categories: gym.categories?.map((gc: any) => gc.categories).filter(Boolean) || []
    })) || []

    return transformedData as Gym[]
  } catch (error) {
    console.error('Error in getPendingGyms:', error)
    return []
  }
}

export async function getAllGyms() {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        categories:gyms_to_categories(
          category_id,
          categories(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all gyms:', error)
      // Fallback to basic gym data if categories tables don't exist
      const { data: basicData, error: basicError } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching basic gyms:', basicError)
        return []
      }

      return (basicData as Gym[]) || []
    }

    // Transform the data to flatten categories if they exist
    const transformedData = data?.map(gym => ({
      ...gym,
      categories: gym.categories?.map((gc: any) => gc.categories).filter(Boolean) || []
    })) || []

    return transformedData as Gym[]
  } catch (error) {
    console.error('Error in getAllGyms:', error)
    return []
  }
}

export async function updateGymStatus(gymId: number, status: 'approved' | 'rejected') {
  const { error } = await supabase
    .from('gyms')
    .update({ status })
    .eq('id', gymId)

  if (error) {
    console.error('Error updating gym status:', error)
    throw error
  }

  return true
}

export async function createGym(gymData: Omit<Gym, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('gyms')
    .insert([gymData])
    .select()
    .single()

  if (error) {
    console.error('Error creating gym:', error)
    throw error
  }

  return data as Gym
}

export async function getGymsByStatus(status: 'pending' | 'approved' | 'rejected') {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        categories:gyms_to_categories(
          category_id,
          categories(*)
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gyms by status:', error)
      // Fallback to basic gym data if categories tables don't exist
      const { data: basicData, error: basicError } = await supabase
        .from('gyms')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching basic gyms by status:', basicError)
        return []
      }

      return (basicData as Gym[]) || []
    }

    // Transform the data to flatten categories if they exist
    const transformedData = data?.map(gym => ({
      ...gym,
      categories: gym.categories?.map((gc: any) => gc.categories).filter(Boolean) || []
    })) || []

    return transformedData as Gym[]
  } catch (error) {
    console.error('Error in getGymsByStatus:', error)
    return []
  }
}

export function getImageUrl(path: string): string {
  const { data } = supabase.storage.from('gymimages').getPublicUrl(path)
  return data.publicUrl
}

export async function createGymByOwner(gymData: {
  name: string
  description: string
  address: string
  city: string
  country: string
  phone_number: string
  email: string
  website: string
  images: string[]
  latitude: number
  longitude: number
}) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to create a gym')
  }

  const { data, error } = await supabase
    .from('gyms')
    .insert([{
      ...gymData,
      owner_id: user.id,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating gym:', error)
    throw error
  }

  return data as Gym
}

export async function getGymsByOwner(ownerId: string) {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select(`
        *,
        categories:gyms_to_categories(
          category_id,
          categories(*)
        )
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gyms by owner:', error)
      // Fallback to basic gym data if categories tables don't exist
      const { data: basicData, error: basicError } = await supabase
        .from('gyms')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching basic gyms by owner:', basicError)
        return []
      }

      return (basicData as Gym[]) || []
    }

    // Transform the data to flatten categories if they exist
    const transformedData = data?.map(gym => ({
      ...gym,
      categories: gym.categories?.map((gc: any) => gc.categories).filter(Boolean) || []
    })) || []

    return transformedData as Gym[]
  } catch (error) {
    console.error('Error in getGymsByOwner:', error)
    return []
  }
}

// Coach-related functions
export async function getCoaches() {
  try {
    // First, get all profiles with role 'coach'
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'coach')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching coach profiles:', profilesError)
      return []
    }

    if (!profiles || profiles.length === 0) {
      console.log('No coach profiles found')
      return []
    }

    // Get coach IDs
    const coachIds = profiles.map(profile => profile.id)

    // Then, get coach-specific data
    const { data: coaches, error: coachesError } = await supabase
      .from('coaches')
      .select('*')
      .in('id', coachIds)

    if (coachesError) {
      console.error('Error fetching coach data:', coachesError)
      // Return profiles without coach data if coaches table query fails
      return profiles.map(profile => ({
        ...profile,
        coaches: null
      }))
    }

    // Combine the data
    const combinedData = profiles.map(profile => {
      const coachData = coaches?.find(coach => coach.id === profile.id)
      return {
        ...profile,
        coaches: coachData || null
      }
    })

    console.log(`Found ${combinedData.length} coaches`)
    return combinedData
  } catch (error) {
    console.error('Error in getCoaches:', error)
    return []
  }
}

export async function createCoachProfile(
  coachData: Omit<Coach, 'id' | 'created_at' | 'updated_at'>,
  gymId?: string | null
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('You must be signed in to create a coach profile')
  }

  // Update user role to coach
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'coach' })
    .eq('id', user.id)

  if (profileError) {
    throw new Error('Failed to update user role')
  }

  const { data, error } = await supabase
    .from('coaches')
    .insert([{ 
      ...coachData, 
      id: user.id,
      gym_id: gymId || null 
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating coach profile:', error)
    throw new Error(error.message || 'Failed to create coach profile')
  }

  return data as Coach
}

// Create coach for gym owner (creates user account + coach profile)
export async function createCoachForGym(
  coachData: Omit<Coach, 'id' | 'created_at' | 'updated_at'>,
  userEmail: string,
  userName: string,
  password: string,
  gymId?: string
) {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  if (!currentUser) {
    throw new Error('You must be signed in')
  }

  // Create user account for the coach
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userEmail,
    password: password,
    options: {
      data: {
        full_name: userName,
        is_coach: true
      }
    }
  })

  if (authError) {
    throw new Error(`Failed to create coach account: ${authError.message}`)
  }

  if (!authData.user) {
    throw new Error('Failed to create user account')
  }

  try {
    // Wait a moment for the user profile to be created by the trigger
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create coach profile
    const { data, error } = await supabase
      .from('coaches')
      .insert([{ 
        ...coachData, 
        id: authData.user.id,
        gym_id: gymId || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating coach profile:', error)
      throw new Error(error.message || 'Failed to create coach profile')
    }

    return data as Coach
  } catch (error) {
    console.error('Error creating coach profile:', error)
    throw error
  }
}

// Get coaches by gym
export async function getCoachesByGym(gymId: string) {
  try {
    console.log('getCoachesByGym called with gymId:', gymId)
    
    // First, get coaches for this gym
    const { data: coaches, error: coachesError } = await supabase
      .from('coaches')
      .select('*')
      .eq('gym_id', gymId)

    if (coachesError) {
      console.error('Error fetching coaches by gym:', coachesError)
      throw coachesError
    }

    if (!coaches || coaches.length === 0) {
      console.log('No coaches found for gym:', gymId)
      return []
    }

    // Get user IDs that have profiles (user coaches)
    const userCoachIds = coaches
      .filter(coach => !coach.name) // User coaches don't have a name field
      .map(coach => coach.id)
      .filter(Boolean)

    // Get profiles for user coaches
    let profiles: any[] = []
    if (userCoachIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('full_name, email, username, avatar_url')
        .in('id', userCoachIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      } else {
        profiles = profilesData || []
      }
    }

    console.log('Coaches by gym data:', coaches)
    
    // Transform the data to handle both user coaches and gym coaches
    const transformedData = coaches.map(coach => {
      const profile = profiles.find(p => p.id === coach.id)
      
      return {
        ...coach,
        // Use profile name if available (for user coaches), otherwise use coach name (for gym coaches)
        display_name: profile?.full_name || coach.name || 'Unknown Coach',
        profiles: profile || null // Use profiles key to match the interface in AddGym
      }
    })

    return transformedData
  } catch (error) {
    console.error('Error in getCoachesByGym:', error)
    throw error
  }
}

// Enhanced tutorial functions following gym system patterns
export async function getPendingTutorials() {
  try {
    const { data, error } = await supabase
      .from('tutorials')
      .select(`
        *,
        coach:profiles!tutorials_coach_id_fkey(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending tutorials:', error)
      // Fallback to basic tutorial data (following gym pattern)
      const { data: basicData, error: basicError } = await supabase
        .from('tutorials')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching basic pending tutorials:', basicError)
        return []
      }

      return (basicData as Tutorial[]) || []
    }

    return (data as Tutorial[]) || []
  } catch (error) {
    console.error('Error in getPendingTutorials:', error)
    return []
  }
}

export async function getAllTutorials() {
  try {
    const { data, error } = await supabase
      .from('tutorials')
      .select(`
        *,
        coach:profiles!tutorials_coach_id_fkey(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all tutorials:', error)
      // Fallback to basic tutorial data
      const { data: basicData, error: basicError } = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching basic tutorials:', basicError)
        return []
      }

      return (basicData as Tutorial[]) || []
    }

    return (data as Tutorial[]) || []
  } catch (error) {
    console.error('Error in getAllTutorials:', error)
    return []
  }
}

export async function updateTutorialStatus(tutorialId: string, status: 'approved' | 'rejected') {
  const { error } = await supabase
    .from('tutorials')
    .update({ status })
    .eq('id', tutorialId)

  if (error) {
    console.error('Error updating tutorial status:', error)
    throw error
  }

  return true
}

export async function createTutorial(tutorialData: Omit<Tutorial, 'id' | 'created_at' | 'updated_at' | 'coach_earnings' | 'platform_fee' | 'status' | 'coach_id'>) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to create a tutorial')
  }

  // Calculate earnings
  const platformFee = tutorialData.price * 0.05 // 5% platform fee
  const coachEarnings = tutorialData.price - platformFee

  const { data, error } = await supabase
    .from('tutorials')
    .insert([{
      ...tutorialData,
      coach_id: user.id,
      platform_fee: platformFee,
      coach_earnings: coachEarnings,
      status: 'pending'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating tutorial:', error)
    throw error
  }

  return data as Tutorial
}

export async function getTutorialsByStatus(status: 'pending' | 'approved' | 'rejected') {
  try {
    const { data, error } = await supabase
      .from('tutorials')
      .select(`
        *,
        coach:profiles!tutorials_coach_id_fkey(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tutorials by status:', error)
      // Fallback to basic tutorial data
      const { data: basicData, error: basicError } = await supabase
        .from('tutorials')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching basic tutorials by status:', basicError)
        return []
      }

      return (basicData as Tutorial[]) || []
    }

    return (data as Tutorial[]) || []
  } catch (error) {
    console.error('Error in getTutorialsByStatus:', error)
    return []
  }
}

export async function getAllTutorialsByCoach(coachId: string) {
  try {
    const { data, error } = await supabase
      .from('tutorials')
      .select(`
        *,
        coach:profiles!tutorials_coach_id_fkey(*)
      `)
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tutorials by coach:', error)
      // Fallback to basic tutorial data
      const { data: basicData, error: basicError } = await supabase
        .from('tutorials')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching basic tutorials by coach:', basicError)
        return []
      }

      return (basicData as Tutorial[]) || []
    }

    return (data as Tutorial[]) || []
  } catch (error) {
    console.error('Error in getAllTutorialsByCoach:', error)
    return []
  }
}

export async function getTutorials() {
  try {
    const { data, error } = await supabase
      .from('tutorials')
      .select(`
        *,
        coach:profiles!tutorials_coach_id_fkey(*)
      `)
      .eq('status', 'approved')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching published tutorials:', error)
      return []
    }

    return (data as Tutorial[]) || []
  } catch (error) {
    console.error('Error in getTutorials:', error)
    return []
  }
}

export async function debugTutorials() {
  try {
    const { data: allTutorials, error } = await supabase
      .from('tutorials')
      .select('*')

    console.log('All tutorials in database:', allTutorials)
    
    if (error) {
      console.error('Error in debugTutorials:', error)
      return []
    }

    return allTutorials || []
  } catch (error) {
    console.error('Error in debugTutorials:', error)
    return []
  }
}

// Get verified coaches for public display
export async function getVerifiedCoaches() {
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'coach')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching coach profiles:', profilesError)
      return []
    }

    if (!profiles || profiles.length === 0) {
      return []
    }

    const coachIds = profiles.map(profile => profile.id)

    const { data: coaches, error: coachesError } = await supabase
      .from('coaches')
      .select('*')
      .in('id', coachIds)
      .eq('is_verified', true) // Only get verified coaches

    if (coachesError) {
      console.error('Error fetching verified coaches:', coachesError)
      return profiles.map(profile => ({
        ...profile,
        coaches: null
      }))
    }

    const combinedData = profiles
      .map(profile => {
        const coachData = coaches?.find(coach => coach.id === profile.id)
        return coachData ? {
          ...profile,
          coaches: coachData
        } : null
      })
      .filter(Boolean) // Remove null entries (unverified coaches)

    return combinedData
  } catch (error) {
    console.error('Error in getVerifiedCoaches:', error)
    return []
  }
}

// Admin function to verify/unverify coaches
export async function updateCoachVerificationStatus(coachId: string, isVerified: boolean) {
  try {
    const { data, error } = await supabase
      .from('coaches')
      .update({ is_verified: isVerified })
      .eq('id', coachId)
      .select()
      .single()

    if (error) {
      console.error('Error updating coach verification:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateCoachVerificationStatus:', error)
    throw error
  }
}

// Check if coach profile is complete
export async function isCoachProfileComplete(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return false
    }

    // Check if all required fields are filled
    const requiredFields = [
      data.bio && data.bio.trim().length > 0,
      data.specialties && data.specialties.length > 0,
      data.experience_years !== null && data.experience_years > 0,
      data.certifications && data.certifications.length > 0
    ]

    return requiredFields.every(field => field)
  } catch (error) {
    console.error('Error checking coach profile completion:', error)
    return false
  }
}

// Get incomplete coach profile if exists
export async function getIncompleteCoachProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return null
    }

    const isComplete = await isCoachProfileComplete(userId)
    if (isComplete) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching incomplete coach profile:', error)
    return null
  }
}

// Updated getCoachProfile function to handle both user coaches and gym coaches
export async function getCoachProfile(coachId: string) {
  try {
    console.log('getCoachProfile called with coachId:', coachId)
    
    // First, get the coach data from coaches table
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', coachId)
      .single()

    if (coachError || !coachData) {
      console.error('Error fetching coach data:', coachError)
      return null
    }

    console.log('Coach data found:', coachData)

    // Check if this is a user coach (no name field) or gym coach (has name field)
    let profile = null
    
    // If coach doesn't have a name field, it's a user coach - try to get profile
    if (!coachData.name) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', coachId)
        .single()

      if (!profileError && profileData) {
        profile = profileData
        console.log('Profile found for user coach:', profile)
      }
    }

    // Get gym info if coach is associated with a gym
    let gym = null
    if (coachData.gym_id) {
      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .select('id, name, city, country, address')
        .eq('id', coachData.gym_id)
        .single()

      if (!gymError && gymData) {
        gym = gymData
        console.log('Gym found for coach:', gym)
      }
    }

    // Combine the data
    const combinedData = {
      ...coachData,
      profile: profile,
      gym: gym,
      // Helper fields for display
      display_name: profile?.full_name || coachData.name || 'Unknown Coach',
      coach_type: profile ? 'user_coach' : 'gym_coach'
    }

    console.log('Combined coach profile data:', combinedData)
    return combinedData
  } catch (error) {
    console.error('Error in getCoachProfile:', error)
    return null
  }
}

// Update coach profile
export async function updateCoachProfile(
  userId: string, 
  updateData: Partial<Omit<Coach, 'id' | 'created_at' | 'updated_at'>>
) {
  try {
    const { data, error } = await supabase
      .from('coaches')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating coach profile:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateCoachProfile:', error)
    throw error
  }
}

// Refresh profile function for compatibility
export async function refreshProfile() {
  // This function might be used in other components
  // It should refresh the current user's profile
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return await getUserProfile(user.id)
  }
  return null
}

export async function checkGymNameExists(name: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select('id')
      .eq('name', name.trim())
      .limit(1)

    if (error) {
      console.error('Error checking gym name:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error in checkGymNameExists:', error)
    return false
  }
}

// Add this debug function to help troubleshoot
export async function debugGymAccess(gymId: string, userId: string) {
  console.log('🔍 DEBUG: Starting gym access check', { gymId, userId })
  
  try {
    // Check if gym exists at all
    const { data: allGyms } = await supabase
      .from('gyms')
      .select('id, owner_id, name, status')
      .limit(10)
    
    console.log('🔍 DEBUG: All gyms sample:', allGyms)
    
    // Check specific gym
    const { data: specificGym, error: specificError } = await supabase
      .from('gyms')
      .select('id, owner_id, name, status')
      .eq('id', gymId)
      .single()
    
    console.log('🔍 DEBUG: Specific gym lookup:', {
      gymId,
      found: !!specificGym,
      gymData: specificGym,
      error: specificError
    })
    
    // Check user's gyms
    const { data: userGyms, error: userGymsError } = await supabase
      .from('gyms')
      .select('id, owner_id, name, status')
      .eq('owner_id', userId)
    
    console.log('🔍 DEBUG: User\'s gyms:', {
      userId,
      count: userGyms?.length || 0,
      gyms: userGyms,
      error: userGymsError
    })
    
    return {
      allGyms,
      specificGym,
      userGyms,
      gymExists: !!specificGym,
      isOwner: specificGym?.owner_id === userId
    }
    
  } catch (error) {
    console.error('🔍 DEBUG: Error in debug function:', error)
    return null
  }
}

// Ultra-detailed debugging version of updateGymByOwner
export async function updateGymByOwner(gymId: string, gymData: {
  name: string
  description: string
  address: string
  city: string
  country: string
  phone_number: string
  email: string
  website: string
  images: string[]
  latitude: number
  longitude: number
}) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to update a gym')
  }

  console.log('🔍 ULTRA DEBUG - Starting gym update:', {
    gymId,
    gymIdType: typeof gymId,
    gymIdLength: gymId?.length,
    userId: user.id,
    userIdType: typeof user.id,
    userRole: user.user_metadata?.role,
    isGymOwner: user.user_metadata?.is_gym_owner
  })

  try {
    // Step 1: Check if gym exists at all
    console.log('📍 Step 1: Checking if gym exists...')
    const { data: gymExists, error: existError } = await supabase
      .from('gyms')
      .select('id, name, owner_id, status')
      .eq('id', gymId)
      .single()

    console.log('📍 Step 1 result:', {
      exists: !!gymExists,
      gymData: gymExists,
      error: existError
    })

    if (existError) {
      if (existError.code === 'PGRST116') {
        throw new Error(`Gym with ID "${gymId}" does not exist in the database`)
      }
      throw new Error(`Database error checking gym existence: ${existError.message}`)
    }

    // Step 2: Check ownership
    console.log('📍 Step 2: Checking ownership...')
    const isOwner = gymExists.owner_id === user.id
    console.log('📍 Step 2 result:', {
      gymOwnerId: gymExists.owner_id,
      currentUserId: user.id,
      isOwner,
      ownerIdType: typeof gymExists.owner_id,
      userIdType: typeof user.id
    })

    if (!isOwner) {
      throw new Error(`Access denied. Gym "${gymExists.name}" belongs to user ${gymExists.owner_id}, but you are ${user.id}`)
    }

    // Step 3: Attempt the update
    console.log('📍 Step 3: Attempting update...')
    const { data: updateResult, error: updateError } = await supabase
      .from('gyms')
      .update(gymData)
      .eq('id', gymId)
      .eq('owner_id', user.id)
      .select()

    console.log('📍 Step 3 result:', {
      updateResult,
      updateError,
      resultCount: updateResult?.length || 0
    })

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`)
    }

    if (!updateResult || updateResult.length === 0) {
      // This is the specific error you're getting
      console.error('🚨 UPDATE RETURNED NO ROWS - Detailed investigation:')
      
      // Let's check what happened
      const { data: recheckGym } = await supabase
        .from('gyms')
        .select('id, name, owner_id, status, updated_at')
        .eq('id', gymId)
        .single()
      
      console.error('🚨 Gym status after failed update:', recheckGym)
      
      throw new Error(`Update query completed but no rows were affected. Gym still exists: ${!!recheckGym}`)
    }

    console.log('✅ Update successful:', updateResult[0])
    return updateResult[0] as Gym

  } catch (error: any) {
    console.error('❌ ULTRA DEBUG - Complete error details:', {
      error,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details
    })
    throw error
  }
}

// Add this new function to create gym coaches (without user accounts)
export async function createGymCoach(coachData: {
  name: string
  photo?: string  // Add photo field
  bio: string
  specialties: string[]
  experience_years: number
  certifications: string[]
  platform_fee_percentage: number
  is_verified: boolean
  gym_id?: string | null
}) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('You must be signed in')
  }

  try {
    // Generate a UUID for gym coaches (not linked to auth.users)
    const coachId = self.crypto.randomUUID() // Use self.crypto instead of crypto
    
    // Create coach record without user account - FIXED: Added photo field
    const { data, error } = await supabase
      .from('coaches')
      .insert([{ 
        id: coachId, // Generate a random UUID for gym coaches
        name: coachData.name, // Use the name field for gym coaches
        photo: coachData.photo, // ✅ FIXED: Include photo field in the insert
        bio: coachData.bio,
        specialties: coachData.specialties,
        experience_years: coachData.experience_years,
        certifications: coachData.certifications,
        platform_fee_percentage: coachData.platform_fee_percentage,
        is_verified: coachData.is_verified,
        gym_id: coachData.gym_id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating gym coach:', error)
      throw new Error(error.message || 'Failed to create coach')
    }

    console.log('✅ Coach created successfully with photo:', data)
    return data as Coach
  } catch (error) {
    console.error('Error creating gym coach:', error)
    throw error
  }
}

// Update the getAllCoachesWithGymInfo function to avoid foreign key relationship issues
export async function getAllCoachesWithGymInfo(): Promise<CoachWithGymInfo[]> {
  try {
    console.log('🔍 Fetching all coaches with gym info...')
    
    // First, get all coaches
    const { data: coaches, error: coachesError } = await supabase
      .from('coaches')
      .select('*')
      .order('created_at', { ascending: false })

    if (coachesError) {
      console.error('Error fetching coaches:', coachesError)
      return []
    }

    if (!coaches || coaches.length === 0) {
      console.log('No coaches found in database')
      return []
    }

    // Get unique coach IDs that have profiles (user coaches)
    const userCoachIds = coaches
      .filter(coach => !coach.name) // User coaches don't have a name field
      .map(coach => coach.id)
      .filter(Boolean)

    // Get profiles for user coaches
    let profiles: any[] = []
    if (userCoachIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userCoachIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      } else {
        profiles = profilesData || []
      }
    }

    // Get unique gym IDs
    const gymIds = coaches
      .map(coach => coach.gym_id)
      .filter(Boolean)

    // Get gyms for gym coaches
    let gyms: any[] = []
    if (gymIds.length > 0) {
      const { data: gymsData, error: gymsError } = await supabase
        .from('gyms')
        .select('*')
        .in('id', gymIds)

      if (gymsError) {
        console.error('Error fetching gyms:', gymsError)
      } else {
        gyms = gymsData || []
      }
    }

    // Transform the data to handle both types of coaches
    const transformedData: CoachWithGymInfo[] = coaches.map(coach => {
      const profile = profiles.find(p => p.id === coach.id)
      const gym = gyms.find(g => g.id === coach.gym_id)

      return {
        id: coach.id || '',
        name: coach.name,
        photo: coach.photo, // Include photo field
        bio: coach.bio,
        specialties: coach.specialties || [],
        experience_years: coach.experience_years || 0,
        certifications: coach.certifications || [],
        platform_fee_percentage: coach.platform_fee_percentage || 5.0,
        is_verified: coach.is_verified || false,
        created_at: coach.created_at || '',
        updated_at: coach.updated_at || '',
        gym_id: coach.gym_id,
        // Profile data (for user coaches)
        profile: profile ? {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
          role: profile.role as 'user' | 'admin' | 'gym_owner' | 'coach'
        } : null,
        // Gym data (for gym coaches)
        gym: gym ? {
          id: gym.id,
          name: gym.name,
          city: gym.city,
          country: gym.country,
          address: gym.address
        } : null,
        // Helper to get display name
        display_name: profile?.full_name || coach.name || 'Unknown Coach',
        // Type identification
        coach_type: profile ? 'user_coach' : 'gym_coach'
      }
    })

    console.log(`✅ Found ${transformedData.length} coaches (including gym coaches)`, transformedData)
    return transformedData
  } catch (error) {
    console.error('Error in getAllCoachesWithGymInfo:', error)
    return []
  }
}

// Function to upload gym image
export async function uploadGymImage(file: File, gymId?: string): Promise<string> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('You must be logged in to upload images')
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file')
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size must be less than 10MB')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase()
  const folder = gymId || user.id
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

  // Upload to Supabase Storage using 'gymimages' bucket
  const { error: uploadError } = await supabase.storage
    .from('gymimages')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  // Get public URL
  const { data } = supabase.storage
    .from('gymimages')
    .getPublicUrl(fileName)

  if (!data.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image')
  }

  return data.publicUrl
}

// Function to delete gym image
export async function deleteGymImage(imageUrl: string): Promise<void> {
  if (!imageUrl.includes('gymimages')) {
    return // Not an uploaded image, skip deletion
  }

  try {
    const pathMatch = imageUrl.match(/gymimages\/(.+)$/)
    if (pathMatch) {
      const filePath = pathMatch[1]
      const { error } = await supabase.storage
        .from('gymimages')
        .remove([filePath])
      
      if (error) {
        console.error('Error deleting image from storage:', error)
        throw error
      }
    }
  } catch (error) {
    console.error('Error deleting gym image:', error)
    throw error
  }
}

// Function to cleanup gym images when gym is deleted
export async function cleanupGymImages(gymId: string): Promise<void> {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('gymimages')
      .list(gymId)

    if (listError) {
      console.error('Error listing gym images:', listError)
      return
    }

    if (files && files.length > 0) {
      const filesToRemove = files.map((file) => `${gymId}/${file.name}`)
      const { error: removeError } = await supabase.storage
        .from('gymimages')
        .remove(filesToRemove)

      if (removeError) {
        console.error('Error removing gym images:', removeError)
        throw removeError
      }
    }
  } catch (error) {
    console.error('Error cleaning up gym images:', error)
    throw error
  }
}

// ==================== BOOKING FUNCTIONS ====================

// Get coach availability for a specific date
export async function getCoachAvailability(coachId: string, date: string): Promise<TimeSlot[]> {
  try {
    const dayOfWeek = new Date(date).getDay()
    
    // Generate base time slots based on day
    const baseSlots: TimeSlot[] = []
    
    // Skip Sundays (0)
    if (dayOfWeek === 0) {
      return []
    }

    // Different hours for weekdays vs Saturday
    const startHour = dayOfWeek === 6 ? 8 : 6 // Saturday starts at 8 AM, weekdays at 6 AM
    const endHour = dayOfWeek === 6 ? 14 : 20 // Saturday ends at 2 PM, weekdays at 8 PM

    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      baseSlots.push({
        time,
        available: true
      })
    }

    // Check for existing bookings on this date
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_time, end_time, status')
      .eq('coach_id', coachId)
      .eq('start_date', date)
      .in('status', ['confirmed', 'pending'])

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      throw bookingsError
    }

    // Check for unavailable dates (includes both manual blocks and booked sessions)
    const { data: unavailableDates, error: unavailableError } = await supabase
      .from('unavailable_dates')
      .select('reason')
      .eq('coach_id', coachId)
      .lte('start_date', date)
      .gte('end_date', date)

    if (unavailableError) {
      console.error('Error fetching unavailable dates:', unavailableError)
      throw unavailableError
    }

    // Check if entire day is marked unavailable (manual coach block)
    const dayBlockedManually = unavailableDates?.find(ud => 
      !ud.reason?.includes('Booked session') && !ud.reason?.includes('(')
    )
    
    if (dayBlockedManually) {
      return baseSlots.map(slot => ({
        ...slot,
        available: false,
        reason: dayBlockedManually.reason || 'Unavailable'
      }))
    }

    // Mark time slots as unavailable based on bookings AND unavailable_dates
    const availableSlots = baseSlots.map(slot => {
      const slotTime = parseInt(slot.time.split(':')[0])
      
      // Check direct bookings from bookings table
      const isBookedFromBookings = bookings?.some(booking => {
        const startTime = parseInt(booking.start_time.split(':')[0])
        const endTime = parseInt(booking.end_time.split(':')[0])
        return slotTime >= startTime && slotTime < endTime
      })

      // Check booked sessions from unavailable_dates table
      const isBookedFromUnavailable = unavailableDates?.some(unavailable => {
        if (!unavailable.reason?.includes('Booked session')) return false
        
        // Extract time range from reason like "Booked session (09:00 - 10:00)"
        const timeMatch = unavailable.reason.match(/\((\d{2}:\d{2}) - (\d{2}:\d{2})\)/)
        if (!timeMatch) return false
        
        const startTime = parseInt(timeMatch[1].split(':')[0])
        const endTime = parseInt(timeMatch[2].split(':')[0])
        return slotTime >= startTime && slotTime < endTime
      })

      // Check for other manual unavailable periods for specific times
      const isManuallyUnavailable = unavailableDates?.some(unavailable => {
        if (unavailable.reason?.includes('Booked session')) return false
        
        // If it's a specific time block, check if it matches
        const timeMatch = unavailable.reason?.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/)
        if (timeMatch) {
          const startTime = parseInt(timeMatch[1].split(':')[0])
          const endTime = parseInt(timeMatch[2].split(':')[0])
          return slotTime >= startTime && slotTime < endTime
        }
        
        return false // General day blocks are handled above
      })

      const isUnavailable = isBookedFromBookings || isBookedFromUnavailable || isManuallyUnavailable
      let reason = undefined
      
      if (isBookedFromBookings || isBookedFromUnavailable) {
        reason = 'Already booked'
      } else if (isManuallyUnavailable) {
        reason = 'Unavailable'
      }

      return {
        ...slot,
        available: !isUnavailable,
        reason
      }
    })

    return availableSlots
  } catch (error) {
    console.error('Error getting coach availability:', error)
    throw error
  }
}

// Create a new booking using database function
export async function createBooking({
  coachId,
  date,
  startTime,
  duration, // in minutes
  price,
  notes
}: {
  coachId: string
  date: string // YYYY-MM-DD format
  startTime: string // HH:MM format
  duration: number
  price: number
  notes?: string
}): Promise<Booking> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('You must be logged in to book a session')
    }

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`

    // Check availability before booking
    const availability = await getCoachAvailability(coachId, date)
    const requestedSlot = availability.find(slot => slot.time === startTime)
    
    if (!requestedSlot || !requestedSlot.available) {
      throw new Error('This time slot is no longer available')
    }

    // For longer sessions, check if all consecutive slots are available
    if (duration > 60) {
      const slotsNeeded = Math.ceil(duration / 60)
      for (let i = 0; i < slotsNeeded; i++) {
        const checkHour = hours + i
        const checkTime = `${checkHour.toString().padStart(2, '0')}:00`
        const slot = availability.find(s => s.time === checkTime)
        if (!slot || !slot.available) {
          throw new Error(`Time slot ${checkTime} is not available for this ${duration}-minute session`)
        }
      }
    }

    console.log('🚀 Creating booking with function...', {
      p_coach_id: coachId,
      p_start_date: date,
      p_end_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_total_price: price,
      p_notes: notes || null,
      p_unavailable_reason: `Booked session (${startTime} - ${endTime})`
    })

    // Use the database function to create booking and block time slot atomically
    const { data: bookingId, error: functionError } = await supabase.rpc(
      'create_booking_with_unavailable_date',
      {
        p_coach_id: coachId,
        p_start_date: date,
        p_end_date: date,
        p_start_time: startTime,
        p_end_time: endTime,
        p_total_price: price,
        p_notes: notes || null,
        p_unavailable_reason: `Booked session (${startTime} - ${endTime})`
      }
    )

    if (functionError) {
      console.error('❌ Database function error:', functionError)
      throw new Error(`Failed to create booking: ${functionError.message}`)
    }

    console.log('✅ Booking created with ID:', bookingId)

    // Fetch the created booking to return
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (fetchError) {
      console.error('Error fetching created booking:', fetchError)
      throw new Error('Booking created but failed to retrieve details')
    }

    console.log('✅ Booking details retrieved:', booking)
    return booking as Booking
  } catch (error) {
    console.error('❌ Complete booking error:', error)
    throw error
  }
}

// Get bookings for a user
export async function getUserBookings(): Promise<Booking[]> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('You must be logged in to view bookings')
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching user bookings:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error getting user bookings:', error)
    throw error
  }
}

// Get bookings for a coach
export async function getCoachBookings(coachId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('coach_id', coachId)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching coach bookings:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error getting coach bookings:', error)
    throw error
  }
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)

    if (error) {
      console.error('Error updating booking status:', error)
      throw error
    }
  } catch (error) {
    console.error('Error updating booking status:', error)
    throw error
  }
}

// Check if a specific date and time is available
export async function checkTimeSlotAvailability(
  coachId: string, 
  date: string, 
  startTime: string,
  duration: number = 60
): Promise<boolean> {
  try {
    const availability = await getCoachAvailability(coachId, date)
    const requestedSlot = availability.find(slot => slot.time === startTime)
    
    // For longer sessions, check if consecutive slots are also available
    if (duration > 60) {
      const [hours] = startTime.split(':').map(Number)
      const slotsNeeded = Math.ceil(duration / 60)
      
      for (let i = 0; i < slotsNeeded; i++) {
        const checkHour = hours + i
        const checkTime = `${checkHour.toString().padStart(2, '0')}:00`
        const slot = availability.find(s => s.time === checkTime)
        if (!slot || !slot.available) {
          return false
        }
      }
    }
    
    return requestedSlot?.available || false
  } catch (error) {
    console.error('Error checking time slot availability:', error)
    return false
  }
}

// Password Recovery Functions
export async function resetPassword(email: string) {
  // Dynamically determine the redirect URL based on environment
  const redirectTo = window.location.origin + '/reset-password';
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) throw error
  return data
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) throw error
  return data
}

// Cancel a booking and remove from unavailable_dates
export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('You must be logged in to cancel a booking')
    }

    // Get the booking details first
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id) // Only allow users to cancel their own bookings
      .single()

    if (fetchError || !booking) {
      throw new Error('Booking not found or you do not have permission to cancel it')
    }

    // Update booking status to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (updateError) {
      throw updateError
    }

    // Remove from unavailable_dates to free up the time slot
    const { error: removeError } = await supabase
      .from('unavailable_dates')
      .delete()
      .eq('coach_id', booking.coach_id)
      .eq('start_date', booking.start_date)
      .eq('end_date', booking.end_date)
      .like('reason', `%Booked session (${booking.start_time} - ${booking.end_time})%`)

    if (removeError) {
      console.error('Error removing from unavailable_dates:', removeError)
      // Don't throw error here - booking is already cancelled
    }

  } catch (error) {
    console.error('Error cancelling booking:', error)
    throw error
  }
} 

// Debug function to test booking system
export async function debugBookingSystem(coachId: string, date: string) {
  console.log('🔍 DEBUG: Testing booking system...')
  
  try {
    // Test 1: Check if tables exist
    const { data: bookingsTest } = await supabase
      .from('bookings')
      .select('count(*)', { count: 'exact', head: true })
    
    const { data: unavailableTest } = await supabase
      .from('unavailable_dates')
      .select('count(*)', { count: 'exact', head: true })
    
    console.log('✅ Tables exist:', { bookingsTest, unavailableTest })
    
    // Test 2: Check function exists
    const { data: functionTest, error: functionError } = await supabase.rpc(
      'create_booking_with_unavailable_date',
      {
        p_coach_id: coachId,
        p_start_date: date,
        p_end_date: date,
        p_start_time: '09:00',
        p_end_time: '10:00',
        p_total_price: 50.00,
        p_notes: 'DEBUG TEST - DELETE ME',
        p_unavailable_reason: 'DEBUG TEST'
      }
    )
    
    if (functionError) {
      console.error('❌ Function error:', functionError)
    } else {
      console.log('✅ Function works, booking ID:', functionTest)
      
      // Clean up test booking
      await supabase.from('bookings').delete().eq('id', functionTest)
      await supabase.from('unavailable_dates').delete().match({
        coach_id: coachId,
        reason: 'DEBUG TEST'
      })
    }
    
  } catch (error) {
    console.error('🔍 DEBUG error:', error)
  }
}

// Debug function to test the booking system
export async function debugBookingSetup() {
  console.log('🔍 Testing booking system setup...')
  
  try {
    // Test 1: Check if function exists
    const { data: testResult, error: testError } = await supabase.rpc('check_date_availability', {
      p_coach_id: '00000000-0000-0000-0000-000000000000',
      p_start_date: '2024-12-09',
      p_end_date: '2024-12-09'
    })
    
    console.log('✅ Functions exist and work:', { testResult, testError })
    
    // Test 2: Check table access
    const { data: bookingsTest } = await supabase.from('bookings').select('count', { count: 'exact', head: true })
    const { data: unavailableTest } = await supabase.from('unavailable_dates').select('count', { count: 'exact', head: true })
    
    console.log('✅ Tables accessible:', { bookingsTest, unavailableTest })
    
    return true
  } catch (error) {
    console.error('❌ Setup test failed:', error)
    return false
  }
}