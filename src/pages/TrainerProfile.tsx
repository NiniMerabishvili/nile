import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MapPinIcon,
  StarIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  UserIcon,
  CheckBadgeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { getCoachProfile, getAllTutorialsByCoach, type Coach, type Profile, type Tutorial } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import CalendarBooking from '../components/CalendarBooking'

interface CoachWithProfile extends Coach {
  profile?: Profile
  gym?: {
    id: string
    name: string
    city: string
    country: string
    address: string
  }
  display_name?: string
  coach_type?: 'user_coach' | 'gym_coach'
}

export default function TrainerProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [coach, setCoach] = useState<CoachWithProfile | null>(null)
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) {
        setError('Profile ID not provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const coachData = await getCoachProfile(id)
        if (coachData) {
          setCoach(coachData)
          const tutorialsData = await getAllTutorialsByCoach(id)
          setTutorials(tutorialsData || [])
        } else {
          setError(`No profile found for ID: ${id}`)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError(`Failed to load profile: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [id])

  // Get display name for both user and gym coaches
  const getDisplayName = () => {
    if (coach?.display_name) return coach.display_name
    if (coach?.profile?.full_name) return coach.profile.full_name
    if (coach?.name) return coach.name
    return 'Unknown Coach'
  }

  // Get avatar image for both user and gym coaches
  const getAvatar = () => {
    if (coach?.photo) return coach.photo // Gym coach photo
    if (coach?.profile?.avatar_url) return coach.profile.avatar_url // User coach avatar
    return '/default-avatar.jpg' // Fallback
  }

  // Get coach location
  const getLocation = () => {
    if (coach?.gym) {
      return `${coach.gym.city}, ${coach.gym.country} (${coach.gym.name})`
    }
    return 'Available Online'
  }

  // Handle successful booking
  const handleBookingComplete = () => {
    toast.success(`Booking confirmed! Your training session with ${getDisplayName()} is scheduled.`)
    // Optionally redirect to bookings page or show confirmation
  }

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-100">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-100">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Profile Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Unable to load profile'}</p>
          <button
            onClick={() => navigate('/trainers')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Trainers
          </button>
        </div>
      </div>
    )
  }

  // Calculate base price (you can customize this logic)
  const basePrice = 40 // Base price for training sessions

  // Default availability schedule
  const availability = {
    'Monday - Friday': '6:00 AM - 8:00 PM',
    'Saturday': '8:00 AM - 2:00 PM',
    'Sunday': 'Closed'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      {/* Back Button */}
      <div className="bg-white dark:bg-dark-200 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/trainers')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Trainers
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-r from-primary-600 to-primary-800">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg bg-gray-300 dark:bg-gray-600">
                  {getAvatar() !== '/default-avatar.jpg' ? (
                    <img
                      src={getAvatar()}
                      alt={getDisplayName()}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.parentElement?.querySelector('.fallback-avatar') as HTMLElement
                        if (fallback) fallback.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  
                  {/* Default avatar placeholder */}
                  <div className={`fallback-avatar w-full h-full flex items-center justify-center ${getAvatar() !== '/default-avatar.jpg' ? 'hidden' : ''}`}>
                    <UserIcon className="h-16 w-16 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                
                {coach.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                    <CheckBadgeIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              
              {/* Coach Info */}
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{getDisplayName()}</h1>
                <p className="text-xl text-primary-100 mb-4">{coach.specialties?.[0] || 'Professional Coach'}</p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{getLocation()}</span>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <span>{coach.experience_years} years experience</span>
                  </div>
                  {coach.gym && (
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      <span>{coach.gym.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="lg:col-span-2 space-y-8"
            >
              {/* About */}
              <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">About Me</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {coach.bio || 'Bio not available'}
                </p>
              </div>

              {/* Certifications */}
              {coach.certifications && coach.certifications.length > 0 && (
                <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Certifications</h2>
                  <div className="space-y-3">
                    {coach.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center text-gray-600 dark:text-gray-400"
                      >
                        <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-3" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialties */}
              {coach.specialties && coach.specialties.length > 0 && (
                <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tutorials */}
              {tutorials.length > 0 && (
                <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Tutorials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tutorials.slice(0, 4).map((tutorial) => (
                      <div key={tutorial.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{tutorial.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tutorial.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-primary-600 dark:text-primary-400 font-semibold">${tutorial.price}</span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                            {tutorial.difficulty_level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="space-y-6"
            >
              {/* Book Training Session */}
              <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Book Training Session</h2>
                
                {coach.id && (
                  <CalendarBooking
                    coachId={coach.id}
                    coachName={getDisplayName()}
                    basePrice={basePrice}
                    experienceYears={coach.experience_years || 0}
                    onBookingComplete={handleBookingComplete}
                  />
                )}
              </div>

              {/* Availability */}
              <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">General Availability</h2>
                <div className="space-y-3">
                  {Object.entries(availability).map(([day, time]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{day}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{time}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  * Use the booking calendar above to see exact availability and book sessions.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Get in Touch</h2>
                <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Send Message
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 