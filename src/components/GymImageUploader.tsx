import { useState, useRef } from 'react'
import { 
  XMarkIcon, 
  PlusIcon,
  CloudArrowUpIcon,
  LinkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface GymImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export default function GymImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  className = ""
}: GymImageUploaderProps) {
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

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    setStorageError(null)
    
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file`)
          continue
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 10MB`)
          continue
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

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
            setStorageError('Storage bucket not found. Please contact support or create the gymimages bucket in your Supabase dashboard.')
            toast.error('Storage not properly configured. Please contact support.')
            break
          } else {
            toast.error(`Failed to upload ${file.name}: ${uploadError.message}`)
          }
          continue
        }

        // Get public URL
        const { data } = supabase.storage
          .from('gymimages')
          .getPublicUrl(fileName)

        if (data.publicUrl) {
          newImages.push(data.publicUrl)
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages])
        toast.success(`${newImages.length} image(s) uploaded successfully`)
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleAddUrl = () => {
    if (!urlInput.trim()) return
    
    if (images.includes(urlInput.trim())) {
      toast.error('This image URL is already added')
      return
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    onImagesChange([...images, urlInput.trim()])
    setUrlInput('')
    toast.success('Image URL added successfully')
  }

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index]
    
    // If it's an uploaded image (contains our storage path), delete from storage
    if (imageUrl.includes('gymimages')) {
      try {
        const pathMatch = imageUrl.match(/gymimages\/(.+)$/)
        if (pathMatch) {
          const filePath = pathMatch[1]
          await supabase.storage.from('gymimages').remove([filePath])
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }

    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    toast.success('Image removed successfully')
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

  const dismissStorageError = () => {
    setStorageError(null)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Gym Photos (Optional) - {images.length}/{maxImages}
      </label>

      {/* Storage Error Banner */}
      {storageError && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{storageError}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                You can still add images using URLs below.
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

      {/* Upload Options */}
      <div className="space-y-4">
        {/* Drag & Drop Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''} ${storageError ? 'opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            disabled={uploading || images.length >= maxImages || !!storageError}
          />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading images...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={images.length >= maxImages || !!storageError}
                >
                  Click to upload
                </button>
                <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                {storageError ? 'File upload temporarily unavailable' : 'PNG, JPG, GIF up to 10MB each'}
              </p>
            </div>
          )}
        </div>

        {/* URL Input - Always available */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="url"
              className="input-field pl-10"
              placeholder="Or enter image URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={images.length >= maxImages}
              onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
            />
          </div>
          <button
            type="button"
            onClick={handleAddUrl}
            className="btn-primary px-4 py-2"
            disabled={!urlInput.trim() || images.length >= maxImages}
          >
            Add URL
          </button>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={image}
                    alt={`Gym photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                {/* Image source indicator */}
                <div className="absolute bottom-1 left-1 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.includes('gymimages') ? 'Uploaded' : 'URL'}
                </div>
              </div>
            ))}
            
            {/* Add more button */}
            {images.length < maxImages && !storageError && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors flex items-center justify-center text-gray-400 hover:text-primary-500"
                disabled={uploading}
              >
                <div className="text-center">
                  <PlusIcon className="h-8 w-8 mx-auto mb-1" />
                  <span className="text-xs">Add More</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 