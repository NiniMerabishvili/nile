import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  UserIcon,
  AcademicCapIcon,
  StarIcon,
  CheckBadgeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { getGymById, getCoachesByGym, type Gym } from '@/lib/supabase'
import toast from 'react-hot-toast'
import LocationDisplay from '@/components/LocationDisplay'
import GymImageDisplay from '@/components/GymImageDisplay'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Coach {
  id: string
  name?: string
  photo?: string
  bio?: string
  specialties: string[]
  experience_years: number
  certifications: string[]
  is_verified: boolean
  gym_id: string
  profile?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export default function GymProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [gym, setGym] = useState<Gym | null>(null)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [coachesLoading, setCoachesLoading] = useState(false)
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
      
      // Fetch coaches for this gym
      await fetchGymCoaches(gymId)
      
    } catch (error) {
      console.error('Error fetching gym:', error)
      setError('Failed to load gym details')
      toast.error('Failed to load gym details')
      navigate('/gyms')
    } finally {
      setLoading(false)
    }
  }

  const fetchGymCoaches = async (gymId: string) => {
    try {
      setCoachesLoading(true)
      console.log('Fetching coaches for gym:', gymId)
      
      const coachesData = await getCoachesByGym(gymId)
      console.log('Coaches data received:', coachesData)
      
      setCoaches(coachesData || [])
    } catch (error) {
      console.error('Error fetching gym coaches:', error)
      // Don't show error toast for coaches, just log it
      setCoaches([])
    } finally {
      setCoachesLoading(false)
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

  const getCoachDisplayName = (coach: Coach): string => {
    if (coach.profile?.full_name) {
      return coach.profile.full_name
    }
    return coach.name || 'Unknown Coach'
  }

  const getCoachAvatar = (coach: Coach): string => {
    // For gym coaches, use the photo field; for user coaches, use profile avatar_url
    return coach.photo || coach.profile?.avatar_url || ''
  }

  const renderCoachAvatar = (coach: Coach) => {
    const avatar = getCoachAvatar(coach)
    const name = getCoachDisplayName(coach)
    
    return (
      <div className="relative w-full h-full">
        {avatar && avatar.trim() ? (
          <img
            src={avatar}
            alt={`${name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to default avatar if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.parentElement?.querySelector('.fallback-avatar') as HTMLElement
              if (fallback) fallback.classList.remove('hidden')
            }}
          />
        ) : null}
        
        {/* Default avatar placeholder */}
        <div className={`fallback-avatar w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 ${avatar && avatar.trim() ? 'hidden' : ''}`}>
          <UserIcon className="h-16 w-16 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    )
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

            {/* Coaches Section */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                <AcademicCapIcon className="h-6 w-6 mr-3 text-primary-600" />
                Our Coaches
                {coaches.length > 0 && (
                  <span className="ml-3 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full">
                    {coaches.length} coach{coaches.length !== 1 ? 'es' : ''}
                  </span>
                )}
              </h2>

              {coachesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading coaches...</span>
                </div>
              ) : coaches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {coaches.map((coach) => (
                    <Link
                      key={coach.id}
                      to={`/trainers/${coach.id}`}
                      className="group block"
                    >
                      <motion.div
                        whileHover={{ y: -2, scale: 1.02 }}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Coach Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                              {renderCoachAvatar(coach)}
                            </div>
                          </div>
                          
                          {/* Coach Info */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                {getCoachDisplayName(coach)}
                              </h3>
                              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                            </div>
                            
                            {/* Experience */}
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <StarIcon className="h-4 w-4 mr-1" />
                              <span>{coach.experience_years} years of experience</span>
                              {coach.is_verified && (
                                <CheckBadgeIcon className="h-4 w-4 ml-2 text-green-500" />
                              )}
                            </div>
                            
                            {/* Specialties */}
                            {coach.specialties && coach.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {coach.specialties.slice(0, 3).map((specialty) => (
                                  <span
                                    key={specialty}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                                  >
                                    {specialty}
                                  </span>
                                ))}
                                {coach.specialties.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                    +{coach.specialties.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Bio Preview */}
                            {coach.bio && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {coach.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Coaches Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This gym hasn't added any coaches to their team yet.
                  </p>
                </div>
              )}
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

                  {coaches.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <AcademicCapIcon className="h-5 w-5 mr-2" />
                        <span>Coaches:</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {coaches.length} coach{coaches.length === 1 ? '' : 'es'}
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