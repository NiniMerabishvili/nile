import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AdjustmentsHorizontalIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { getGyms, type Gym } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function Gyms() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    city: '',
    country: ''
  })

  useEffect(() => {
    fetchGyms()
  }, [])

  useEffect(() => {
    filterGyms()
  }, [gyms, searchQuery, filters])

  const fetchGyms = async () => {
    try {
      const data = await getGyms()
      setGyms(data)
    } catch (error) {
      console.error('Error fetching gyms:', error)
      toast.error('Failed to load gyms')
    } finally {
      setLoading(false)
    }
  }

  const filterGyms = () => {
    let filtered = gyms

    // Search Query Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(gym =>
        gym.name.toLowerCase().includes(query) ||
        gym.city.toLowerCase().includes(query) ||
        gym.country.toLowerCase().includes(query) ||
        gym.address.toLowerCase().includes(query)
      )
    }

    // City Filter
    if (filters.city) {
      filtered = filtered.filter(gym =>
        gym.city.toLowerCase().includes(filters.city.toLowerCase())
      )
    }

    // Country Filter
    if (filters.country) {
      filtered = filtered.filter(gym =>
        gym.country.toLowerCase().includes(filters.country.toLowerCase())
      )
    }

    setFilteredGyms(filtered)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }))
  }

  const getLocationString = (gym: Gym) => {
    return [gym.city, gym.country].filter(Boolean).join(', ')
  }

  const getUniqueValues = (key: keyof Gym) => {
    const values = gyms.map(gym => gym[key] as string).filter(Boolean)
    return [...new Set(values)].sort()
  }

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerFadeIn = (delay: number): Variants => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay } }
  })

  return (
    <div className="space-y-8">
      {/* Page Title and Search - No background, directly on body */}
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Perfect Gym
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Discover amazing fitness facilities around the world
          </p>
          
          {/* Search bar directly on page */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by location or gym name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 rounded-xl border border-gray-300 dark:border-dark-400 shadow-lg text-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none
                         bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-6 py-3 bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300 hover:shadow-md transition-shadow"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Filters</span>
            <span className="text-sm text-gray-500">
              ({filteredGyms.length} gyms)
            </span>
          </button>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-6 bg-white dark:bg-dark-200 rounded-lg shadow-sm border border-gray-200 dark:border-dark-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <select 
                    name="city" 
                    value={filters.city}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-300"
                  >
                    <option value="">All Cities</option>
                    {getUniqueValues('city').map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <select 
                    name="country" 
                    value={filters.country}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-300"
                  >
                    <option value="">All Countries</option>
                    {getUniqueValues('country').map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredGyms.length} of {gyms.length} gyms
                </span>
                <button
                  onClick={() => {
                    setFilters({ city: '', country: '' })
                    setSearchQuery('')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Clear all filters
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredGyms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BuildingOfficeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No gyms found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search criteria or clearing the filters.
            </p>
            <button
              onClick={() => {
                setFilters({ city: '', country: '' })
                setSearchQuery('')
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGyms.map((gym, index) => (
              <motion.div
                key={gym.id}
                initial="initial"
                animate="animate"
                variants={staggerFadeIn(index * 0.1)}
                className="card hover-card"
              >
                <Link to={`/gyms/${gym.id}`} className="block">
                  {/* Gym Image */}
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    {gym.images && gym.images.length > 0 ? (
                      <img
                        src={gym.images[0]}
                        alt={gym.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-dark-400 flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {gym.images && gym.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{gym.images.length - 1} more
                      </div>
                    )}
                  </div>

                  {/* Gym Details */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {gym.name}
                    </h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{getLocationString(gym)}</span>
                    </div>
                    {gym.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {gym.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 