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

// Updated Gym interface to match your actual table structure
export interface Gym {
  id: number  // int8 from your table
  created_at: string  // timestamptz
  owner_id: string  // uuid
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
  avatar_url?: string
  role: 'user' | 'admin' | 'gym_owner'
  created_at?: string
  updated_at?: string
}

// Updated utility functions for your table structure
export async function getGyms() {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching gyms:', error)
    return []
  }

  return data as Gym[]
}

export async function getGymById(id: number) {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching gym:', error)
    return null
  }

  return data as Gym
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
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%,address.ilike.%${query}%`)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching gyms:', error)
    return []
  }

  return data as Gym[]
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
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// Admin functions for gym management
export async function getPendingGyms() {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending gyms:', error)
    return []
  }

  return data as Gym[]
}

export async function getAllGyms() {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all gyms:', error)
    return []
  }

  return data as Gym[]
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
    .insert([{ ...gymData, status: 'pending' }])
    .select()
    .single()

  if (error) {
    console.error('Error creating gym:', error)
    throw error
  }

  return data as Gym
}

export async function getGymsByStatus(status: 'pending' | 'approved' | 'rejected') {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`Error fetching ${status} gyms:`, error)
    return []
  }

  return data as Gym[]
}

export function getImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('your-bucket-name')  // Replace with your bucket name
    .getPublicUrl(path)
  
  return data.publicUrl
}

// New function to create a gym (for gym owners)
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
    throw new Error('User must be authenticated')
  }

  const gymWithOwner = {
    ...gymData,
    owner_id: user.id,
    status: 'pending' as const
  }

  const { data, error } = await supabase
    .from('gyms')
    .insert([gymWithOwner])
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
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching owner gyms:', error)
    return []
  }

  return data as Gym[]
} 