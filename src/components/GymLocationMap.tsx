import { useState, useEffect, useRef } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'

interface GymLocationMapProps {
  latitude: number
  longitude: number
  gymName: string
  address: string
}

export default function GymLocationMap({ latitude, longitude, gymName, address }: GymLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (mapRef.current && latitude && longitude && !mapInstance.current) {
      // Dynamically import Leaflet
      import('leaflet').then((L) => {
        try {
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
                <small>${address}</small>
              </div>
            `)

          setMapLoaded(true)
        } catch (error) {
          console.error('Error creating map:', error)
          setMapError(true)
        }
      }).catch((error) => {
        console.error('Error loading Leaflet:', error)
        setMapError(true)
      })
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [latitude, longitude, gymName, address])

  if (mapError) {
    return (
      <div className="w-full h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <MapPinIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Map unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
      <div ref={mapRef} style={{ height: '300px', width: '100%' }} />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
} 