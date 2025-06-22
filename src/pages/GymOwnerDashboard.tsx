import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BuildingOfficeIcon,
  TagIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  MapPinIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { getGymsByOwner, type Gym } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import CategoryManager from '@/components/CategoryManager'
import GymImageDisplay from '@/components/GymImageDisplay'

type OwnerTab = 'gyms' | 'categories'

export default function GymOwnerDashboard() {
  const { isGymOwner, user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<OwnerTab>('gyms')
  const [gyms, setGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)

  const statusCounts = {
    all: gyms.length,
    pending: gyms.filter(g => g.status === 'pending').length,
    approved: gyms.filter(g => g.status === 'approved').length,
    rejected: gyms.filter(g => g.status === 'rejected').length,
  }

  useEffect(() => {
    if (isGymOwner && user && activeTab === 'gyms') {
      fetchMyGyms()
    }
  }, [isGymOwner, user, activeTab])

  const fetchMyGyms = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await getGymsByOwner(user.id)
      setGyms(data)
    } catch (error: any) {
      console.error('Error fetching my gyms:', error)
      toast.error(`Failed to fetch your gyms: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getLocationString = (gym: Gym) => {
    return [gym.address, gym.city, gym.country].filter(Boolean).join(', ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your gym is currently under review by our admin team.'
      case 'approved':
        return 'Congratulations! Your gym is live and visible to users.'
      case 'rejected':
        return 'Your gym submission was not approved. Please contact support for details.'
      default:
        return ''
    }
  }

  // Redirect if not gym owner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isGymOwner) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md">
          <div className="mx-auto h-24 w-24 text-red-500 mb-6">
            <InformationCircleIcon className="h-full w-full" />
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            You need gym owner privileges to access this dashboard.
          </p>
          <Link to="/signup" className="btn-primary mt-4 inline-block">
            Become a Gym Owner
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gym Owner Dashboard</h1>
            <p className="text-primary-100 text-lg">
              Manage your gyms, add categories, and track your submissions
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <BuildingOfficeIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <div className="text-sm text-primary-200">Your Gyms</div>
            </div>
            <div className="text-center">
              <ClockIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{statusCounts.pending}</div>
              <div className="text-sm text-primary-200">Pending</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-dark-200 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-300"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/add-gym"
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add New Gym</span>
          </Link>
          <button
            onClick={() => setActiveTab('categories')}
            className="btn-secondary flex items-center space-x-2"
          >
            <TagIcon className="h-5 w-5" />
            <span>Manage Categories</span>
          </button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300"
      >
        <div className="flex border-b border-gray-100 dark:border-dark-300">
          <button
            onClick={() => setActiveTab('gyms')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'gyms'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BuildingOfficeIcon className="h-5 w-5" />
            <span>My Gyms</span>
            {statusCounts.all > 0 && (
              <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                {statusCounts.all}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'categories'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TagIcon className="h-5 w-5" />
            <span>Categories</span>
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'gyms' && (
          <motion.div
            key="gyms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Gyms', value: statusCounts.all, icon: BuildingOfficeIcon, color: 'blue' },
                { label: 'Pending', value: statusCounts.pending, icon: ClockIcon, color: 'yellow' },
                { label: 'Approved', value: statusCounts.approved, icon: CheckIcon, color: 'green' },
                { label: 'Rejected', value: statusCounts.rejected, icon: XMarkIcon, color: 'red' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-200 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Gyms List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300"
            >
              <div className="p-6 border-b border-gray-100 dark:border-dark-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Your Gyms
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {gyms.length} gym{gyms.length !== 1 ? 's' : ''} submitted
                    </p>
                  </div>
                  <Link to="/add-gym" className="btn-primary flex items-center space-x-2">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Gym</span>
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your gyms...</p>
                  </div>
                </div>
              ) : gyms.length === 0 ? (
                <div className="text-center py-16">
                  <BuildingOfficeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No gyms yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start by adding your first gym to the platform
                  </p>
                  <Link to="/add-gym" className="btn-primary">
                    Add Your First Gym
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-300">
                  {gyms.map((gym, index) => (
                    <motion.div
                      key={gym.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-dark-300/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {gym.name}
                              </h3>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{getLocationString(gym)}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {new Date(gym.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 ml-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(gym.status)}`}>
                                {gym.status.charAt(0).toUpperCase() + gym.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          {gym.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                              {gym.description}
                            </p>
                          )}

                          {/* Status Message */}
                          <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-dark-300">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Status:</strong> {getStatusMessage(gym.status)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-400">
                            <button
                              onClick={() => setSelectedGym(gym)}
                              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 
                                       hover:bg-gray-100 dark:hover:bg-dark-400 rounded-lg transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span>View Details</span>
                            </button>

                            {gym.status === 'approved' && (
                              <Link
                                to={`/gyms/${gym.id}`}
                                className="btn-primary text-sm px-4 py-2"
                              >
                                View Live Page
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CategoryManager showTitle={true} allowEdit={false} allowDelete={false} />
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> As a gym owner, you can add new categories that will be available for all gyms. 
                Only administrators can edit or delete existing categories.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gym Details Modal */}
      <AnimatePresence>
        {selectedGym && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedGym(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 dark:border-dark-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedGym.name}
                  </h3>
                  <button
                    onClick={() => setSelectedGym(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-dark-300">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Current Status</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getStatusMessage(selectedGym.status)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedGym.status)}`}>
                    {selectedGym.status.charAt(0).toUpperCase() + selectedGym.status.slice(1)}
                  </span>
                </div>

                {/* Images */}
                {selectedGym.images && selectedGym.images.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Images</h4>
                    <GymImageDisplay 
                      images={selectedGym.images} 
                      gymName={selectedGym.name} 
                      className="h-64" 
                      showGallery={true}
                    />
                  </div>
                )}

                {/* Description */}
                {selectedGym.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {selectedGym.description}
                    </p>
                  </div>
                )}

                {/* Categories */}
                {selectedGym.categories && selectedGym.categories.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGym.categories.map((category, index) => (
                        <span
                          key={category.id || index}
                          className="inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium"
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Location</h4>
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{getLocationString(selectedGym)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 