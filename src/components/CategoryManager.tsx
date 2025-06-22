import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { getCategories, createCategory, type Category } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface CategoryManagerProps {
  showTitle?: boolean
  allowEdit?: boolean
  allowDelete?: boolean
}

export default function CategoryManager({ 
  showTitle = true, 
  allowEdit = true, 
  allowDelete = true 
}: CategoryManagerProps) {
  const { isAdmin, isGymOwner } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  // Check if user can manage categories
  const canManageCategories = isAdmin || isGymOwner

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    if (!canManageCategories) {
      toast.error('You do not have permission to manage categories')
      return
    }

    setSubmitting(true)
    try {
      if (editingCategory) {
        // Update existing category (we'd need to implement updateCategory function)
        toast.promise(
          Promise.resolve(), // Replace with actual update call when implemented
          {
            loading: 'Updating category...',
            success: 'Category editing will be implemented soon',
            error: 'Failed to update category'
          }
        )
      } else {
        // Create new category
        await createCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined
        })
        toast.success('Category created successfully!')
        await loadCategories()
        resetForm()
      }
    } catch (error: any) {
      console.error('Error saving category:', error)
      toast.error(error.message || 'Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setShowAddForm(false)
    setEditingCategory(null)
  }

  const startEdit = (category: Category) => {
    if (!allowEdit) {
      toast.error('Editing categories is not allowed in this view')
      return
    }
    
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!allowDelete) {
      toast.error('Deleting categories is not allowed in this view')
      return
    }

    if (!isAdmin) {
      toast.error('Only administrators can delete categories')
      return
    }
    
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }
    try {
      setSubmitting(true)
      await deleteCategory(categoryId)
      toast.success('Category deleted successfully')
      await loadCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      toast.error(error.message || 'Failed to delete category')
    } finally {
      setSubmitting(false)
    }
  }

  if (!canManageCategories) {
    return (
      <div className="text-center py-12">
        <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Access Denied
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You need to be an admin or gym owner to manage categories.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TagIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Category Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage categories that gyms can be assigned to
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        </div>
      )}

      {!showTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categories
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2 text-sm px-4 py-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-dark-200 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., CrossFit, Yoga, Strength Training"
                  required
                />
              </div>

              <div>
                <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="categoryDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center space-x-2"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>{submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'} Category</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-sm border border-gray-100 dark:border-dark-300">
        <div className="p-6 border-b border-gray-100 dark:border-dark-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Existing Categories
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} available
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No categories yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Create your first category to help organize gyms
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-300">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <TagIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {category.description}
                          </p>
                        )}
                        {category.created_at && (
                          <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                            Created {new Date(category.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {allowEdit && (
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Edit category"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    {allowDelete && isAdmin && (
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete category (Admin only)"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 

function deleteCategory(_categoryId: string) {
  throw new Error('Function not implemented.')
}
