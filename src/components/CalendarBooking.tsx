import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, addDays, startOfToday, startOfWeek, isSameDay, isBefore } from 'date-fns'
import {
  ClockIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { createBooking, getCoachAvailability, type TimeSlot } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface CalendarBookingProps {
  coachId: string
  coachName: string
  basePrice: number
  experienceYears: number
  onBookingComplete: () => void
}

export default function CalendarBooking({
  coachId,
  coachName,
  basePrice,
  experienceYears,
  onBookingComplete
}: CalendarBookingProps) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [duration, setDuration] = useState<number>(60)
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  // 🔧 FIX: Start from the actual beginning of the week (Sunday)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(startOfToday(), { weekStartsOn: 0 }) // 0 = Sunday
  )

  // Generate calendar days for the current week
  const generateWeekDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i))
    }
    return days
  }

  // Load availability when date changes
  useEffect(() => {
    if (selectedDate && coachId) {
      loadAvailabilityForDate(selectedDate)
    }
  }, [selectedDate, coachId])

  const loadAvailabilityForDate = async (date: Date) => {
    setLoadingAvailability(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const slots = await getCoachAvailability(coachId, dateStr)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error loading availability:', error)
      toast.error('Failed to load availability')
      setAvailableSlots([])
    } finally {
      setLoadingAvailability(false)
    }
  }

  const calculatePrice = () => {
    const experienceMultiplier = 1 + (experienceYears * 0.1)
    const durationMultiplier = duration / 60
    return Math.round(basePrice * experienceMultiplier * durationMultiplier)
  }

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book a session')
      return
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      await createBooking({
        coachId,
        date: dateStr,
        startTime: selectedTime,
        duration,
        price: calculatePrice(),
        notes: notes || undefined
      })

      toast.success(`✅ Session booked! Training with ${coachName} on ${format(selectedDate, 'MMM d')} at ${selectedTime}`)
      
      // Reset form
      setSelectedDate(null)
      setSelectedTime('')
      setNotes('')
      setDuration(60)
      setAvailableSlots([])
      
      onBookingComplete()
      
    } catch (error: any) {
      console.error('Booking error:', error)
      toast.error(error.message || 'Failed to book session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7))
  }

  const isDateDisabled = (date: Date) => {
    const today = startOfToday()
    return isBefore(date, today) || date.getDay() === 0 // Disable past dates and Sundays
  }

  const weekDays = generateWeekDays()
  const today = startOfToday()

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Choose Your Session Date
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select a date and time that works for you
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <button
          onClick={goToPreviousWeek}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </span>
        
        <button
          onClick={goToNextWeek}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
        
        {weekDays.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isDisabled = isDateDisabled(date)
          const isToday = isSameDay(date, today)
          
          return (
            <motion.button
              key={date.toISOString()}
              onClick={() => !isDisabled && setSelectedDate(date)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className={`
                relative h-12 rounded-lg text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-primary-600 text-white shadow-lg'
                  : isDisabled
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : isToday
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }
              `}
            >
              {format(date, 'd')}
              {isToday && !isSelected && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h4 className="font-medium text-gray-900 dark:text-white">
              Available times for {format(selectedDate, 'EEEE, MMMM d')}
            </h4>
          </div>
          
          {loadingAvailability ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <XCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No availability on this date
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSlots.map((slot) => (
                <motion.button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  whileHover={slot.available ? { scale: 1.02 } : {}}
                  whileTap={slot.available ? { scale: 0.98 } : {}}
                  className={`
                    relative p-3 rounded-lg text-sm font-medium transition-all duration-200 border
                    ${selectedTime === slot.time
                      ? 'bg-primary-600 text-white border-primary-600 shadow-lg'
                      : slot.available
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{format(new Date(`2000-01-01T${slot.time}`), 'h:mm a')}</span>
                  </div>
                  
                  {selectedTime === slot.time && (
                    <CheckCircleIconSolid className="absolute -top-1 -right-1 h-5 w-5 text-green-500" />
                  )}
                  
                  {!slot.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 dark:bg-gray-800/90 rounded-lg">
                      <span className="text-xs text-gray-500 dark:text-gray-400 px-2 text-center">
                        {slot.reason}
                      </span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Session Details */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={60}>1 Hour</option>
              <option value={90}>1.5 Hours</option>
              <option value={120}>2 Hours</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific goals, injuries to consider, or preferences for this session?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Price Summary */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-4 rounded-lg border border-primary-200 dark:border-primary-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="font-medium text-gray-900 dark:text-white">Session Total</span>
              </div>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ${calculatePrice()}
              </span>
            </div>
            
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Base price:</span>
                <span>${basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Experience multiplier ({experienceYears} years):</span>
                <span>+{Math.round(experienceYears * 10)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Duration ({duration} minutes):</span>
                <span>×{duration / 60}</span>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h5 className="font-medium text-gray-900 dark:text-white mb-3">Booking Summary</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Coach:</span>
                <span className="font-medium text-gray-900 dark:text-white">{coachName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(`2000-01-01T${selectedTime}`), 'h:mm a')} ({duration} min)
                </span>
              </div>
            </div>
          </div>

          {/* Book Button */}
          <motion.button
            onClick={handleBooking}
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className={`
              w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2
              ${loading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Booking...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-6 w-6" />
                <span>Book Training Session</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Sessions can be cancelled up to 24 hours in advance for a full refund
        </p>
      </div>
    </div>
  )
} 