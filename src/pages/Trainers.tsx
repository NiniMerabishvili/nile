import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as OutlineIcons from '@heroicons/react/24/outline'
import { getAllCoachesWithGymInfo, type Profile, type Trainer } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'


// Enhanced interface for coaches with profile data
interface CoachWithProfile {
  id: string
  name?: string // For gym coaches
  photo?: string // For coach photos
  bio?: string
  specialties: string[]
  experience_years: number
  certifications: string[]
  platform_fee_percentage: number
  is_verified: boolean
  created_at: string
  updated_at: string
  gym_id?: string | null
  profile?: Profile | null
  gym?: {
    id: string
    name: string
    city: string
    country: string
    address: string
  } | null
  display_name: string
  coach_type: 'user_coach' | 'gym_coach'
  type: 'coach'
}

// Enhanced interface for trainers
interface TrainerWithType extends Trainer {
  type: 'trainer'
}

// Combined type for both coaches and trainers
type InstructorType = CoachWithProfile | TrainerWithType

export default function Trainers() {
  const [instructors, setInstructors] = useState<InstructorType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [experienceFilter, setExperienceFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'coaches' | 'trainers'>('all')

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 Starting to fetch instructors...')
        
        // Fetch only coaches since trainers table doesn't exist
        const coachesData = await getAllCoachesWithGymInfo()

        console.log('📊 Raw coaches data with gym info:', coachesData)

        // Transform coaches data with better type handling
        const coachesWithType: CoachWithProfile[] = (coachesData || []).map(coach => ({
          id: coach.id,
          name: coach.name,
          photo: coach.photo, // Include photo field
          bio: coach.bio,
          specialties: coach.specialties,
          experience_years: coach.experience_years,
          certifications: coach.certifications,
          platform_fee_percentage: coach.platform_fee_percentage,
          is_verified: coach.is_verified,
          created_at: coach.created_at,
          updated_at: coach.updated_at,
          gym_id: coach.gym_id,
          profile: coach.profile,
          gym: coach.gym,
          display_name: coach.display_name,
          coach_type: coach.coach_type,
          type: 'coach' as const
        }))

        console.log('✨ Processed coaches:', coachesWithType)

        // For now, only use coaches since trainers table doesn't exist
        const combined: InstructorType[] = [...coachesWithType]
        console.log('🔗 Combined instructors with gym info:', combined)
        setInstructors(combined)
      } catch (error) {
        console.error('❌ Error fetching instructors:', error)
        setError('Failed to load instructors. Please try again later.')
        setInstructors([])
      } finally {
        setLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  // // Animation variants
  // const containerVariants: Variants = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: {
  //       staggerChildren: 0.1
  //     }
  //   }
  // }

  // const cardVariants: Variants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: { 
  //     opacity: 1, 
  //     y: 0,
  //     transition: {
  //       duration: 0.5
  //     }
  //   }
  // }

  // Helper functions to get properties from both types
  const getName = (instructor: InstructorType): string => {
    if (instructor.type === 'coach') {
      return instructor.display_name || instructor.profile?.full_name || instructor.name || 'Coach'
    } else {
      return instructor.name
    }
  }

  // const getBio = (instructor: InstructorType): string => {
  //   if (instructor.type === 'coach') {
  //     return instructor.bio || ''
  //   } else {
  //     return instructor.bio || ''
  //   }
  // }

  const getSpecialties = (instructor: InstructorType): string[] => {
    if (instructor.type === 'coach') {
      return instructor.specialties || []
    } else {
      return instructor.specialties || (instructor.specialty ? [instructor.specialty] : [])
    }
  }

  const getExperienceYears = (instructor: InstructorType): number => {
    if (instructor.type === 'coach') {
      return instructor.experience_years
    } else {
      // Extract years from experience string if possible, otherwise return 0
      const experienceMatch = instructor.experience.match(/(\d+)/)
      return experienceMatch ? parseInt(experienceMatch[1]) : 0
    }
  }

  const getCertifications = (instructor: InstructorType): string[] => {
    if (instructor.type === 'coach') {
      return instructor.certifications || []
    } else {
      return instructor.certifications || []
    }
  }

  const isVerified = (instructor: InstructorType): boolean => {
    if (instructor.type === 'coach') {
      return instructor.is_verified
    } else {
      return true // Assume pre-populated trainers are verified
    }
  }

  const getRating = (instructor: InstructorType): number => {
    if (instructor.type === 'coach') {
      return 0 // Coaches don't have ratings yet
    } else {
      return instructor.rating
    }
  }

  const getPrice = (instructor: InstructorType): string => {
    if (instructor.type === 'coach') {
      return `${instructor.platform_fee_percentage}% platform fee`
    } else {
      return instructor.price
    }
  }

  const getAvatar = (instructor: InstructorType): string => {
    if (instructor.type === 'coach') {
      // For gym coaches, use the photo field; for user coaches, use profile avatar_url
      return instructor.photo || instructor.profile?.avatar_url || ''
    } else {
      return instructor.image || ''
    }
  }

  // Updated function to render coach image
  const renderCoachImage = (instructor: InstructorType, name: string) => {
    const avatar = getAvatar(instructor)
    
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
          <OutlineIcons.UserIcon className="h-16 w-16 text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    )
  }

  // Filtered instructors
  const filteredInstructors = instructors.filter(instructor => {
    const name = getName(instructor).toLowerCase()
    const specialty = getSpecialties(instructor).join(' ').toLowerCase()
    const experience = getExperienceYears(instructor)
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || 
                         specialty.includes(searchTerm.toLowerCase())
    const matchesSpecialty = !specialtyFilter || getSpecialties(instructor).includes(specialtyFilter)
    const matchesExperience = !experienceFilter || 
                             (experienceFilter === '1-3' && experience >= 1 && experience <= 3) ||
                             (experienceFilter === '4-7' && experience >= 4 && experience <= 7) ||
                             (experienceFilter === '8+' && experience >= 8)
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'coaches' && instructor.type === 'coach') ||
                       (typeFilter === 'trainers' && instructor.type === 'trainer')

    return matchesSearch && matchesSpecialty && matchesExperience && matchesType
  })

  // // Get unique specialties for filter
  // const allSpecialties = Array.from(
  //   new Set(
  //     instructors.flatMap(instructor => getSpecialties(instructor))
  //   )
  // ).sort()

  // // Add a new function to get gym information
  // const getGymInfo = (instructor: InstructorType): string | null => {
  //   if (instructor.type === 'coach' && instructor.gym) {
  //     return `${instructor.gym.name} • ${instructor.gym.city}, ${instructor.gym.country}`
  //   }
  //   return null
  // }

  // // Add a function to check if coach is from gym
  // const isGymCoach = (instructor: InstructorType): boolean => {
  //   return instructor.type === 'coach' && instructor.coach_type === 'gym_coach'
  // }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-dark-100 dark:via-dark-200 dark:to-dark-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
          <LoadingSpinner />
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Loading amazing instructors...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-dark-100 dark:via-dark-200 dark:to-dark-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <OutlineIcons.AcademicCapIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Failed to Load Instructors
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Trainer
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Connect with certified coaches and experienced trainers ready to help you achieve your fitness goals
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="container mx-auto px-4">
        <div className="bg-white dark:bg-dark-200 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-100 dark:text-white"
              />
              <OutlineIcons.MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'coaches' | 'trainers')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-100 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="coaches">Coaches</option>
              <option value="trainers">Trainers</option>
            </select>

            {/* Specialty Filter */}
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-100 dark:text-white"
            >
              <option value="">All Specialties</option>
              <option value="Boxing">Boxing</option>
              <option value="Karate">Karate</option>
              <option value="Fitness">Fitness</option>
              <option value="Yoga">Yoga</option>
              <option value="Strength Training">Strength Training</option>
              <option value="Cardio">Cardio</option>
            </select>

            {/* Experience Filter */}
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-100 dark:text-white"
            >
              <option value="">All Experience</option>
              <option value="1-3">1-3 years</option>
              <option value="4-7">4-7 years</option>
              <option value="8+">8+ years</option>
            </select>
          </div>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Available Trainers ({filteredInstructors.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="text-center py-12">
            <OutlineIcons.UserGroupIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No trainers found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInstructors.map((instructor) => (
              <Link
                key={instructor.id}
                to={`/trainers/${instructor.id}`}
                className="group block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white dark:bg-dark-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200 dark:bg-gray-700">
                    <div className="w-full h-48 overflow-hidden">
                      {renderCoachImage(instructor, getName(instructor))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {getName(instructor)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {getSpecialties(instructor)[0] || 'Personal Trainer'}
                        </p>
                      </div>
                      {isVerified(instructor) && (
                        <OutlineIcons.CheckBadgeIcon className="h-6 w-6 text-blue-500" />
                      )}
                    </div>

                    {/* Experience and Rating */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <OutlineIcons.AcademicCapIcon className="h-4 w-4 mr-1" />
                        <span>{getExperienceYears(instructor)} years</span>
                      </div>
                      {instructor.type === 'trainer' && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <OutlineIcons.StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                          <span>{getRating(instructor)}</span>
                        </div>
                      )}
                    </div>

                    {/* Gym affiliation for coaches */}
                    {instructor.type === 'coach' && instructor.gym && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <OutlineIcons.BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        <span>{instructor.gym.name}</span>
                      </div>
                    )}

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {getSpecialties(instructor).slice(0, 3).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {getSpecialties(instructor).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{getSpecialties(instructor).length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Certifications */}
                    {getCertifications(instructor).length > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <OutlineIcons.AcademicCapIcon className="h-4 w-4 mr-1" />
                        <span>{getCertifications(instructor).length} certifications</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        {getPrice(instructor)}
                      </span>
                      <OutlineIcons.ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
} 