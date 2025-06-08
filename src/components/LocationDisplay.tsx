import { useState, useEffect, useRef } from 'react'
import { MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

interface LocationDisplayProps {
  latitude?: number
  longitude?: number
  address: string
  city?: string
  country?: string
  gymName: string
}

export default function LocationDisplay({ 
  latitude, 
  longitude, 
  address, 
  city, 
  country, 
  gymName 
}: LocationDisplayProps) {
  const fullAddress = [address, city, country].filter(Boolean).join(', ')
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  
  useEffect(() => {
    if (mapRef.current && latitude && longitude && !mapInstance.current) {
      // Dynamically import Leaflet
      import('leaflet').then((L) => {
        // Fix default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Create map
        mapInstance.current = L.map(mapRef.current!).setView([latitude, longitude], 15)

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current)

        // Add marker
        L.marker([latitude, longitude])
          .addTo(mapInstance.current)
          .bindPopup(`
            <div class="text-center">
              <strong>${gymName}</strong><br>
              <small>${fullAddress}</small>
            </div>
          `)
          .openPopup()

        setMapLoaded(true)
      }).catch((error) => {
        console.error('Error loading map:', error)
      })
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [latitude, longitude, gymName, fullAddress])
  
  const openInMaps = () => {
    if (latitude && longitude) {
      // Open in device's default map app
      const url = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`
      window.open(url, '_blank')
    } else if (fullAddress) {
      // Search by address
      const encodedAddress = encodeURIComponent(fullAddress)
      const url = `https://www.google.com/maps/search/${encodedAddress}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="space-y-4">
      {/* Address Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <MapPinIcon className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white font-medium">{address}</p>
            {(city || country) && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {[city, country].filter(Boolean).join(', ')}
              </p>
            )}
            {latitude && longitude && (
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* View on Map Button - Website's Primary Purple */}
        <button
          onClick={openInMaps}
          className="ml-4 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 text-white rounded-lg transition-colors duration-200 shadow-sm whitespace-nowrap"
        >
          <GlobeAltIcon className="h-5 w-5 mr-2" />
          View on Map
        </button>
      </div>

      {/* Interactive Map */}
      {latitude && longitude ? (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback when no coordinates */
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-200 dark:border-gray-700">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {gymName}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            {fullAddress}
          </p>
          <button
            onClick={openInMaps}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            View on Map
          </button>
        </div>
      )}
    </div>
  )
} 