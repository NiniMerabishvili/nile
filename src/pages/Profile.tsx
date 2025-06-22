import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { supabase, getGymsByOwner, type Gym } from '@/lib/supabase'
import toast from 'react-hot-toast'
import GymImageDisplay from '@/components/GymImageDisplay'

interface ProfileData {
  full_name: string
  email: string
  phone_number: string
  avatar_url?: string
}

export default function Profile() {
  const { user, profile, refreshProfile, isAdmin, isGymOwner } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone_number: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordRequested, setPasswordRequested] = useState(false)
  const [userGyms, setUserGyms] = useState<Gym[]>([])
  const [gymsLoading, setGymsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone_number: (profile as any).phone_number || '',
        avatar_url: profile.avatar_url
      })
    }
  }, [profile])

  useEffect(() => {
    if ((isAdmin || isGymOwner) && user) {
      fetchUserGyms()
    }
  }, [isAdmin, isGymOwner, user])

  const fetchUserGyms = async () => {
    if (!user) return
    
    setGymsLoading(true)
    try {
      const gyms = await getGymsByOwner(user.id)
      setUserGyms(gyms)
    } catch (error) {
      console.error('Error fetching user gyms:', error)
      toast.error('Failed to load your gyms')
    } finally {
      setGymsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!user) {
        throw new Error('You must be logged in to upload an image.')
      }

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.')
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB.')
      }

      // Clean up the user's avatar folder to ensure only one avatar exists.
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('profiles')
        .list(user.id)

      if (listError) {
        // This can happen if the folder doesn't exist yet, which is fine.
        console.log('Could not list storage directory, probably first upload.', listError.message)
      } else if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map((file) => `${user.id}/${file.name}`)
        const { error: removeError } = await supabase.storage.from('profiles').remove(filesToRemove)
        if (removeError) {
          console.error('Failed to remove old avatar:', removeError.message)
          // Don't block upload, just log the error.
        }
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`

      // Upload new image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath)

      if (!data.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image')
      }

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setProfileData((prev) => ({ ...prev, avatar_url: data.publicUrl }))

      // Refresh profile context
      await refreshProfile()

      toast.success('Profile photo updated successfully!')

      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error(error.message || 'Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          email: profileData.email,
          phone_number: profileData.phone_number,
        })
        .eq('id', user?.id)

      if (error) throw error

      await refreshProfile()
      setIsEditing(false)
      toast.success('Profile updated successfully!')
      
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const requestPasswordView = async () => {
    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(profileData.email, {
        redirectTo: `${window.location.origin}/profile?show_password=true`
      })

      if (error) throw error

      setPasswordRequested(true)
      toast.success('Password reveal link sent to your email!')
      
    } catch (error: any) {
      console.error('Error requesting password view:', error)
      toast.error(error.message || 'Failed to send password reveal email')
    }
  }

  // Check URL params for password reveal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('show_password') === 'true') {
      setShowPassword(true)
      // Clean URL
      window.history.replaceState({}, '', '/profile')
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-300 border-4 border-white dark:border-dark-100 shadow-lg">
                {profileData.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.setAttribute('style', 'display: flex')
                    }}
                  />
                ) : null}
                
                {/* Fallback icon - always present but hidden if image loads */}
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ display: profileData.avatar_url ? 'none' : 'flex' }}
                >
                  <UserCircleIcon className="w-20 h-20 text-gray-400 dark:text-gray-600" />
                </div>
              </div>
              
              {/* Upload Button Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center w-full h-full rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label="Change profile picture"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <div className="flex flex-col items-center text-white">
                      <CameraIcon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Change</span>
                    </div>
                  )}
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                aria-label="Upload profile picture"
              />
              
              {/* Upload progress indicator */}
              {uploading && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    Uploading...
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profileData.full_name || 'User'}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                <span>{profileData.email}</span>
                {(isAdmin || isGymOwner) && (
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline">•</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isAdmin 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    }`}>
                      {isAdmin ? (
                        <>
                          <ShieldCheckIcon className="w-4 h-4 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                          Gym Owner
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-500">
                Member since {new Date(profile.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex justify-center lg:justify-end">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                className="input-field"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-300 px-4 py-3 rounded-xl">
                {profileData.full_name || 'Not provided'}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="input-field"
                placeholder="Enter your email"
              />
            ) : (
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-300 px-4 py-3 rounded-xl">
                {profileData.email || 'Not provided'}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <PhoneIcon className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.phone_number}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                className="input-field"
                placeholder="Enter your phone number"
              />
            ) : (
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-300 px-4 py-3 rounded-xl">
                {profileData.phone_number || 'Not provided'}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <LockClosedIcon className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <div className="relative">
              {showPassword ? (
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-300 px-4 py-3 rounded-xl flex-1">
                    ••••••••••••
                  </p>
                  <button
                    onClick={() => setShowPassword(false)}
                    className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <EyeSlashIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-300 px-4 py-3 rounded-xl flex-1">
                    ••••••••••••
                  </p>
                  <button
                    onClick={passwordRequested ? undefined : requestPasswordView}
                    disabled={passwordRequested}
                    className={`p-3 ${passwordRequested 
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                    title={passwordRequested ? 'Check your email for password reveal link' : 'Click to reveal password (requires email verification)'}
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {passwordRequested && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                Password reveal link sent to your email. Check your inbox!
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* User's Gyms Section (for gym owners and admins) */}
      {(isGymOwner || isAdmin) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BuildingOfficeIcon className="w-6 h-6 mr-2" />
              Your Gyms {userGyms.length > 0 && `(${userGyms.length})`}
            </h2>
          </div>

          {gymsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : userGyms.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                You haven't uploaded any gyms yet
              </p>
              <a href="/add-gym" className="btn-primary">
                Add Your First Gym
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGyms.map((gym) => (
                <motion.div
                  key={gym.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 dark:bg-dark-300 rounded-xl p-6 hover-card"
                >
                  {/* Gym Image */}
                  {gym.images && gym.images.length > 0 && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <GymImageDisplay 
                                  images={gym.images}
                                  className="w-full h-full object-cover" gymName={''}                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {gym.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(gym.status)}`}>
                      {gym.status}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {gym.description}
                  </p>

                  <div className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    📍 {[gym.city, gym.country].filter(Boolean).join(', ')}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      Added {new Date(gym.created_at).toLocaleDateString()}
                    </span>
                    {gym.status === 'approved' && (
                      <a
                        href={`/gyms/${gym.id}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-500 text-sm font-medium"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
} 