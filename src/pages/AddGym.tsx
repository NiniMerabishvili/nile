import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GymCoachRegistrationForm from '../components/GymCoachRegistrationForm'
import GymImageUploader from '../components/GymImageUploader'
import {
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  UserGroupIcon,
  PlusIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { createGymByOwner, getCoachesByGym, updateGymByOwner } from '@/lib/supabase'
import SimpleLocationSelector from '@/components/SimpleLocationSelector'
import toast from 'react-hot-toast'

interface Coach {
  id: string
  bio: string
  specialties: string[]
  experience_years: number
  certifications: string[]
  profiles: {
    full_name: string
    email: string
  }
}

export default function AddGym() {
  const { isGymOwner } = useAuth()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState<'gym' | 'coaches'>('gym')
  const [tempGymId, setTempGymId] = useState<string | null>(null)
  const [addedCoaches, setAddedCoaches] = useState<Coach[]>([])
  const [showCoachForm, setShowCoachForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone_number: '',
    email: '',
    website: '',
    images: [] as string[],
    latitude: 0,
    longitude: 0
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isGymOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <InformationCircleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
              Access Denied
            </h1>
            <p className="text-red-700 dark:text-red-300">
              You need to be a gym owner to access this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLocationChange = (location: {
    address: string
    city: string
    country: string
    latitude: number
    longitude: number
  }) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      city: location.city,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    }))
  }

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const handleGymSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.name || !formData.description) {
        throw new Error('Please fill in gym name and description')
      }

      if (!formData.address || !formData.city || !formData.country) {
        throw new Error('Please select a location using the map or search')
      }

      if (!formData.phone_number || !formData.email) {
        throw new Error('Please provide contact information')
      }

      let gym
      
      // If we already have a gym created, update it instead of creating new one
      if (tempGymId) {
        gym = await updateGymByOwner(tempGymId, formData)
        toast.success('Gym details updated! You can continue adding coaches.')
      } else {
        // Create new gym
        gym = await createGymByOwner(formData)
        setTempGymId(gym.id.toString())
        toast.success('Gym details saved! Now you can add coaches (optional).')
      }
      
      setCurrentStep('coaches')
      
    } catch (err: any) {
      console.error('Error creating/updating gym:', err)
      
      // Handle specific database errors
      if (err?.code === '23505' && err?.message?.includes('gym_name_key')) {
        setError('A gym with this name already exists. Please choose a different name.')
      } else {
        setError(err.message || 'Failed to submit gym. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCoachSuccess = async () => {
    setShowCoachForm(false)
    if (tempGymId) {
      // Refresh coaches list
      try {
        const coaches = await getCoachesByGym(tempGymId)
        setAddedCoaches(coaches)
        toast.success('Coach added successfully!')
      } catch (error) {
        console.error('Error fetching coaches:', error)
      }
    }
  }

  const handleFinish = () => {
    toast.success('Gym and coaches submitted successfully! Your gym will be reviewed by our admin team.')
    navigate('/gym-owner')
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  if (showCoachForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <GymCoachRegistrationForm
          onSuccess={handleCoachSuccess}
          onBack={() => setShowCoachForm(false)}
          loading={loading}
          setLoading={setLoading}
          gymId={tempGymId}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="max-w-4xl mx-auto"
      >
        {currentStep === 'gym' && (
          <>
            <div className="text-center mb-8">
              <BuildingOfficeIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Add Your Gym
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Share your gym details with potential members
              </p>
            </div>

            <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-xl p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleGymSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gym Name *
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="input-field pl-10"
                        placeholder="Enter gym name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="input-field pl-10"
                        placeholder="gym@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    className="input-field"
                    placeholder="Describe your gym, facilities, and what makes it special..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <SimpleLocationSelector
                    onLocationChange={handleLocationChange}
                    initialValues={{
                      address: formData.address,
                      city: formData.city,
                      country: formData.country,
                      latitude: formData.latitude,
                      longitude: formData.longitude
                    }}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone_number"
                        name="phone_number"
                        required
                        className="input-field pl-10"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website (Optional)
                    </label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        id="website"
                        name="website"
                        className="input-field pl-10"
                        placeholder="https://yourgym.com"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Replace the old Images section with the new component */}
                <GymImageUploader
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={12}
                />

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary text-lg py-3"
                  >
                    {loading ? 
                      (tempGymId ? 'Updating Gym Details...' : 'Saving Gym Details...') : 
                      (tempGymId ? 'Update & Continue to Coaches' : 'Next: Add Coaches')
                    }
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {currentStep === 'coaches' && (
          <>
            <div className="text-center mb-8">
              <UserGroupIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Add Coaches
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Add coaches to your gym (optional). You can always add more coaches later.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-xl p-8">
              {/* Added Coaches List */}
              {addedCoaches.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Added Coaches ({addedCoaches.length})
                  </h3>
                  <div className="space-y-4">
                    {addedCoaches.map((coach) => (
                      <div key={coach.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-300 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {coach.profiles.full_name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {coach.profiles.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              {coach.specialties.slice(0, 2).join(', ')}
                              {coach.specialties.length > 2 && ` +${coach.specialties.length - 2} more`}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {coach.experience_years} years exp.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Coach Button */}
              <div className="text-center mb-8">
                <button
                  onClick={() => setShowCoachForm(true)}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Add Coach</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep('gym')}
                  className="btn-secondary flex-1"
                >
                  Back to Gym Details
                </button>
                <button
                  onClick={handleFinish}
                  className="btn-primary flex-1"
                >
                  {addedCoaches.length > 0 ? 'Finish & Submit' : 'Skip & Submit Gym'}
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
} 