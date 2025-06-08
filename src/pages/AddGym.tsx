import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PhotoIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { createGymByOwner } from '@/lib/supabase'
import SimpleLocationSelector from '@/components/SimpleLocationSelector'
import toast from 'react-hot-toast'

export default function AddGym() {
  const { isGymOwner } = useAuth()
  const navigate = useNavigate()
  
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
  
  const [imageUrl, setImageUrl] = useState('')
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

  const handleAddImage = () => {
    if (imageUrl.trim() && !formData.images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }))
      setImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
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

      await createGymByOwner(formData)
      toast.success('Gym submitted successfully! It will be reviewed by our admin team.')
      navigate('/')
      
    } catch (err: any) {
      console.error('Error creating gym:', err)
      setError(err.message || 'Failed to submit gym. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-8">
          <BuildingOfficeIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            List Your Gym
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Submit your gym details for review. Once approved, it will be visible to users.
          </p>
        </div>

        <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
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
                  Contact Email *
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

            {/* Location Selector */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Location *</h3>
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

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gym Photos (Optional)
              </label>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <PhotoIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      className="input-field pl-10"
                      placeholder="Enter image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="btn-primary px-4 py-2"
                    disabled={!imageUrl.trim()}
                  >
                    Add
                  </button>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Gym photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg py-3"
              >
                {loading ? 'Submitting...' : 'Submit Gym for Review'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
} 