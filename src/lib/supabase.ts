import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Gym {
  id: string
  name: string
  location: string
  rating: number
  reviews: number
  image: string
  amenities: string[]
  description: string
  schedule: Record<string, string>
  price: string
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

// Utility functions
export async function getGyms() {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .order('rating', { ascending: false })

  if (error) {
    console.error('Error fetching gyms:', error)
    return []
  }

  return data
}

export async function getGymById(id: string) {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching gym:', error)
    return null
  }

  return data
}

export async function getTrainers() {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .order('rating', { ascending: false })

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
    .textSearch('name', query)
    .order('rating', { ascending: false })

  if (error) {
    console.error('Error searching gyms:', error)
    return []
  }

  return data
}

export async function searchTrainers(query: string) {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .textSearch('name', query)
    .order('rating', { ascending: false })

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