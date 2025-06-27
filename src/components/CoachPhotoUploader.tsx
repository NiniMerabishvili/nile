import { useState, useRef } from 'react'
import { 
  XMarkIcon, 
  CloudArrowUpIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface CoachPhotoUploaderProps {
  photo: string
  onPhotoChange: (photo: string) => void
  className?: string
  coachName?: string
}

export default function CoachPhotoUploader({ 
  photo, 
  onPhotoChange, 
  className = "",
  coachName = "Coach"
}: CoachPhotoUploaderProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (!user) {
      toast.error('You must be logged in to upload images')
      return
    }

    // Only allow one file for coach photo
    const file = files[0]

    setUploading(true)
    setStorageError(null)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (5MB limit for profile photos)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `coaches/${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

      // Delete old uploaded photo if exists
      if (photo && photo.includes('gymimages')) {
        try {
          const pathMatch = photo.match(/gymimages\/(.+)$/)
          if (pathMatch) {
            const filePath = pathMatch[1]
            await supabase.storage.from('gymimages').remove([filePath])
          }
        } catch (error) {
          console.error('Error deleting old photo:', error)
        }
      }

      // Upload to Supabase Storage using 'gymimages' bucket
      const { error: uploadError } = await supabase.storage
        .from('gymimages')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        
        if (uploadError.message?.includes('Bucket not found')) {
          setStorageError('Storage bucket not found. Please contact support.')
          toast.error('Storage not properly configured. Please contact support.')
        } else {
          toast.error(`Failed to upload photo: ${uploadError.message}`)
        }
        return
      }

      // Get public URL
      const { data } = supabase.storage
        .from('gymimages')
        .getPublicUrl(fileName)

      if (data.publicUrl) {
        onPhotoChange(data.publicUrl)
        toast.success('Coach photo uploaded successfully')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleAddUrl = () => {
    if (!urlInput.trim()) return
    
    onPhotoChange(urlInput.trim())
    setUrlInput('')
    toast.success('Photo URL added successfully')
  }

  const handleRemovePhoto = async () => {
    // If it's an uploaded image, delete from storage
    if (photo && photo.includes('gymimages')) {
      try {
        const pathMatch = photo.match(/gymimages\/(.+)$/)
        if (pathMatch) {
          const filePath = pathMatch[1]
          await supabase.storage.from('gymimages').remove([filePath])
        }
      } catch (error) {
        console.error('Error deleting photo from storage:', error)
      }
    }

    onPhotoChange('')
    toast.success('Photo removed successfully')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleUploadAreaClick = () => {
    if (uploading || storageError) return
    fileInputRef.current?.click()
  }

  const dismissStorageError = () => {
    setStorageError(null)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Coach Photo (Optional)
      </label>

      {/* Storage Error Banner */}
      {storageError && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{storageError}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                You can still add a photo using URL below.
              </p>
            </div>
            <button
              onClick={dismissStorageError}
              className="ml-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Photo Preview */}
        <div className="space-y-4">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 relative">
            {photo ? (
              <>
                <img
                  src={photo}
                  alt={`${coachName} photo`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                {/* Photo source indicator */}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {photo.includes('gymimages') ? 'Uploaded' : 'URL'}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No photo yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="space-y-4">
          {/* Drag & Drop Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
            } ${
              storageError ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-300/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleUploadAreaClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={uploading || !!storageError}
            />
            
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto" />
                <div>
                  <p className="text-primary-600 hover:text-primary-700 font-medium">
                    Click to upload
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    or drag and drop
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {storageError ? 'Upload temporarily unavailable' : 'PNG, JPG, GIF up to 5MB'}
                </p>
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  className="input-field pl-10 text-sm"
                  placeholder="Or enter photo URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                />
              </div>
              <button
                type="button"
                onClick={handleAddUrl}
                className="btn-primary px-3 py-2 text-sm"
                disabled={!urlInput.trim()}
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Photo Tips
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Use a professional headshot or action shot</li>
              <li>• Square aspect ratio works best</li>
              <li>• Clear, well-lit photos get better response</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 