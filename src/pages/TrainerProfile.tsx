import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MapPinIcon,
  StarIcon,
  ClockIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { getCoachProfile, getAllTutorialsByCoach, type Coach, type Profile, type Tutorial } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

interface CoachWithProfile extends Coach {
  profile?: Profile
}

export default function TrainerProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [coach, setCoach] = useState<CoachWithProfile | null>(null)
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState('single')

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

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Profile Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'Unable to load profile'}</p>
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

  // Calculate packages based on experience years
  const getPackages = (experienceYears: number) => {
    const basePrice = 40 + (experienceYears * 5) // $5 increase per year of experience
    return [
      {
        id: 'single',
        name: 'Single Session',
        price: `$${basePrice}`,
        description: 'Perfect for trying out my training style'
      },
      {
        id: '5pack',
        name: '5 Session Pack',
        price: `$${Math.round(basePrice * 4.5)}`, // 10% discount
        description: 'Most popular choice for getting started'
      },
      {
        id: '10pack',
        name: '10 Session Pack',
        price: `$${Math.round(basePrice * 8)}`, // 20% discount
        description: 'Best value for committed training'
      }
    ]
  }

  const packages = getPackages(coach.experience_years || 0)

  // Default availability schedule
  const availability = {
    'Monday - Friday': '6:00 AM - 8:00 PM',
    'Saturday': '8:00 AM - 2:00 PM',
    'Sunday': 'Closed'
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative h-[400px] -mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 opacity-90" />
        <div className="absolute inset-0 bg-[url('/trainer-bg.jpg')] bg-cover bg-center mix-blend-overlay" />
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-end h-full pb-8 relative z-10">
            <div className="flex items-end space-x-8">
              <img
                src={coach.profile?.avatar_url || '/default-avatar.jpg'}
                alt={coach.profile?.full_name}
                className="w-40 h-40 rounded-xl object-cover border-4 border-white shadow-lg"
              />
              <div className="text-white pb-2">
                <h1 className="text-4xl font-bold mb-2">{coach.profile?.full_name}</h1>
                <p className="text-xl text-primary-100 mb-4">{coach.specialties?.[0] || 'Professional Coach'}</p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>Available Online</span>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <span>{coach.is_verified ? 'Verified Coach' : 'New Coach'}</span>
                  </div>
                </div>
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
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">About Me</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {coach.bio || 'Bio not available'}
              </p>
            </div>

            {/* Certifications */}
            {coach.certifications && coach.certifications.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                <div className="space-y-3">
                  {coach.certifications.map((cert) => (
                    <div
                      key={cert}
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
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {coach.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tutorials */}
            {tutorials.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Tutorials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorials.map((tutorial) => (
                    <div
                      key={tutorial.id}
                      className="border border-gray-200 dark:border-dark-300 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{tutorial.title}</h3>
                        <span className="font-bold text-primary-600">${tutorial.price}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {tutorial.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {tutorial.duration_minutes} minutes
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tutorial.difficulty_level === 'beginner' 
                            ? 'bg-green-100 text-green-700' 
                            : tutorial.difficulty_level === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {tutorial.difficulty_level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Availability</h2>
              <div className="space-y-4">
                {Object.entries(availability).map(([days, hours]) => (
                  <div
                    key={days}
                    className="flex items-start justify-between text-gray-600 dark:text-gray-400"
                  >
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span>{days}</span>
                    </div>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews - Placeholder for now */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Client Reviews</h2>
              <p className="text-gray-600 dark:text-gray-400">
                No reviews yet. Be the first to leave a review!
              </p>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-6">Book a Session</h2>
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPackage === pkg.id
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-300 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <span className="font-bold text-primary-600">{pkg.price}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pkg.description}
                      </p>
                    </button>
                  ))}
                </div>
                <button className="btn-primary w-full mt-6">
                  Book Selected Package
                </button>
              </div>

              {/* Contact Card */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
                <button className="btn-secondary w-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 