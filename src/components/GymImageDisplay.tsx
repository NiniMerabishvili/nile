import { useState } from 'react'
import { PhotoIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { AnimatePresence, motion } from 'framer-motion'

interface GymImageDisplayProps {
  images: string[]
  gymName: string
  className?: string
  showGallery?: boolean
}

export default function GymImageDisplay({ 
  images, 
  gymName, 
  className = "h-48",
  showGallery = false 
}: GymImageDisplayProps) {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    console.error(`Image ${index} failed to load:`, images[index])
    setImageErrors(prev => new Set([...prev, index]))
    setLoadingImages(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const handleImageLoad = (index: number) => {
    console.log('Image loaded successfully:', images[index])
    setLoadingImages(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const handleImageLoadStart = (index: number) => {
    setLoadingImages(prev => new Set([...prev, index]))
  }

  const validImages = images?.filter((img, index) => 
    img && 
    typeof img === 'string' && 
    img.trim() !== '' &&
    !imageErrors.has(index)
  ) || []

  const openGallery = (index: number) => {
    if (showGallery) {
      setCurrentImageIndex(index)
      setIsGalleryOpen(true)
    }
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  if (!validImages.length) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-dark-400 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-500`}>
        <div className="text-center">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-medium">No images available</p>
          {images && images.length > 0 && (
            <p className="text-xs text-red-500 mt-1">
              {images.length} image{images.length > 1 ? 's' : ''} failed to load
            </p>
          )}
        </div>
      </div>
    )
  }

  if (validImages.length === 1) {
    return (
      <div className={`${className} relative rounded-xl overflow-hidden shadow-lg group`}>
        {loadingImages.has(0) && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        )}
        <img
          src={validImages[0]}
          alt={gymName}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            showGallery ? 'group-hover:scale-105 cursor-pointer' : ''
          }`}
          onError={() => handleImageError(0)}
          onLoad={() => handleImageLoad(0)}
          onLoadStart={() => handleImageLoadStart(0)}
          onClick={() => openGallery(0)}
        />
        {showGallery && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <PhotoIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`${className} grid grid-cols-4 gap-2`}>
        {/* Main large image */}
        <div className="col-span-3 relative rounded-xl overflow-hidden shadow-lg group">
          {loadingImages.has(0) && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
              <div className="text-gray-500 text-sm">Loading...</div>
            </div>
          )}
          <img
            src={validImages[0]}
            alt={gymName}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              showGallery ? 'group-hover:scale-105 cursor-pointer' : ''
            }`}
            onError={() => handleImageError(0)}
            onLoad={() => handleImageLoad(0)}
            onLoadStart={() => handleImageLoadStart(0)}
            onClick={() => openGallery(0)}
          />
          {showGallery && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PhotoIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Smaller images on the right */}
        <div className="col-span-1 flex flex-col gap-2">
          {validImages.slice(1, 4).map((image, idx) => (
            <div 
              key={idx} 
              className="relative rounded-lg overflow-hidden shadow-md group flex-1"
            >
              {loadingImages.has(idx + 1) && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse z-10"></div>
              )}
              <img
                src={image}
                alt={`${gymName} ${idx + 2}`}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  showGallery ? 'group-hover:scale-105 cursor-pointer' : ''
                }`}
                onError={() => handleImageError(idx + 1)}
                onLoad={() => handleImageLoad(idx + 1)}
                onLoadStart={() => handleImageLoadStart(idx + 1)}
                onClick={() => openGallery(idx + 1)}
              />
              
              {/* Show "+X more" overlay on the last visible image if there are more */}
              {idx === 2 && validImages.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    +{validImages.length - 4} more
                  </span>
                </div>
              )}
              
              {showGallery && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              )}
            </div>
          ))}
          
          {/* Fill remaining space if less than 3 additional images */}
          {validImages.length < 4 && (
            <div className="flex-1 bg-gray-100 dark:bg-dark-400 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-500">
              <PhotoIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={closeGallery}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close button */}
              <button
                onClick={closeGallery}
                className="absolute top-4 right-4 z-60 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {/* Previous button */}
              {validImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
              )}

              {/* Current image */}
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                src={validImages[currentImageIndex]}
                alt={`${gymName} ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Next button */}
              {validImages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              )}

              {/* Image counter */}
              {validImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {validImages.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 