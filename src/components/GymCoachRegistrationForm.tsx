import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  StarIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { createGymCoach } from '../lib/supabase'
import CoachPhotoUploader from './CoachPhotoUploader'
import toast from 'react-hot-toast'

interface GymCoachRegistrationFormProps {
  onSuccess: () => void
  onBack: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
  gymId?: string | null
}

interface CoachFormData {
  name: string
  photo: string
  bio: string
  specialties: string[]
  experience_years: number
  certifications: string[]
}

const AVAILABLE_SPECIALTIES = [
  'Boxing',
  'MMA',
  'Brazilian Jiu-Jitsu',
  'Muay Thai',
  'Wrestling',
  'Karate',
  'Taekwondo',
  'Kickboxing',
  'Judo',
  'Kung Fu',
  'General Fitness',
  'Weight Training',
  'Cardio Training',
  'Flexibility Training',
  'Sports Performance'
]

export default function GymCoachRegistrationForm({
  onSuccess,
  onBack,
  loading,
  setLoading,
  gymId
}: GymCoachRegistrationFormProps) {
  const [formData, setFormData] = useState<CoachFormData>({
    name: '',
    photo: '',
    bio: '',
    specialties: [],
    experience_years: 0,
    certifications: ['']
  })

  const [newSpecialty, setNewSpecialty] = useState('')
  const [errors, setErrors] = useState<Partial<CoachFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CoachFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Coach name is required'
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required'
    } else if (formData.bio.length > 1000) {
      newErrors.bio = 'Bio must be less than 1000 characters'
    }

    if (formData.specialties.length === 0) {
      newErrors.specialties = ['At least one specialty is required']
    }

    if (formData.experience_years < 0) {
      newErrors.experience_years = 0
    } else if (formData.experience_years > 50) {
      newErrors.experience_years = 50
    }

    const validCertifications = formData.certifications.filter(cert => cert.trim())
    if (validCertifications.length === 0) {
      newErrors.certifications = ['At least one certification is required']
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Coach name is required'
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required'
    if (formData.specialties.length === 0) newErrors.specialties = 'At least one specialty is required'
    if (formData.experience_years < 0) newErrors.experience_years = 'Experience years cannot be negative'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    
    try {
      await createGymCoach({
        name: formData.name,
        photo: formData.photo,
        bio: formData.bio,
        specialties: formData.specialties,
        experience_years: formData.experience_years,
        certifications: formData.certifications,
        platform_fee_percentage: 5.0,
        is_verified: false,
        gym_id: gymId
      })

      toast.success('Coach added successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error creating coach:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create coach')
    } finally {
      setLoading(false)
    }
  }

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty]
      })
    }
    setNewSpecialty('')
  }

  const removeSpecialty = (index: number) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((_, i) => i !== index)
    })
  }

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, '']
    })
  }

  const updateCertification = (index: number, value: string) => {
    const updated = [...formData.certifications]
    updated[index] = value
    setFormData({
      ...formData,
      certifications: updated
    })
  }

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index)
    })
  }

  const handlePhotoChange = (photo: string) => {
    setFormData({ ...formData, photo })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white dark:bg-dark-200 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AcademicCapIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Add Coach</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Add a coach to your gym's team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Coach Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Coach Name *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="name"
                type="text"
                className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter coach's full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name}</span>
            )}
          </div>

          {/* Coach Photo */}
          <CoachPhotoUploader
            photo={formData.photo}
            onPhotoChange={handlePhotoChange}
            coachName={formData.name || "Coach"}
          />

          {/* Bio Section */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Professional Bio *
            </label>
            <textarea
              id="bio"
              rows={4}
              className={`input-field ${errors.bio ? 'border-red-500' : ''}`}
              placeholder="Tell about the coach's background, teaching philosophy, and expertise..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-red-500">{errors.bio}</span>
              <span className="text-sm text-gray-500">
                {formData.bio.length}/1000 characters
              </span>
            </div>
          </div>

          {/* Experience Years */}
          <div>
            <label htmlFor="experience" className="block text-sm font-medium mb-2">
              Years of Experience *
            </label>
            <div className="relative">
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="experience"
                type="number"
                min="0"
                max="50"
                className={`input-field pl-10 ${errors.experience_years ? 'border-red-500' : ''}`}
                placeholder="Enter years of coaching experience"
                value={formData.experience_years || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  experience_years: parseInt(e.target.value) || 0 
                })}
              />
            </div>
            {errors.experience_years && (
              <span className="text-sm text-red-500">Experience must be between 0 and 50 years</span>
            )}
          </div>

          {/* Specialties Section */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Specialties * <span className="text-gray-500">(Select or add coaching specialties)</span>
            </label>
            
            {/* Selected Specialties */}
            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <select
                className="input-field"
                value=""
                onChange={(e) => addSpecialty(e.target.value)}
              >
                <option value="">Select a specialty...</option>
                {AVAILABLE_SPECIALTIES.filter(s => !formData.specialties.includes(s)).map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Or add a custom specialty..."
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSpecialty(newSpecialty)
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => addSpecialty(newSpecialty)}
                  className="btn-secondary flex items-center"
                  disabled={!newSpecialty.trim()}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {errors.specialties && (
              <span className="text-sm text-red-500">At least one specialty is required</span>
            )}
          </div>

          {/* Certifications Section */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Certifications * <span className="text-gray-500">(Add professional certifications)</span>
            </label>
            
            <div className="space-y-3">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="e.g., NASM Certified Personal Trainer, CrossFit Level 2..."
                    value={cert}
                    onChange={(e) => updateCertification(index, e.target.value)}
                  />
                  {formData.certifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCertification}
                className="btn-secondary flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Another Certification
              </button>
            </div>

            {errors.certifications && (
              <span className="text-sm text-red-500">At least one certification is required</span>
            )}
          </div>

          {/* Platform Fee Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <StarIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Coach Information
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This coach will be associated with your gym. They won't have a user account but will be listed as part of your gym's coaching team.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding Coach...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Add Coach
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
} 