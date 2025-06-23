import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { isCoachProfileComplete } from '../lib/supabase'

export default function CoachCompletionBanner() {
  const { user, profile } = useAuth()
  const [showBanner, setShowBanner] = useState(false)
  const [isIncomplete, setIsIncomplete] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isCoach = profile?.role === 'coach'

  useEffect(() => {
    const checkCompletion = async () => {
      if (isCoach && user && !dismissed) {
        try {
          const isComplete = await isCoachProfileComplete(user.id)
          setIsIncomplete(!isComplete)
          setShowBanner(!isComplete)
        } catch (error) {
          console.error('Error checking coach completion:', error)
          // If there's an error checking, assume incomplete and show banner
          setIsIncomplete(true)
          setShowBanner(true)
        }
      } else {
        setShowBanner(false)
      }
    }

    checkCompletion()
  }, [isCoach, user, dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    setShowBanner(false)
  }

  if (!isCoach || !isIncomplete || !showBanner) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-yellow-100 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Your coach profile is incomplete. Complete it to get verified and appear on the trainers page.
                </span>
                <Link
                  to="/coach/registration"
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
                >
                  <AcademicCapIcon className="h-4 w-4 mr-1" />
                  Complete Now
                </Link>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 