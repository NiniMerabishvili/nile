import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  XMarkIcon,
  AcademicCapIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { updateCoachProfile } from '../lib/supabase'
import toast from 'react-hot-toast'

interface CoachOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

const COMMON_SPECIALTIES = [
  'Boxing', 'MMA', 'Brazilian Jiu-Jitsu', 'Muay Thai', 'Wrestling',
  'Karate', 'Taekwondo', 'Kickboxing', 'General Fitness', 'Weight Training'
]

export default function CoachOnboardingModal({ isOpen, onClose, userId }: CoachOnboardingModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    bio: '',
    specialties: [] as string[],
    experience_years: 0,
    certifications: ['']
  })

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const updateCertification = (index: number, value: string) => {
    const updated = [...formData.certifications]
    updated[index] = value
    setFormData(prev => ({ ...prev, certifications: updated }))
  }

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }))
  }

  const removeCertification = (index: number) => {
    if (formData.certifications.length > 1) {
      setFormData(prev => ({
        ...prev,
        certifications: prev.certifications.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSkip = () => {
    toast.success('You can complete your profile anytime from your dashboard')
    onClose()
    navigate('/signin')
  }

  const handleSubmit = async () => {
    if (!formData.bio.trim() && formData.specialties.length === 0) {
      toast.error('Please add at least a bio or select your specialties')
      return
    }

    setLoading(true)
    try {
      const validCertifications = formData.certifications.filter(cert => cert.trim())
      
      await updateCoachProfile(userId, {
        bio: formData.bio.trim(),
        specialties: formData.specialties,
        experience_years: formData.experience_years,
        certifications: validCertifications.length > 0 ? validCertifications : [''],
      })

      toast.success('Coach profile updated successfully!')
      onClose()
      navigate('/coach-dashboard')
    } catch (error: any) {
      console.error('Error updating coach profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="inline-block w-full max-w-2xl px-6 py-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-dark-200 shadow-xl rounded-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-4">
                    <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Complete Your Coach Profile
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Help students find you by adding your expertise
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Bio Section */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Professional Bio
                    </label>
                    <textarea
                      rows={3}
                      className="input-field"
                      placeholder="Tell potential students about your background and expertise..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      maxLength={500}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {formData.bio.length}/500 characters
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Years of Experience
                    </label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        max="50"
                        className="input-field pl-10"
                        placeholder="Enter years of experience"
                        value={formData.experience_years || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          experience_years: parseInt(e.target.value) || 0 
                        })}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSkip}
                      className="btn-secondary flex-1"
                    >
                      Skip for Now
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="btn-primary flex-1"
                      disabled={!formData.bio.trim() && formData.experience_years === 0}
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Specialties */}
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Your Specialties <span className="text-gray-500">(Select all that apply)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {COMMON_SPECIALTIES.map((specialty) => (
                        <button
                          key={specialty}
                          type="button"
                          onClick={() => handleSpecialtyToggle(specialty)}
                          className={`
                            px-3 py-2 text-sm rounded-lg border-2 transition-all
                            ${formData.specialties.includes(specialty)
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }
                          `}
                        >
                          {specialty}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Key Certifications
                    </label>
                    <div className="space-y-2">
                      {formData.certifications.map((cert, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            className="input-field flex-1"
                            placeholder="e.g., NASM CPT, CrossFit Level 2..."
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
                        className="btn-secondary text-sm flex items-center"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Certification
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="btn-primary flex-1 flex items-center justify-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Complete Setup
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Footer Note */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <StarIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Good news!</strong> You'll earn 95% of all coaching fees. The 5% platform fee helps us maintain and improve the service.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
} 