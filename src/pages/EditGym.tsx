import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { getGymById, updateGymByOwner, type Gym } from '@/lib/supabase'
import SimpleLocationSelector from '@/components/SimpleLocationSelector'
import GymImageUploader from '@/components/GymImageUploader'
import toast from 'react-hot-toast'

interface EditGymFormData {
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
}

export default function EditGym() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isGymOwner } = useAuth()
  const [gym, setGym] = useState<Gym | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<EditGymFormData>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone_number: '',
    email: '',
    website: '',
    images: [],
    latitude: 0,
    longitude: 0
  })

  useEffect(() => {
    const loadGym = async () => {
      if (!id || !user) return

      try {
        setLoading(true)
        setError(null)

        const gymData = await getGymById(id)
        if (!gymData) {
          setError('Gym not found')
          return
        }

        // Check ownership
        if (gymData.owner_id !== user.id) {
          setError('You are not authorized to edit this gym')
          return
        }

        setGym(gymData)
        setFormData({
          name: gymData.name || '',
          description: gymData.description || '',
          address: gymData.address || '',
          city: gymData.city || '',
          country: gymData.country || '',
          phone_number: gymData.phone_number || '',
          email: gymData.email || '',
          website: gymData.website || '',
          images: gymData.images || [],
          latitude: gymData.latitude || 0,
          longitude: gymData.longitude || 0
        })
      } catch (error) {
        console.error('Error loading gym:', error)
        setError('Failed to load gym data')
      } finally {
        setLoading(false)
      }
    }

    loadGym()
  }, [id, user])

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
    setFormData(prev => ({ ...prev, ...location }))
  }

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !user) return

    // Validation
    if (!formData.name.trim()) {
      toast.error('Gym name is required')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Description is required')
      return
    }
    if (!formData.address.trim() || !formData.city.trim() || !formData.country.trim()) {
      toast.error('Complete address is required')
      return
    }
    if (!formData.phone_number.trim()) {
      toast.error('Phone number is required')
      return
    }

    try {
      setSaving(true)
      
      await updateGymByOwner(id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim(),
        website: formData.website.trim(),
        images: formData.images,
        latitude: formData.latitude,
        longitude: formData.longitude
      })

      toast.success('Gym updated successfully!')
      navigate('/gym-owner')
    } catch (error: any) {
      console.error('Error updating gym:', error)
      toast.error(error.message || 'Failed to update gym')
    } finally {
      setSaving(false)
    }
  }

  // Check authorization
  if (!isGymOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-100">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Access Denied</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You need gym owner privileges to edit gyms.</p>
          <button
            onClick={() => navigate('/gym-owner')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-100">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/gym-owner')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      {/* Header */}
      <div className="bg-white dark:bg-dark-200 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/gym-owner')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <BuildingOfficeIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Edit Gym
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Update your gym information
            </p>
          </div>

          {/* Status Warning */}
          {gym?.status === 'approved' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Editing Approved Gym
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Your gym is currently approved and visible to users. Changes may require admin re-approval.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Basic Information
                </h2>

                {/* Gym Name */}
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
                      placeholder="Enter your gym name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="input-field pl-10"
                        placeholder="contact@yourgym.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Website */}
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

                {/* Images */}
                <GymImageUploader
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={12}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate('/gym-owner')}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Updating Gym...' : 'Update Gym'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 