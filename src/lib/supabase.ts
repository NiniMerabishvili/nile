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

    // Transform the data to flatten categories
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
    .textSearch('name', query)
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
  const { error } = await supabase
    .from('contact_messages')
    .insert([formData])

  if (error) {
    console.error('Error submitting contact form:', error)
    throw error
  }

  return true
}

// Auth utility functions
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
    password
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

  return data as Profile
}

// Admin functions for gym management
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
      // Fallback to basic gym data
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

    // Transform the data to flatten categories
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
      // Fallback to basic gym data
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

    // Transform the data to flatten categories
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
      // Fallback to basic gym data
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

    // Transform the data to flatten categories
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

// Updated function to create a gym (for gym owners) with optional categories
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

// Function to get gyms by owner
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
      // Fallback to basic gym data
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

    // Transform the data to flatten categories
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

// Add these interfaces after the existing ones

export interface Coach {
  id: string
  bio?: string
  specialties: string[]
  experience_years: number
  certifications: string[]
  platform_fee_percentage: number
  is_verified: boolean
  created_at: string
  updated_at: string
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

// Coach-related functions
export async function getCoaches() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        coaches(*)
      `)
      .eq('role', 'coach')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching coaches:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCoaches:', error)
    return []
  }
}

export async function createCoachProfile(coachData: Omit<Coach, 'id' | 'created_at' | 'updated_at'>) {
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
    .insert([{ ...coachData, id: user.id }])
    .select()
    .single()

  if (error) {
    console.error('Error creating coach profile:', error)
    throw new Error(error.message || 'Failed to create coach profile')
  }

  return data as Coach
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

// Public function for approved tutorials only (equivalent to getGyms)
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
      console.error('Error fetching approved tutorials:', error)
      return []
    }

    return (data as Tutorial[]) || []
  } catch (error) {
    console.error('Error in getTutorials:', error)
    return []
  }
}

// Enhanced debug function
export async function debugTutorials() {
  try {
    const { data, error } = await supabase
      .from('tutorials')
      .select(`
        id,
        title,
        status,
        coach_id,
        is_published,
        created_at,
        coach:profiles!tutorials_coach_id_fkey(full_name, email, role)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching debug tutorials:', error);
      return [];
    }

    console.log('All tutorials in database:', data);
    console.log('Tutorial breakdown:');
    console.log('- Pending:', data?.filter(t => t.status === 'pending').length || 0);
    console.log('- Approved:', data?.filter(t => t.status === 'approved').length || 0);
    console.log('- Rejected:', data?.filter(t => t.status === 'rejected').length || 0);
    console.log('- Published:', data?.filter(t => t.is_published).length || 0);
    
    return data || [];
  } catch (error) {
    console.error('Error in debugTutorials:', error);
    return [];
  }
} 