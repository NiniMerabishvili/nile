import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  PhotoIcon,
  CalendarIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { getGymById, type Gym } from '@/lib/supabase'
import toast from 'react-hot-toast'
import LocationDisplay from '@/components/LocationDisplay'
import GymImageDisplay from '@/components/GymImageDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function GymProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [gym, setGym] = useState<Gym | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [showAllPhotos, setShowAllPhotos] = useState(false)

  useEffect(() => {
    if (id) {
      fetchGym(id)
    }
  }, [id])

  const fetchGym = async (gymId: string) => {
    try {
      setLoading(true)
      setError(null)

      const gymData = await getGymById(gymId)
      
      if (!gymData) {
        setError('Gym not found')
        toast.error('Gym not found')
        navigate('/gyms')
        return
      }

      setGym(gymData)
    } catch (error) {
      console.error('Error fetching gym:', error)
      setError('Failed to load gym details')
      toast.error('Failed to load gym details')
      navigate('/gyms')
    } finally {
      setLoading(false)
    }
  }

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const getLocationString = (gym: Gym) => {
    const parts = [gym.city, gym.country].filter(Boolean)
    return parts.join(', ')
  }

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]))
  }

  const validImages = gym?.images?.filter((img, index) => 
    img && 
    typeof img === 'string' && 
    img.trim() !== '' &&
    !imageErrors.has(index)
  ) || []

  const navigateToGallery = () => {
    setShowAllPhotos(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !gym) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Gym not found
          </h1>
          <button
            onClick={() => navigate('/gyms')}
            className="btn-primary"
          >
            Back to Gyms
          </button>
        </div>
      </div>
    )
  }

  if (showAllPhotos) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="flex items-center text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to {gym.name}
            </button>
            <h1 className="text-2xl font-bold text-white">{gym.name} Gallery</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group rounded-lg overflow-hidden"
              >
                <img
                  src={image}
                  alt={`${gym.name} photo ${index + 1}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  onError={() => handleImageError(index)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      {/* Hero Section with Images */}
      <section className="relative bg-white dark:bg-dark-200">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/gyms')}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Gyms
          </motion.button>

          {/* Image Gallery */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="w-full"
          >
            {validImages.length > 0 ? (
              <GymImageDisplay 
                images={validImages} 
                gymName={gym.name} 
                className="h-96" 
                showGallery={true}
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-300 dark:to-dark-400 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-500 dark:text-gray-400">No images available</p>
                </div>
              </div>
            )}

            {validImages.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                className="mt-4 text-center"
              >
                <button
                  onClick={navigateToGallery}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors font-medium"
                >
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  Click to view all {validImages.length} photos
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="lg:col-span-2 space-y-8"
          >
            {/* Gym Title */}
            <div>
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white font-big-noodle tracking-wide">
                {gym.name}
              </h1>
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-lg">{getLocationString(gym)}</span>
              </div>
            </div>

            {/* Categories Section - Only show if categories exist */}
            {gym.categories && gym.categories.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                  <TagIcon className="h-6 w-6 mr-3 text-primary-600" />
                  Categories
                </h2>
                <div className="flex flex-wrap gap-3">
                  {gym.categories.map((category, index) => (
                    <span
                      key={category.id || index}
                      className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                    >
                      <TagIcon className="h-4 w-4 mr-2" />
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About Section */}
            {gym.description && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">About</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  {gym.description}
                </p>
              </div>
            )}

            {/* Location & Map Section */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Location & Map</h2>
              <LocationDisplay
                latitude={gym.latitude}
                longitude={gym.longitude}
                address={gym.address}
                city={gym.city}
                country={gym.country}
                gymName={gym.name}
              />
            </div>

            {/* Gym Owner Contact */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Gym Owner</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserIcon className="h-6 w-6 text-gray-400 mr-3" />
                  <span className="text-lg text-gray-900 dark:text-white">
                    {gym.owner_name || 'Owner Name Not Available'}
                  </span>
                </div>
                {gym.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <a 
                      href={`mailto:${gym.email}`} 
                      className="text-lg text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {gym.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Side Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-6">
              {/* Quick Info Card */}
              <div className="card">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Quick Info</h3>
                <div className="space-y-4">
                  {gym.created_at && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        <span>Added:</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(gym.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {gym.categories && gym.categories.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <TagIcon className="h-5 w-5 mr-2" />
                        <span>Categories:</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {gym.categories.length} categor{gym.categories.length === 1 ? 'y' : 'ies'}
                      </span>
                    </div>
                  )}

                  {gym.images && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <PhotoIcon className="h-5 w-5 mr-2" />
                        <span>Photos:</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {validImages.length} image{validImages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Get in Touch Block */}
              <div className="card">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Get in Touch</h3>
                <div className="space-y-4">
                  {gym.phone_number && (
                    <a
                      href={`tel:${gym.phone_number}`}
                      className="btn-primary w-full flex items-center justify-center group"
                    >
                      <PhoneIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Call Now
                    </a>
                  )}
                  
                  {gym.email && (
                    <a
                      href={`mailto:${gym.email}`}
                      className="btn-secondary w-full flex items-center justify-center group"
                    >
                      <EnvelopeIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Send Email
                    </a>
                  )}
                  
                  {gym.website && (
                    <a
                      href={gym.website.startsWith('http') ? gym.website : `https://${gym.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full flex items-center justify-center group"
                    >
                      <GlobeAltIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Visit Website
                    </a>
                  )}

                  {!gym.phone_number && !gym.email && !gym.website && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      <EnvelopeIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Contact information not available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 