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
  LockClosedIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { supabase, getGymsByOwner, getIncompleteCoachProfile, type Gym } from '@/lib/supabase'
import toast from 'react-hot-toast'
import CoachRegistrationForm from '@/components/CoachRegistrationForm'
import { Link } from 'react-router-dom'

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
  const [incompleteCoachProfile, setIncompleteCoachProfile] = useState<any>(null)
  const [showCoachForm, setShowCoachForm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isCoach = profile?.role === 'coach'

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

  useEffect(() => {
    if (isCoach && user) {
      checkCoachProfileCompletion()
    }
  }, [isCoach, user])

  const checkCoachProfileCompletion = async () => {
    if (!user) return
    
    try {
      console.log('Checking coach profile completion for user:', user.id)
      const incompleteProfile = await getIncompleteCoachProfile(user.id)
      console.log('Incomplete profile result:', incompleteProfile)
      if (incompleteProfile) {
        setIncompleteCoachProfile(incompleteProfile)
      } else {
        setIncompleteCoachProfile(null)
      }
    } catch (error) {
      console.error('Error checking coach profile completion:', error)
    }
  }

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

      console.log('Starting upload for file:', file.name)

      // Clean up the user's avatar folder to ensure only one avatar exists.
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('profiles')
        .list(user.id)

      if (listError) {
        console.log('Could not list storage directory, probably first upload.', listError.message)
      } else if (existingFiles && existingFiles.length > 0) {
        console.log('Removing existing files:', existingFiles)
        const filesToRemove = existingFiles.map((file) => `${user.id}/${file.name}`)
        const { error: removeError } = await supabase.storage.from('profiles').remove(filesToRemove)
        if (removeError) {
          console.error('Failed to remove old avatar:', removeError.message)
        }
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`

      console.log('Uploading to path:', filePath)

      // Upload new image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      console.log('Upload successful, getting public URL')

      // Get the public URL
      const { data } = supabase.storage.from('profiles').getPublicUrl(filePath)

      if (!data.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image')
      }

      console.log('Public URL obtained:', data.publicUrl)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw updateError
      }

      console.log('Profile updated successfully')

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

  const handleCoachProfileComplete = async () => {
    // Refresh the profile and check completion status
    await refreshProfile()
    await checkCoachProfileCompletion()
    setShowCoachForm(false)
    toast.success('Coach profile completed successfully!')
  }

  const requestPasswordView = async () => {
    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(profileData.email, {
        redirectTo: `${window.location.origin}/profile`
      })
      
      if (error) throw error
      
      setPasswordRequested(true)
      toast.success('Password reset link sent to your email!')
    } catch (error: any) {
      console.error('Error requesting password reset:', error)
      toast.error(error.message || 'Failed to send password reset email')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-dark-100 dark:via-dark-200 dark:to-dark-100 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Please sign in to view your profile
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-dark-100 dark:via-dark-200 dark:to-dark-100">
      <div className="container mx-auto px-4 py-8">
        {/* Coach Profile Completion Alert */}
        {isCoach && incompleteCoachProfile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Complete Your Coach Profile
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  Your coach registration is incomplete. Please complete your profile to get verified and appear on the trainers page.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowCoachForm(true)}
                    className="btn-primary flex items-center"
                  >
                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                    Complete Profile
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Coach Registration Form Modal */}
        {showCoachForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-200 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Complete Your Coach Profile
                  </h2>
                  <button
                    onClick={() => setShowCoachForm(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <CoachRegistrationForm
                  onSuccess={handleCoachProfileComplete}
                  onBack={() => setShowCoachForm(false)}
                  loading={loading}
                  setLoading={setLoading}
                />
              </div>
            </div>
          </div>
        )}

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
                        const fallback = target.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
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
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profileData.full_name || 'User'}
                  </h1>
                  {profile.role === 'admin' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      <ShieldCheckIcon className="w-4 h-4" />
                      Admin
                    </div>
                  )}
                  {profile.role === 'gym_owner' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      Gym Owner
                    </div>
                  )}
                  {profile.role === 'coach' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <AcademicCapIcon className="w-4 h-4" />
                      Coach
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">{profileData.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Member since {new Date(profile.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary flex items-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  disabled={!isEditing}
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={profileData.phone_number}
                  onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                  disabled={!isEditing}
                  className="input-field pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value="••••••••"
                  disabled
                  className="input-field pl-10 pr-20"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={requestPasswordView}
                    disabled={passwordRequested}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    {passwordRequested ? 'Sent' : 'Reset'}
                  </button>
                </div>
              </div>
              {passwordRequested && (
                <p className="text-sm text-green-600 mt-1">
                  Password reset link sent to your email!
                </p>
              )}
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  // Reset form data
                  setProfileData({
                    full_name: profile.full_name || '',
                    email: profile.email || '',
                    phone_number: (profile as any).phone_number || '',
                    avatar_url: profile.avatar_url
                  })
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </motion.div>

        {/* Gym Owner Section */}
        {(isAdmin || isGymOwner) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BuildingOfficeIcon className="w-6 h-6" />
                Your Gyms
              </h2>
            </div>

            {gymsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading your gyms...</p>
              </div>
            ) : userGyms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGyms.map((gym) => (
                  <div
                    key={gym.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(gym.status).includes('green') ? 'bg-green-500' : 
                                        getStatusColor(gym.status).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{gym.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{gym.address}, {gym.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/edit-gym/${gym.id}`}
                          className="flex items-center space-x-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 
                                   hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span>Edit</span>
                        </Link>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gym.status)}`}>
                          {gym.status.charAt(0).toUpperCase() + gym.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BuildingOfficeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No gyms registered yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start by adding your first gym to get approved and listed.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
} 