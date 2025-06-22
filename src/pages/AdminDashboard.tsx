import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  TagIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { supabase, type Gym, getPendingTutorials, updateTutorialStatus, type Tutorial, getPendingGyms } from '@/lib/supabase'
import toast from 'react-hot-toast'
import DebugAdmin from '@/components/DebugAdmin'
import ImageDebugger from '@/components/ImageDebugger'
import GymImageDisplay from '@/components/GymImageDisplay'
import CategoryManager from '@/components/CategoryManager'
import TutorialDebugger from '@/components/TutorialDebugger'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'
type AdminTab = 'gyms' | 'categories' | 'tutorials'

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('gyms')
  const [gyms, setGyms] = useState<Gym[]>([])
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [pendingTutorials, setPendingTutorials] = useState<Tutorial[]>([])
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [showTutorialReviewModal, setShowTutorialReviewModal] = useState(false)

  const statusCounts = {
    all: gyms.length,
    pending: gyms.filter(g => g.status === 'pending').length,
    approved: gyms.filter(g => g.status === 'approved').length,
    rejected: gyms.filter(g => g.status === 'rejected').length,
  }

  useEffect(() => {
    if (isAdmin && activeTab === 'gyms') {
      fetchGyms()
    }
  }, [isAdmin, activeTab])

  useEffect(() => {
    if (isAdmin && activeTab === 'tutorials') {
      loadData()
    }
  }, [isAdmin, activeTab])

  useEffect(() => {
    filterGyms()
  }, [gyms, statusFilter, searchQuery])

  const fetchGyms = async () => {
    try {
      console.log('Fetching gyms for admin dashboard...')
      
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Gyms fetch result:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      setGyms(data || [])
      console.log('Set gyms state with:', data?.length, 'gyms')
    } catch (error: any) {
      console.error('Error fetching gyms:', error)
      toast.error(`Failed to fetch gyms: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filterGyms = () => {
    let filtered = gyms

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(gym => gym.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(gym =>
        gym.name.toLowerCase().includes(query) ||
        gym.city?.toLowerCase().includes(query) ||
        gym.country?.toLowerCase().includes(query) ||
        gym.address?.toLowerCase().includes(query)
      )
    }

    setFilteredGyms(filtered)
  }

  const handleApproval = async (gymId: number, newStatus: 'approved' | 'rejected') => {
    setProcessingId(gymId)
    try {
      console.log(`Updating gym ${gymId} status to ${newStatus}`)
      
      const { error } = await supabase
        .from('gyms')
        .update({ status: newStatus })
        .eq('id', gymId)

      if (error) throw error

      // Update local state
      setGyms(prev =>
        prev.map(gym =>
          gym.id === gymId ? { ...gym, status: newStatus } : gym
        )
      )

      toast.success(`Gym ${newStatus} successfully!`)
    } catch (error: any) {
      console.error(`Error ${newStatus} gym:`, error)
      toast.error(`Failed to ${newStatus} gym: ${error.message}`)
    } finally {
      setProcessingId(null)
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

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [gymsData, tutorialsData] = await Promise.all([
        getPendingGyms(),
        getPendingTutorials()
      ])
      
      console.log('Pending tutorials loaded:', tutorialsData?.length || 0)
      
      setGyms(gymsData)
      setPendingTutorials(tutorialsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveTutorial = async (tutorialId: string) => {
    try {
      await updateTutorialStatus(tutorialId, 'approved')
      toast.success('Tutorial approved successfully!')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve tutorial')
    }
  }

  const handleRejectTutorial = async (tutorialId: string) => {
    try {
      await updateTutorialStatus(tutorialId, 'rejected')
      toast.success('Tutorial rejected')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject tutorial')
    }
  }

  // Redirect if not admin
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-md">
          <div className="mx-auto h-24 w-24 text-red-500 mb-6">
            <InformationCircleIcon className="h-full w-full" />
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            You need admin privileges to access this dashboard.
          </p>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </button>
          {showDebug && (
            <div className="mt-4">
              <DebugAdmin />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Debug Toggle (for troubleshooting) */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </button>
      </div>

      {showDebug && (
        <div className="space-y-4">
          <DebugAdmin />
          <TutorialDebugger />
          <ImageDebugger />
        </div>
      )}

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-primary-100 text-lg">
              Manage gym applications, categories, and monitor platform activity
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <div className="text-sm text-primary-200">Total Gyms</div>
            </div>
            <div className="text-center">
              <ClockIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{statusCounts.pending}</div>
              <div className="text-sm text-primary-200">Pending</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
            <span>Gym Management</span>
            {statusCounts.pending > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {statusCounts.pending}
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
          <button
            onClick={() => setActiveTab('tutorials')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'tutorials'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <PlayIcon className="h-5 w-5" />
            <span>Tutorials</span>
            {pendingTutorials.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                {pendingTutorials.length}
              </span>
            )}
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

            {/* Rest of the gym management content... */}
            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-200 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Status Filters */}
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          statusFilter === status
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-400'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                          {statusCounts[status]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search gyms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-400 rounded-lg bg-white dark:bg-dark-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>

            {/* Gyms List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300"
            >
              <div className="p-6 border-b border-gray-100 dark:border-dark-300">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Gym Applications
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {filteredGyms.length} gym{filteredGyms.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading gyms...</p>
                  </div>
                </div>
              ) : filteredGyms.length === 0 ? (
                <div className="text-center py-16">
                  <BuildingOfficeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No gyms found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : statusFilter === 'pending'
                      ? 'No pending applications to review'
                      : `No ${statusFilter} gyms found`
                    }
                  </p>
                  {gyms.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Total gyms in database: {gyms.length}
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-300">
                  {filteredGyms.map((gym, index) => (
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
                                {gym.owner_name && (
                                  <span>Owner: {gym.owner_name}</span>
                                )}
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

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-400">
                            <button
                              onClick={() => setSelectedGym(gym)}
                              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 
                                       hover:bg-gray-100 dark:hover:bg-dark-400 rounded-lg transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span>View Details</span>
                            </button>

                            {gym.status === 'pending' && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleApproval(gym.id, 'approved')}
                                  disabled={processingId === gym.id}
                                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 
                                           text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                           shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                  <span>
                                    {processingId === gym.id ? 'Approving...' : 'Approve'}
                                  </span>
                                </button>
                                
                                <button
                                  onClick={() => handleApproval(gym.id, 'rejected')}
                                  disabled={processingId === gym.id}
                                  className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 
                                           text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                           shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                  <span>
                                    {processingId === gym.id ? 'Rejecting...' : 'Reject'}
                                  </span>
                                </button>
                              </div>
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
            <CategoryManager />
          </motion.div>
        )}

        {activeTab === 'tutorials' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Pending Tutorial Reviews</h2>
            {pendingTutorials.length === 0 ? (
              <div className="text-center py-8">
                <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No pending tutorials to review</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingTutorials.map((tutorial) => (
                  <div key={tutorial.id} className="card">
                    {tutorial.thumbnail_url && (
                      <img
                        src={tutorial.thumbnail_url}
                        alt={tutorial.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">{tutorial.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        By: {tutorial.coach?.full_name || tutorial.coach?.email}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {tutorial.description}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium capitalize">{tutorial.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Difficulty:</span>
                        <span className="font-medium capitalize">{tutorial.difficulty_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium">${tutorial.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">{tutorial.duration_minutes} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Submitted:</span>
                        <span className="font-medium">
                          {new Date(tutorial.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTutorial(tutorial)
                            setShowTutorialReviewModal(true)
                          }}
                          className="btn-secondary flex-1 flex items-center justify-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Review
                        </button>
                        <button
                          onClick={() => handleApproveTutorial(tutorial.id)}
                          className="btn-primary flex-1"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectTutorial(tutorial.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex-1"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Contact Information</h4>
                    <div className="space-y-3">
                      {selectedGym.phone_number && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{selectedGym.phone_number}</span>
                        </div>
                      )}
                      {selectedGym.email && (
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{selectedGym.email}</span>
                        </div>
                      )}
                      {selectedGym.website && (
                        <div className="flex items-center">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                          <a 
                            href={selectedGym.website.startsWith('http') ? selectedGym.website : `https://${selectedGym.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 break-all"
                          >
                            {selectedGym.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Location</h4>
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">{getLocationString(selectedGym)}</span>
                    </div>
                  </div>
                </div>

                {selectedGym.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {selectedGym.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showTutorialReviewModal && selectedTutorial && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowTutorialReviewModal(false)} />
            <div className="relative bg-white dark:bg-dark-200 rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Review Tutorial</h2>
                <button
                  onClick={() => setShowTutorialReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tutorial Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{selectedTutorial.title}</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Coach</label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedTutorial.coach?.full_name || selectedTutorial.coach?.email}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <p className="text-gray-900 dark:text-white">{selectedTutorial.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <p className="text-gray-900 dark:text-white capitalize">{selectedTutorial.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
                        <p className="text-gray-900 dark:text-white capitalize">{selectedTutorial.difficulty_level}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                        <p className="text-gray-900 dark:text-white">${selectedTutorial.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                        <p className="text-gray-900 dark:text-white">{selectedTutorial.duration_minutes} minutes</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTutorial.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Video URL</label>
                      <a
                        href={selectedTutorial.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary-600 hover:text-primary-500 break-all"
                      >
                        {selectedTutorial.video_url}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tutorial Preview */}
                <div>
                  {selectedTutorial.thumbnail_url && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Thumbnail</label>
                      <img
                        src={selectedTutorial.thumbnail_url}
                        alt={selectedTutorial.title}
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Revenue Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tutorial Price:</span>
                        <span>${selectedTutorial.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee (5%):</span>
                        <span className="text-red-600">-${selectedTutorial.platform_fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t border-gray-200 dark:border-gray-600 pt-2">
                        <span>Coach Earnings:</span>
                        <span className="text-green-600">${selectedTutorial.coach_earnings.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowTutorialReviewModal(false)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleRejectTutorial(selectedTutorial.id)
                    setShowTutorialReviewModal(false)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors flex-1"
                >
                  Reject Tutorial
                </button>
                <button
                  onClick={() => {
                    handleApproveTutorial(selectedTutorial.id)
                    setShowTutorialReviewModal(false)
                  }}
                  className="btn-primary flex-1"
                >
                  Approve Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 