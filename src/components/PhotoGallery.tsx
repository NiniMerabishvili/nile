import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline'

interface PhotoGalleryProps {
  images: string[]
  gymName: string
  className?: string
}

export default function PhotoGallery({ images, gymName, className = "" }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex !== null && images.length > 0) {
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null && images.length > 0) {
      setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0)
    }
  }

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <PhotoIcon className="mx-auto h-12 w-12 mb-2" />
          <p>No photos available</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Image Grid */}
      <div className={`space-y-4 ${className}`}>
        {/* Main Image */}
        <div className="relative">
          <img
            src={images[0]}
            alt={`${gymName} main photo`}
            className="w-full h-96 object-cover rounded-lg cursor-pointer"
            onClick={() => openLightbox(0)}
          />
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
              1 / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.slice(1, 5).map((image, index) => (
              <div key={index + 1} className="relative">
                <img
                  src={image}
                  alt={`${gymName} photo ${index + 2}`}
                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openLightbox(index + 1)}
                />
                {index === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded cursor-pointer"
                       onClick={() => openLightbox(4)}>
                    <span className="text-white font-medium">+{images.length - 5}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              {selectedIndex + 1} / {images.length}
            </div>

            {/* Main Image */}
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={images[selectedIndex]}
              alt={`${gymName} photo ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-75 transition-all"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-75 transition-all"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 