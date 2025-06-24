import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  StarIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { createCoachProfile } from '../lib/supabase'
import toast from 'react-hot-toast'

interface CoachRegistrationFormProps {
  onSuccess: () => void
  onBack: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

interface CoachFormData {
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

export default function CoachRegistrationForm({
  onSuccess,
  onBack,
  loading,
  setLoading
}: CoachRegistrationFormProps) {
  const [formData, setFormData] = useState<CoachFormData>({
    bio: '',
    specialties: [],
    experience_years: 0,
    certifications: ['']
  })

  const [newSpecialty, setNewSpecialty] = useState('')
  const [errors, setErrors] = useState<Partial<CoachFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CoachFormData> = {}

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

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setLoading(true)

    try {
      const validCertifications = formData.certifications.filter(cert => cert.trim())
      
      await createCoachProfile({
        bio: formData.bio.trim(),
        specialties: formData.specialties,
        experience_years: formData.experience_years,
        certifications: validCertifications,
        platform_fee_percentage: 5.0,
        is_verified: true
      })

      toast.success('Coach profile created successfully! You are now ready to start coaching.')
      
      setTimeout(() => {
        setLoading(false)
        onSuccess()
      }, 2500)
      
    } catch (error: any) {
      console.error('Error creating coach profile:', error)
      toast.error(error.message || 'Failed to create coach profile')
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AcademicCapIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Complete Your Coach Profile</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us about your expertise and experience to help students find you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio Section */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Professional Bio *
            </label>
            <textarea
              id="bio"
              rows={4}
              className={`input-field ${errors.bio ? 'border-red-500' : ''}`}
              placeholder="Tell potential students about your background, teaching philosophy, and what makes you unique as a coach..."
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
              Specialties * <span className="text-gray-500">(Select or add your areas of expertise)</span>
            </label>
            
            {/* Selected Specialties */}
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.specialties.map((specialty, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(index)}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </motion.span>
              ))}
            </div>

            {/* Specialty Selection */}
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
              Certifications * <span className="text-gray-500">(Add your professional certifications)</span>
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
                  Coach Revenue Structure
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  As a coach on our platform, you'll receive 95% of all tutorial sales and coaching fees. 
                  A 5% platform fee helps us maintain and improve the service for you and your students.
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
                  Creating Profile...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Complete Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
} 