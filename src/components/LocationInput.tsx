import { useState } from 'react'
import { MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

interface LocationInputProps {
  onLocationChange: (location: {
    address: string
    city: string
    country: string
    latitude: number
    longitude: number
  }) => void
  initialValues?: {
    address?: string
    city?: string
    country?: string
    latitude?: number
    longitude?: number
  }
}

export default function LocationInput({ onLocationChange, initialValues }: LocationInputProps) {
  const [location, setLocation] = useState({
    address: initialValues?.address || '',
    city: initialValues?.city || '',
    country: initialValues?.country || '',
    latitude: initialValues?.latitude || 0,
    longitude: initialValues?.longitude || 0
  })

  const handleChange = (field: string, value: string | number) => {
    const updatedLocation = {
      ...location,
      [field]: value
    }
    setLocation(updatedLocation)
    
    // Only call onChange if we have the required fields
    if (updatedLocation.address && updatedLocation.city && updatedLocation.country) {
      onLocationChange(updatedLocation)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            ...location,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setLocation(newLocation)
          onLocationChange(newLocation)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your current location. Please enter it manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Street Address *
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="address"
              required
              className="input-field pl-10"
              placeholder="123 Main Street"
              value={location.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City *
          </label>
          <input
            type="text"
            id="city"
            required
            className="input-field"
            placeholder="New York"
            value={location.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country *
          </label>
          <input
            type="text"
            id="country"
            required
            className="input-field"
            placeholder="United States"
            value={location.country}
            onChange={(e) => handleChange('country', e.target.value)}
          />
        </div>
      </div>

      {/* Coordinates (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Latitude (Optional)
          </label>
          <input
            type="number"
            step="any"
            id="latitude"
            className="input-field"
            placeholder="40.7128"
            value={location.latitude || ''}
            onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Longitude (Optional)
          </label>
          <input
            type="number"
            step="any"
            id="longitude"
            className="input-field"
            placeholder="-74.0060"
            value={location.longitude || ''}
            onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Get Current Location Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <GlobeAltIcon className="h-5 w-5 mr-2" />
          Get Current Location
        </button>
      </div>

      {/* Location Summary */}
      {location.address && location.city && location.country && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Location Summary:</h4>
          <p className="text-gray-600 dark:text-gray-400">
            {location.address}, {location.city}, {location.country}
          </p>
          {(location.latitude !== 0 || location.longitude !== 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          )}
        </div>
      )}
    </div>
  )
} 