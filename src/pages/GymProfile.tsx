import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'
import { supabase, type Gym } from '@/lib/supabase'
import GymImageDisplay from '@/components/GymImageDisplay'
import toast from 'react-hot-toast'
import LocationDisplay from '@/components/LocationDisplay'
import PhotoGallery from '@/components/PhotoGallery'

export default function GymProfile() {
  const { id } = useParams()
  const [gym, setGym] = useState<Gym | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchGym(id)
    }
  }, [id])

  const fetchGym = async (gymId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', gymId)
        .single()

      if (fetchError) {
        console.error('Error fetching gym:', fetchError)
        setError('Failed to load gym details')
        toast.error('Failed to load gym details')
        return
      }

      if (!data) {
        setError('Gym not found')
        return
      }

      setGym(data)
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const getLocationString = (gym: Gym) => {
    const parts = [gym.address, gym.city, gym.country].filter(Boolean)
    return parts.join(', ')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !gym) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {error || 'Gym not found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The gym you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/gyms"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Gyms
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Link
          to="/gyms"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Gyms
        </Link>
      </div>

      {/* Image Gallery */}
      <section className="relative h-[500px] -mt-8">
        <GymImageDisplay
          images={gym.images || []}
          gymName={gym.name}
          className="h-full w-full"
          showGallery={true}
        />
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
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  {gym.name}
                </h1>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                  <MapPinIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                  <span>{getLocationString(gym)}</span>
                </div>
                {gym.status && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      gym.status === 'approved' 
                        ? 'bg-green-400' 
                        : gym.status === 'pending' 
                        ? 'bg-yellow-400' 
                        : 'bg-red-400'
                    }`}></span>
                    <span className={
                      gym.status === 'approved' 
                        ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/20' 
                        : gym.status === 'pending' 
                        ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/20' 
                        : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/20'
                    }>
                      {gym.status.charAt(0).toUpperCase() + gym.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {gym.description && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">About</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {gym.description}
                </p>
              </div>
            )}

            {/* Location & Map - Now shows real map */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Location & Map</h2>
              <LocationDisplay
                latitude={gym.latitude}
                longitude={gym.longitude}
                address={gym.address}
                city={gym.city}
                country={gym.country}
                gymName={gym.name}
              />
            </div>

            {/* Contact Information */}
            {(gym.phone_number || gym.email || gym.website) && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Contact Information</h2>
                <div className="space-y-3">
                  {gym.phone_number && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <a href={`tel:${gym.phone_number}`} className="text-primary-600 hover:text-primary-700 transition-colors">
                        {gym.phone_number}
                      </a>
                    </div>
                  )}
                  
                  {gym.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <a href={`mailto:${gym.email}`} className="text-primary-600 hover:text-primary-700 transition-colors">
                        {gym.email}
                      </a>
                    </div>
                  )}
                  
                  {gym.website && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <a 
                        href={gym.website.startsWith('http') ? gym.website : `https://${gym.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-6">
              {/* Quick Info Card */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Info</h3>
                <div className="space-y-3">
                  {gym.created_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Added:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(gym.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {gym.images && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Photos:</span>
                      <span className="text-gray-900 dark:text-white">
                        {gym.images.length} image{gym.images.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              {(gym.phone_number || gym.email || gym.website) && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Get in Touch</h3>
                  <div className="space-y-3">
                    {gym.phone_number && (
                      <a
                        href={`tel:${gym.phone_number}`}
                        className="btn-secondary w-full flex items-center justify-center"
                      >
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        Call Now
                      </a>
                    )}
                    
                    {gym.email && (
                      <a
                        href={`mailto:${gym.email}`}
                        className="btn-secondary w-full flex items-center justify-center"
                      >
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        Send Email
                      </a>
                    )}
                    
                    {gym.website && (
                      <a
                        href={gym.website.startsWith('http') ? gym.website : `https://${gym.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full flex items-center justify-center"
                      >
                        <GlobeAltIcon className="h-5 w-5 mr-2" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 