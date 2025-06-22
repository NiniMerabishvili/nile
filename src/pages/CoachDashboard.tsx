import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PlayIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { 
  getAllTutorialsByCoach,
  createTutorial, 
  getCategories,
  type Tutorial, 
  type Category
} from '../lib/supabase';
import toast from 'react-hot-toast';

export default function CoachDashboard() {
  const { user, profile } = useAuth();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [tutorialForm, setTutorialForm] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    category: '',
    difficulty_level: 'beginner' as const,
    duration_minutes: 0,
    price: 0,
    tags: [] as string[],
    is_published: false
  });

  useEffect(() => {
    if (user && profile?.role === 'coach') {
      loadData();
    }
  }, [user, profile]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!user) {
        setLoading(false);
        return;
      }

      const [tutorialsData, categoriesData] = await Promise.all([
        getAllTutorialsByCoach(user.id),
        getCategories()
      ]);

      setTutorials(tutorialsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading coach data:', error);
      toast.error('Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) {
        throw new Error('User not found');
      }
      await createTutorial({
        ...tutorialForm,
        coach_id: user.id
      });
      toast.success('Tutorial submitted for review! You will be notified once it\'s approved.');
      setShowUploadModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload tutorial');
    }
  };

  const resetForm = () => {
    setTutorialForm({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      category: '',
      difficulty_level: 'beginner',
      duration_minutes: 0,
      price: 0,
      tags: [],
      is_published: false
    });
  };

  const calculateEarnings = (price: number) => {
    const platformFee = price * 0.05; // 5% platform fee
    const coachEarnings = price - platformFee;
    return { platformFee, coachEarnings };
  };

  if (profile?.role !== 'coach') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be registered as a coach to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Tutorials
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and manage your martial arts tutorials. Share your expertise with students worldwide!
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <PlayIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tutorials</p>
              <p className="text-2xl font-bold">{tutorials.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold">{tutorials.filter(t => t.status === 'approved').length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <PencilIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold">{tutorials.filter(t => t.status === 'pending').length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <XMarkIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold">{tutorials.filter(t => t.status === 'rejected').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Tutorials</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Upload Tutorial
        </button>
      </div>

      {/* Tutorials Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tutorials...</p>
        </div>
      ) : tutorials.length === 0 ? (
        <div className="text-center py-12">
          <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tutorials yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start sharing your martial arts expertise by uploading your first tutorial.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            Upload Your First Tutorial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="card">
              {tutorial.thumbnail_url ? (
                <img
                  src={tutorial.thumbnail_url}
                  alt={tutorial.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <PlayIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{tutorial.title}</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tutorial.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    tutorial.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {tutorial.status}
                  </span>
                  {tutorial.is_published && tutorial.status === 'approved' && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      Published
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {tutorial.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm font-medium capitalize">{tutorial.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Difficulty:</span>
                  <span className="text-sm font-medium capitalize">{tutorial.difficulty_level}</span>
                </div>
                {tutorial.duration_minutes != null && tutorial.duration_minutes > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <span className="text-sm font-medium">{tutorial.duration_minutes} min</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Price:</span>
                  <span className="text-primary-600 font-semibold">
                    ${tutorial.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Your Earnings:</span>
                  <span className="text-green-600 font-semibold">
                    ${tutorial.coach_earnings.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Platform Fee:</span>
                  <span className="text-red-600 font-medium">
                    ${tutorial.platform_fee.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button className="btn-secondary flex-1 flex items-center justify-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </button>
                <button className="btn-secondary flex-1 flex items-center justify-center">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowUploadModal(false)} />
            <div className="relative bg-white dark:bg-dark-200 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upload New Tutorial</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Platform Fee Information */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Platform Fee Information
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      A 5% platform fee will be deducted from your tutorial price to support platform maintenance and development.
                    </p>
                    {tutorialForm.price > 0 && (
                      <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/40 rounded text-sm">
                        <div className="flex justify-between">
                          <span>Tutorial Price:</span>
                          <span className="font-medium">${tutorialForm.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee (5%):</span>
                          <span className="text-red-600 font-medium">
                            -${calculateEarnings(tutorialForm.price).platformFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-blue-200 dark:border-blue-700 pt-1 mt-1">
                          <span>Your Earnings:</span>
                          <span className="text-green-600">
                            ${calculateEarnings(tutorialForm.price).coachEarnings.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateTutorial} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tutorial Title *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={tutorialForm.title}
                    onChange={(e) => setTutorialForm({...tutorialForm, title: e.target.value})}
                    placeholder="e.g., Advanced Boxing Footwork Techniques"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={tutorialForm.description}
                    onChange={(e) => setTutorialForm({...tutorialForm, description: e.target.value})}
                    placeholder="Describe what students will learn in this tutorial"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Video URL *</label>
                    <input
                      type="url"
                      required
                      className="input-field"
                      value={tutorialForm.video_url}
                      onChange={(e) => setTutorialForm({...tutorialForm, video_url: e.target.value})}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                    <input
                      type="url"
                      className="input-field"
                      value={tutorialForm.thumbnail_url}
                      onChange={(e) => setTutorialForm({...tutorialForm, thumbnail_url: e.target.value})}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      required
                      className="input-field"
                      value={tutorialForm.category}
                      onChange={(e) => setTutorialForm({...tutorialForm, category: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                    <select
                      className="input-field"
                      value={tutorialForm.difficulty_level}
                      onChange={(e) => setTutorialForm({...tutorialForm, difficulty_level: e.target.value as any})}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      value={tutorialForm.duration_minutes}
                      onChange={(e) => setTutorialForm({...tutorialForm, duration_minutes: parseInt(e.target.value) || 0})}
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="input-field"
                      value={tutorialForm.price}
                      onChange={(e) => setTutorialForm({...tutorialForm, price: parseFloat(e.target.value) || 0})}
                      placeholder="29.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="boxing, footwork, advanced, technique"
                    onChange={(e) => setTutorialForm({
                      ...tutorialForm, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Add relevant tags to help students find your tutorial
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={tutorialForm.is_published}
                    onChange={(e) => setTutorialForm({...tutorialForm, is_published: e.target.checked})}
                  />
                  <label htmlFor="is_published" className="text-sm">
                    Publish immediately (uncheck to save as draft)
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Upload Tutorial
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 