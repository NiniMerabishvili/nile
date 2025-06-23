import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  UserIcon,
  AcademicCapIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import RegistrationStepper from '../components/RegistrationStepper'
import CoachRegistrationForm from '../components/CoachRegistrationForm'
import { signUp, getCoachProfile } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const REGISTRATION_STEPS = [
  {
    id: 1,
    name: 'Account Setup',
    description: 'Create your account',
    icon: UserIcon
  },
  {
    id: 2,
    name: 'Coach Profile',
    description: 'Add your expertise',
    icon: AcademicCapIcon
  },
  {
    id: 3,
    name: 'Complete',
    description: 'Ready to coach',
    icon: CheckCircleIcon
  }
]

interface UserFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export default function CoachRegistration() {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(2) // Default to step 2 since users come here after signup
  const [loading, setLoading] = useState(false)
  const [userFormData, setUserFormData] = useState<UserFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Simple logic: if user is authenticated as coach, check for existing coach profile
  useEffect(() => {
    if (!authLoading) {
      if (user && profile?.role === 'coach') {
        // Check if coach profile exists
        getCoachProfile(user.id)
          .then(coachProfile => {
            if (coachProfile) {
              // Coach profile exists, redirect to dashboard
              navigate('/coach/dashboard')
            } else {
              // Coach profile doesn't exist, stay on step 2
              setCurrentStep(2)
            }
          })
          .catch(error => {
            console.error('Error checking coach profile:', error)
            // On error, assume no profile exists and show step 2
            setCurrentStep(2)
          })
      } else if (!user) {
        // No user authenticated, show step 1
        setCurrentStep(1)
      }
    }
  }, [user, profile, authLoading, navigate])

  const handleUserRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
  
    // Basic validation
    const { fullName, email, password, confirmPassword } = userFormData
  
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.')
      return
    }
  
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
  
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }
  
    setLoading(true)
  
    try {
      // Create user account with coach role (last two booleans: isStudent, isCoach)
      await signUp(email, password, fullName)
  
      toast.success('Account created successfully! Please complete your coach profile.')
  
      // Move to step 2
      setCurrentStep(2)
  
      // Optionally reset the form fields if you want to clear input after success
      setUserFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      })
  
    } catch (error: any) {
      console.error('Error during registration:', error)
      toast.error(error?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  

  const handleCoachProfileSuccess = () => {
    setCurrentStep(3)
    setTimeout(() => {
      navigate('/coach/dashboard')
    }, 2000)
  }

  const handleBackToUserForm = () => {
    if (!user) {
      setCurrentStep(1)
    }
  }

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-100 dark:via-dark-200 dark:to-dark-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-dark-100 dark:via-dark-200 dark:to-dark-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Become a Coach
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {user ? 
              'Complete your coach profile to start offering your services' : 
              'Join our platform and start sharing your expertise with students worldwide'
            }
          </p>
        </div>

        {/* Stepper */}
        <RegistrationStepper currentStep={currentStep} steps={REGISTRATION_STEPS} />

        {/* Debug info (remove this in production) */}
        <div className="mt-4 text-center text-sm text-gray-500 bg-gray-100 p-2 rounded">
          <strong>Debug:</strong> Step {currentStep} | User: {user ? 'Yes' : 'No'} | Role: {profile?.role || 'None'} | Auth Loading: {authLoading ? 'Yes' : 'No'}
        </div>

        {/* Forms */}
        <div className="mt-8">
          {/* Step 1: Account Creation (for users who come directly to this page) */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <div className="card">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start by setting up your basic account information
                  </p>
                </div>

                <form onSubmit={handleUserRegistration} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      className="input-field"
                      placeholder="Enter your full name"
                      value={userFormData.fullName}
                      onChange={(e) => setUserFormData({
                        ...userFormData,
                        fullName: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="input-field"
                      placeholder="Enter your email address"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({
                        ...userFormData,
                        email: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password *
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      className="input-field"
                      placeholder="Create a strong password"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({
                        ...userFormData,
                        password: e.target.value
                      })}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      className="input-field"
                      placeholder="Confirm your password"
                      value={userFormData.confirmPassword}
                      onChange={(e) => setUserFormData({
                        ...userFormData,
                        confirmPassword: e.target.value
                      })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account & Continue'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Step 2: Coach Profile */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto">
              <CoachRegistrationForm
                onSuccess={handleCoachProfileSuccess}
                onBack={handleBackToUserForm}
                loading={loading}
                setLoading={setLoading}
              />
            </div>
          )}

          {/* Step 3: Completion */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="card">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Registration Complete!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your coach profile has been created successfully and is now verified. 
                  You can start offering your services immediately.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>You're all set!</strong><br />
                    • Create and publish tutorial content<br />
                    • Offer personalized coaching feedback<br />
                    • Your profile is live and searchable
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Redirecting to your dashboard...
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 