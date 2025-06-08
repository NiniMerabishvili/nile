import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api'
import { MapPinIcon } from '@heroicons/react/24/outline'

interface GymLocationMapProps {
  latitude: number
  longitude: number
  gymName: string
  address: string
}

const mapContainerStyle = {
  width: '100%',
  height: '300px'
}

export default function GymLocationMap({ latitude, longitude, gymName, address }: GymLocationMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

  const center = {
    lat: latitude,
    lng: longitude
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-75 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        <Marker
          position={center}
          title={`${gymName} - ${address}`}
        />
      </GoogleMap>
    </div>
  )
} 