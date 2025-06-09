import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { supabase, type Gym } from '@/lib/supabase'
import toast from 'react-hot-toast'
import LocationDisplay from '@/components/LocationDisplay'

export default function GymProfile() {
  const { id } = useParams()
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

      const { data, error: fetchError } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', gymId)
        .single()

      if (fetchError) {
        console.error('Error fetching gym:', fetchError)
        setError('Failed to load gym details')
        toast.error('Failed to load gym details')
        return
      }

      if (!data) {
        setError('Gym not found')
        return
      }

      setGym(data)
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const getLocationString = (gym: Gym) => {
    const parts = [gym.address, gym.city, gym.country].filter(Boolean)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !gym) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {error || 'Gym not found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The gym you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/gyms"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Gyms
          </Link>
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
    <div className="space-y-8">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Link
          to="/gyms"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Gyms
        </Link>
      </div>

      {/* Attractive Gallery Section */}
      <section className="relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="relative"
          >
            {validImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                {/* Main large image */}
                <div className="col-span-3 relative group cursor-pointer" onClick={navigateToGallery}>
                  <img
                    src={validImages[0]}
                    alt={gym.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => handleImageError(0)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-4 left-4 text-white">
                      <PhotoIcon className="h-8 w-8 mb-2" />
                      <p className="text-sm font-medium">View Gallery</p>
                    </div>
                  </div>
                </div>

                {/* Side images */}
                <div className="col-span-1 grid grid-rows-2 gap-3">
                  {validImages.slice(1, 3).map((image, idx) => (
                    <div 
                      key={idx} 
                      className="relative group cursor-pointer rounded-lg overflow-hidden"
                      onClick={navigateToGallery}
                    >
                      <img
                        src={image}
                        alt={`${gym.name} ${idx + 2}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => handleImageError(idx + 1)}
                      />
                      {idx === 1 && validImages.length > 3 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <div className="text-center text-white">
                            <PhotoIcon className="h-6 w-6 mx-auto mb-1" />
                            <span className="text-sm font-semibold">
                              +{validImages.length - 3} more
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {validImages.length < 3 && (
                    <div className="bg-gray-100 dark:bg-dark-300 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-400">
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[500px] bg-gray-100 dark:bg-dark-300 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No images available</p>
                </div>
              </div>
            )}

            {/* Gallery hint */}
            {validImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
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

                  {gym.status && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <TagIcon className="h-5 w-5 mr-2" />
                        <span>Status:</span>
                      </div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          gym.status === 'approved' 
                            ? 'bg-green-400' 
                            : gym.status === 'pending' 
                            ? 'bg-yellow-400' 
                            : 'bg-red-400'
                        }`}></span>
                        <span className={
                          gym.status === 'approved' 
                            ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/20' 
                            : gym.status === 'pending' 
                            ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/20' 
                            : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/20'
                        }>
                          {gym.status.charAt(0).toUpperCase() + gym.status.slice(1)}
                        </span>
                      </div>
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