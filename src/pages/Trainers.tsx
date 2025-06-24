import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import * as OutlineIcons from '@heroicons/react/24/outline'
import { getCoaches, getTrainers, type Profile, type Trainer } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'


// Enhanced interface for coaches with profile data
interface CoachWithProfile {
  id: string
  bio?: string
  specialties: string[]
  experience_years: number
  certifications: string[]
  platform_fee_percentage: number
  is_verified: boolean
  created_at: string
  updated_at: string
  profile?: Profile
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
        
        // Fetch both coaches and trainers
        const [coachesData, trainersData] = await Promise.all([
          getCoaches(),
          getTrainers()
        ])

        console.log('Raw coaches data:', coachesData)
        console.log('Raw trainers data:', trainersData)

        // Transform coaches data to match our expected structure
        const coachesWithType: CoachWithProfile[] = (coachesData || [])
          .filter(item => item && item.coaches) // Only include items that have coach data
          .map(item => ({
            id: item.id,
            bio: item.coaches.bio,
            specialties: item.coaches.specialties || [],
            experience_years: item.coaches.experience_years || 0,
            certifications: item.coaches.certifications || [],
            platform_fee_percentage: item.coaches.platform_fee_percentage || 5.0,
            is_verified: item.coaches.is_verified || false,
            created_at: item.coaches.created_at,
            updated_at: item.coaches.updated_at,
            profile: {
              id: item.id,
              username: item.username,
              full_name: item.full_name,
              email: item.email,
              avatar_url: item.avatar_url,
              role: item.role,
              created_at: item.created_at,
              updated_at: item.updated_at
            },
            type: 'coach' as const
          }))

        const trainersWithType: TrainerWithType[] = (trainersData || []).map(trainer => ({
          ...trainer,
          type: 'trainer' as const
        }))

        const combined: InstructorType[] = [...coachesWithType, ...trainersWithType]
        console.log('Combined instructors:', combined)
        setInstructors(combined)
      } catch (error) {
        console.error('Error fetching instructors:', error)
        setError('Failed to load instructors. Please try again later.')
        setInstructors([])
      } finally {
        setLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  // Helper functions to get properties from both types
  const getName = (instructor: InstructorType): string => {
    if (instructor.type === 'coach') {
      return instructor.profile?.full_name || 'Coach'
    } else {
      return instructor.name
    }
  }

  const getBio = (instructor: InstructorType): string => {
    if (instructor.type === 'coach') {
      return instructor.bio || ''
    } else {
      return instructor.bio || ''
    }
  }

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
      return instructor.profile?.avatar_url || ''
    } else {
      return instructor.image || ''
    }
  }

  // Updated function to render coach image
  const renderCoachImage = (instructor: InstructorType, name: string) => {
    const avatar = getAvatar(instructor)
    
    if (avatar && avatar.trim()) {
      return (
        <img
          src={avatar}
          alt={`${name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default avatar if image fails to load
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            target.nextElementSibling?.classList.remove('hidden')
          }}
        />
      )
    }
    
    // Default avatar placeholder
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
        <OutlineIcons.UserIcon className="h-16 w-16 text-gray-500 dark:text-gray-400" />
      </div>
    )
  }

  // Filtered instructors
  const filteredInstructors = instructors.filter(instructor => {
    const name = getName(instructor)
    const bio = getBio(instructor)
    const specialties = getSpecialties(instructor)
    const experienceYears = getExperienceYears(instructor)

    const matchesSearch = searchTerm === '' || 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesSpecialty = specialtyFilter === '' ||
      specialties.some(specialty => 
        specialty.toLowerCase().includes(specialtyFilter.toLowerCase())
      )

    const matchesExperience = experienceFilter === '' ||
      (experienceFilter === '0-2' && experienceYears >= 0 && experienceYears <= 2) ||
      (experienceFilter === '3-5' && experienceYears >= 3 && experienceYears <= 5) ||
      (experienceFilter === '6-10' && experienceYears >= 6 && experienceYears <= 10) ||
      (experienceFilter === '10+' && experienceYears > 10)

    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'coaches' && instructor.type === 'coach') ||
      (typeFilter === 'trainers' && instructor.type === 'trainer')

    return matchesSearch && matchesSpecialty && matchesExperience && matchesType
  })

  // Get unique specialties for filter
  const allSpecialties = Array.from(
    new Set(
      instructors.flatMap(instructor => getSpecialties(instructor))
    )
  ).sort()

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-dark-100 dark:via-dark-200 dark:to-dark-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-display bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Expert Trainers & Coaches
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Train with certified professionals and experienced coaches who will help you reach your martial arts and fitness goals
            </p>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-dark-200 rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <OutlineIcons.MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search instructors..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <OutlineIcons.AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="input-field pl-10 appearance-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'coaches' | 'trainers')}
              >
                <option value="all">All Instructors</option>
                <option value="coaches">Coaches Only</option>
                <option value="trainers">Trainers Only</option>
              </select>
            </div>

            {/* Specialty Filter */}
            <div className="relative">
              <OutlineIcons.AdjustmentsHorizontalIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="input-field pl-10 appearance-none"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                <option value="">All Specialties</option>
                {allSpecialties.map((specialty, _idx) => (
                  <option key={_idx} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div className="relative">
              <OutlineIcons.StarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="input-field pl-10 appearance-none"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
              >
                <option value="">Any Experience</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSpecialtyFilter('')
                setExperienceFilter('')
                setTypeFilter('all')
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredInstructors.length} of {instructors.length} instructors
            {typeFilter !== 'all' && (
              <span className="ml-2 text-primary-600 dark:text-primary-400">
                ({typeFilter === 'coaches' ? 'Coaches' : 'Trainers'} only)
              </span>
            )}
          </p>
        </motion.div>

        {/* Instructors Grid */}
        {filteredInstructors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <OutlineIcons.AcademicCapIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No instructors found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {instructors.length === 0 
                ? "No instructors are available yet. Check back soon!"
                : "Try adjusting your search criteria to find more instructors."
              }
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredInstructors.map((instructor) => {
              const name = getName(instructor)
              const bio = getBio(instructor)
              const specialties = getSpecialties(instructor)
              const experienceYears = getExperienceYears(instructor)
              const certifications = getCertifications(instructor)
              const verified = isVerified(instructor)
              const rating = getRating(instructor)
              const price = getPrice(instructor)

              return (
              <motion.div
                  key={`${instructor.type}-${instructor.id}`}
                variants={cardVariants}
                className="bg-white dark:bg-dark-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary-400 to-purple-600">
                    {renderCoachImage(instructor, name)}
                    {/* Hidden fallback for failed image loads */}
                    <div className="hidden w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                      <OutlineIcons.UserIcon className="h-16 w-16 text-gray-500 dark:text-gray-400" />
                    </div>
                  <div className="absolute inset-0 bg-black bg-opacity-20" />
                  
                    {/* Type Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`px-2 py-1 rounded-full text-xs flex items-center ${
                        instructor.type === 'coach' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-purple-500 text-white'
                      }`}>
                        {instructor.type === 'coach' ? 'Coach' : 'Trainer'}
                      </div>
                    </div>

                    {/* Verification Badge */}
                    <div className="absolute top-4 right-4">
                      {verified ? (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <OutlineIcons.CheckBadgeIcon className="h-4 w-4 mr-1" />
                        Verified
                      </div>
                      ) : (
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <OutlineIcons.AcademicCapIcon className="h-4 w-4 mr-1" />
                          Pending
                    </div>
                  )}
                    </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {name}
                    </h3>
                    <div className="text-right">
                        {rating > 0 && (
                          <div className="flex items-center mb-1">
                            <OutlineIcons.StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{rating}</span>
                          </div>
                        )}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                          {experienceYears} {experienceYears === 1 ? 'year' : 'years'}
                        </div>
                    </div>
                  </div>

                    {bio && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {bio}
                    </p>
                  )}

                    {specialties && specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                          {specialties.slice(0, 3).map((specialty, _idx) => (
                          <span
                              key={_idx}
                              className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                          {specialties.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                    {certifications && certifications.length > 0 && certifications[0] && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Key Certifications:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                          {certifications[0]}
                          {certifications.length > 1 && (
                            <span className="text-gray-500"> +{certifications.length - 1} more</span>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {price}
                    </div>
                    <Link
                        to={`/trainer/${instructor.id}`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
} 