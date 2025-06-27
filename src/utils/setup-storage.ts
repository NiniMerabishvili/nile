import { supabase } from '@/lib/supabase'

export async function setupGymImageStorage() {
  try {
    // Create the bucket
    const { error: bucketError } = await supabase.storage.createBucket('gym-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760 // 10MB
    })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Error creating bucket:', bucketError)
      throw bucketError
    }

    console.log('Gym images storage bucket created successfully')
    return true
  } catch (error) {
    console.error('Error setting up gym image storage:', error)
    throw error
  }
} 