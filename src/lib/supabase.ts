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
  id: number  // int8 from your table
  created_at: string  // timestamptz
  owner_id: string  // uuid
  owner_name?: string  // Added owner_name property
  name: string  // text
  description: string  // text
  address: string  // text
  city: string  // text
  country: string  // text
  phone_number: string  // text
  email: string  // text
  website: string  // text
  images: string[]  // text[]
  latitude: number  // float8
  longitude: number  // float8 (note: your column might be named 'longtitude' - we'll handle this)
  status: 'pending' | 'approved' | 'rejected'  // text with default 'pending'
  categories?: Category[]  // Will be populated when fetching with categories
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

// Update the CoachWithGymInfo interface to handle the role type properly
export interface CoachWithGymInfo {
  id: string
  bio?: string
  specialties: string[]
  experience_years: number
  certifications: string[]
  platform_fee_percentage: number
  is_verified: boolean
  created_at: string
  updated_at: string
  gym_id?: string | null
  name?: string
  profile?: {
    id: string
    username?: string
    full_name?: string
    email?: string
    avatar_url?: string
    role: 'user' | 'admin' | 'gym_owner' | 'coach'  // Use the proper union type
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
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching trainers:', error)
    return []
  }

  return data
}

export async function getTrainerById(id: string) {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching trainer:', error)
    return null
  }

  return data
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

export async function searchTrainers(query: string) {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .or(`name.ilike.%${query}%,specialty.ilike.%${query}%,location.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching trainers:', error)
    return []
  }

  return data
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
  const { data } = supabase.storage.from('gym-images').getPublicUrl(path)
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
    
    const { data, error } = await supabase
      .from('coaches')
      .select(`
        *,
        profiles:id (
          full_name,
          email,
          username,
          avatar_url
        )
      `)
      .eq('gym_id', gymId)

    if (error) {
      console.error('Error fetching coaches by gym:', error)
      throw error
    }

    console.log('Coaches by gym data:', data)
    
    // Transform the data to handle both user coaches and gym coaches
    const transformedData = data?.map(coach => ({
      ...coach,
      // Use profile name if available (for user coaches), otherwise use coach name (for gym coaches)
      display_name: coach.profiles?.full_name || coach.name || 'Unknown Coach',
      profile: coach.profiles
    })) || []

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

// Get coach profile by ID
export async function getCoachProfile(userId: string) {
  try {
    console.log('getCoachProfile called with userId:', userId)
    
    // First, get the profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('role', 'coach')
      .single()

    if (profileError || !profile) {
      console.error('Error fetching coach profile:', profileError)
      return null
    }

    console.log('Profile found:', profile)

    // Then get the coach-specific data
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .select('*')
      .eq('id', userId)
      .single()

    if (coachError || !coachData) {
      console.error('Error fetching coach data:', coachError)
      // Return profile data even if coach data is missing (for incomplete profiles)
      return {
        id: profile.id,
        bio: '',
        specialties: [],
        experience_years: 0,
        certifications: [],
        platform_fee_percentage: 5.0,
        is_verified: false,
        gym_id: null,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
        profile: profile
      }
    }

    console.log('Coach data found:', coachData)

    // Combine the data
    const combinedData = {
      ...coachData,
      profile: profile
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

  const { data, error } = await supabase
    .from('gyms')
    .update({
      ...gymData,
      updated_at: new Date().toISOString()
    })
    .eq('id', gymId)
    .eq('owner_id', user.id) // Ensure only the owner can update their gym
    .select()
    .single()

  if (error) {
    console.error('Error updating gym:', error)
    throw error
  }

  return data as Gym
}

// Add this new function to create gym coaches (without user accounts)
export async function createGymCoach(coachData: {
  name: string
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
    
    // Create coach record without user account
    const { data, error } = await supabase
      .from('coaches')
      .insert([{ 
        id: coachId, // Generate a random UUID for gym coaches
        name: coachData.name, // Use the name field for gym coaches
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

    return data as Coach
  } catch (error) {
    console.error('Error creating gym coach:', error)
    throw error
  }
}

// Update the getAllCoachesWithGymInfo function to properly fetch user coach names
export async function getAllCoachesWithGymInfo(): Promise<CoachWithGymInfo[]> {
  try {
    console.log('🔍 Fetching all coaches with gym info...')
    
    // First, let's check if there are any coaches at all
    const { data: simpleCoaches, error: simpleError } = await supabase
      .from('coaches')
      .select('*')
    
    console.log('Simple coaches query result:', { simpleCoaches, simpleError })

    // Get all coaches including both user coaches and gym coaches
    // Note: The LEFT JOIN will work for user coaches, and return null profiles for gym coaches
    const { data: allCoaches, error: coachesError } = await supabase
      .from('coaches')
      .select(`
        *,
        profiles!left (
          id,
          full_name,
          email,
          username,
          avatar_url,
          role
        ),
        gyms:gym_id (
          id,
          name,
          city,
          country,
          address
        )
      `)
      .order('created_at', { ascending: false })

    console.log('Complex coaches query result:', { allCoaches, coachesError })

    if (coachesError) {
      console.error('Error fetching coaches with gym info:', coachesError)
      
      // Fallback: try to get coaches and profiles separately
      console.log('Falling back to separate queries...')
      if (simpleCoaches && simpleCoaches.length > 0) {
        // Get profiles for user coaches
        const userCoachIds = simpleCoaches
          .filter(coach => !coach.name) // User coaches don't have a name field
          .map(coach => coach.id)
        
        let profiles = []
        if (userCoachIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userCoachIds)
          profiles = profilesData || []
        }

        // Get gyms for gym coaches
        const gymCoachIds = simpleCoaches
          .filter(coach => coach.gym_id)
          .map(coach => coach.gym_id)
        
        let gyms = []
        if (gymCoachIds.length > 0) {
          const { data: gymsData } = await supabase
            .from('gyms')
            .select('*')
            .in('id', gymCoachIds)
          gyms = gymsData || []
        }

        return simpleCoaches.map(coach => {
          const profile = profiles.find(p => p.id === coach.id)
          const gym = gyms.find(g => g.id === coach.gym_id)
          
          return {
            id: coach.id || '',
            bio: coach.bio,
            specialties: coach.specialties || [],
            experience_years: coach.experience_years || 0,
            certifications: coach.certifications || [],
            platform_fee_percentage: coach.platform_fee_percentage || 5.0,
            is_verified: coach.is_verified || false,
            created_at: coach.created_at || '',
            updated_at: coach.updated_at || '',
            gym_id: coach.gym_id,
            name: coach.name,
            profile: profile ? {
              id: profile.id,
              username: profile.username,
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url,
              role: profile.role as 'user' | 'admin' | 'gym_owner' | 'coach'
            } : null,
            gym: gym ? {
              id: gym.id,
              name: gym.name,
              city: gym.city,
              country: gym.country,
              address: gym.address
            } : null,
            display_name: profile?.full_name || coach.name || 'Unknown Coach',
            coach_type: profile ? 'user_coach' : 'gym_coach'
          }
        })
      }
      return []
    }

    if (!allCoaches || allCoaches.length === 0) {
      console.log('No coaches found in database')
      return []
    }

    // Transform the data to handle both types of coaches
    const transformedData: CoachWithGymInfo[] = allCoaches.map(coach => {
      console.log('Processing coach:', {
        id: coach.id,
        name: coach.name,
        profile: coach.profiles,
        hasProfile: !!coach.profiles,
        profileFullName: coach.profiles?.full_name
      })

      return {
        id: coach.id || '',
        bio: coach.bio,
        specialties: coach.specialties || [],
        experience_years: coach.experience_years || 0,
        certifications: coach.certifications || [],
        platform_fee_percentage: coach.platform_fee_percentage || 5.0,
        is_verified: coach.is_verified || false,
        created_at: coach.created_at || '',
        updated_at: coach.updated_at || '',
        gym_id: coach.gym_id,
        name: coach.name,
        // Profile data (for user coaches) - with proper role casting
        profile: coach.profiles ? {
          id: coach.profiles.id,
          username: coach.profiles.username,
          full_name: coach.profiles.full_name,
          email: coach.profiles.email,
          avatar_url: coach.profiles.avatar_url,
          role: coach.profiles.role as 'user' | 'admin' | 'gym_owner' | 'coach'
        } : null,
        // Gym data (for gym coaches)
        gym: coach.gyms ? {
          id: coach.gyms.id,
          name: coach.gyms.name,
          city: coach.gyms.city,
          country: coach.gyms.country,
          address: coach.gyms.address
        } : null,
        // Helper to get display name - prioritize profile full_name for user coaches
        display_name: coach.profiles?.full_name || coach.name || 'Unknown Coach',
        // Type identification
        coach_type: coach.profiles ? 'user_coach' : 'gym_coach'
      }
    })

    console.log(`✅ Found ${transformedData.length} coaches (including gym coaches)`, transformedData)
    return transformedData
  } catch (error) {
    console.error('Error in getAllCoachesWithGymInfo:', error)
    return []
  }
} 