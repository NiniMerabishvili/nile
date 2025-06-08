import { useState, useRef, useEffect } from 'react'
import { MapPinIcon, MagnifyingGlassIcon, GlobeAltIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface LocationData {
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
}

interface LocationSelectorProps {
  onLocationChange: (location: LocationData) => void
  initialValues?: Partial<LocationData>
}

interface SearchResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
  address: {
    house_number?: string
    road?: string
    city?: string
    state?: string
    country?: string
  }
}

export default function SimpleLocationSelector({ onLocationChange, initialValues }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    address: initialValues?.address || '',
    city: initialValues?.city || '',
    country: initialValues?.country || '',
    latitude: initialValues?.latitude || 0,
    longitude: initialValues?.longitude || 0,
  })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerInstance = useRef<any>(null)

  // Initialize map when showMap becomes true
  useEffect(() => {
    if (mapRef.current && !mapInstance.current && showMap) {
      import('leaflet').then((L) => {
        // Fix default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        const defaultLat = selectedLocation.latitude || 40.7128
        const defaultLng = selectedLocation.longitude || -74.0060

        mapInstance.current = L.map(mapRef.current!).setView([defaultLat, defaultLng], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current)

        if (selectedLocation.latitude && selectedLocation.longitude) {
          markerInstance.current = L.marker([selectedLocation.latitude, selectedLocation.longitude])
            .addTo(mapInstance.current)
        }

        mapInstance.current.on('click', handleMapClick)
      })
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [showMap])

  // Update map when selected location changes
  useEffect(() => {
    if (mapInstance.current && selectedLocation.latitude && selectedLocation.longitude) {
      import('leaflet').then((L) => {
        if (markerInstance.current) {
          mapInstance.current.removeLayer(markerInstance.current)
        }

        markerInstance.current = L.marker([selectedLocation.latitude, selectedLocation.longitude])
          .addTo(mapInstance.current)

        mapInstance.current.setView([selectedLocation.latitude, selectedLocation.longitude], 13)
      })
    }
  }, [selectedLocation.latitude, selectedLocation.longitude])

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
      )
      const data: SearchResult[] = await response.json()
      setSearchResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Error searching addresses:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(value)
    }, 500)
  }

  const handleResultSelect = (result: SearchResult) => {
    const locationData: LocationData = {
      address: `${result.address.house_number || ''} ${result.address.road || ''}`.trim() || result.display_name.split(',')[0],
      city: result.address.city || result.address.state || '',
      country: result.address.country || '',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    }

    setSelectedLocation(locationData)
    setSearchQuery(result.display_name)
    setShowResults(false) // Close dropdown after selection
    onLocationChange(locationData)
  }

  const handleMapClick = async (e: any) => {
    const lat = e.latlng.lat
    const lng = e.latlng.lng

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      const locationData: LocationData = {
        address: `${data.address?.house_number || ''} ${data.address?.road || ''}`.trim() || data.display_name.split(',')[0],
        city: data.address?.city || data.address?.state || '',
        country: data.address?.country || '',
        latitude: lat,
        longitude: lng
      }

      setSelectedLocation(locationData)
      setSearchQuery(data.display_name)
      setShowMap(false) // Close map after selection
      onLocationChange(locationData)
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      const locationData: LocationData = {
        address: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`,
        city: '',
        country: '',
        latitude: lat,
        longitude: lng,
      }
      setSelectedLocation(locationData)
      setShowMap(false)
      onLocationChange(locationData)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            )
            const data = await response.json()
            
            const locationData: LocationData = {
              address: `${data.address?.house_number || ''} ${data.address?.road || ''}`.trim() || data.display_name.split(',')[0],
              city: data.address?.city || data.address?.state || '',
              country: data.address?.country || '',
              latitude: lat,
              longitude: lng
            }

            setSelectedLocation(locationData)
            setSearchQuery(data.display_name)
            onLocationChange(locationData)
          } catch (error) {
            console.error('Error reverse geocoding:', error)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your current location.')
        }
      )
    }
  }

  const openInMaps = () => {
    if (selectedLocation.latitude && selectedLocation.longitude) {
      const url = `https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`
      window.open(url, '_blank')
    }
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowResults(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="space-y-6">
      {/* Address Search */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search Address *
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <input
            type="text"
            className="input-field pl-10 pr-12"
            placeholder="Start typing an address..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Map Icon at the end of input */}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-primary-600 hover:text-primary-700 transition-colors z-10"
            title="Choose location from map"
          >
            <MapPinIcon className="h-5 w-5" />
          </button>

          {isSearching && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {/* Search Results - Updated with gray background */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                className="w-full px-4 py-3 text-left hover:bg-gray-200 dark:hover:bg-gray-700 focus:bg-gray-200 dark:focus:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 transition-colors duration-150"
                onClick={() => handleResultSelect(result)}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {result.display_name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      {showMap && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">📍 Click on map to select location</h4>
            <button
              onClick={() => setShowMap(false)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 focus:bg-gray-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
        >
          <MapPinIcon className="h-5 w-5 mr-2" />
          Get Current Location
        </button>
      </div>

      {/* Selected Location Display */}
      {selectedLocation.address && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">📍 Selected Location:</h4>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Address:</strong> {selectedLocation.address}
                </p>
                {selectedLocation.city && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>City:</strong> {selectedLocation.city}
                  </p>
                )}
                {selectedLocation.country && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Country:</strong> {selectedLocation.country}
                  </p>
                )}
                <p className="text-gray-500 dark:text-gray-500 text-xs">
                  <strong>Coordinates:</strong> {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            
            {/* View on Map button in selected location box */}
            <button
              type="button"
              onClick={openInMaps}
              className="ml-4 inline-flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 text-white rounded-lg transition-colors duration-200 shadow-sm text-sm"
            >
              <GlobeAltIcon className="h-4 w-4 mr-1" />
              View on Map
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>How to select location:</strong>
        </p>
        <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
          <li>• Type an address in the search box above</li>
          <li>• Click the map icon in the search box to choose from map</li>
          <li>• Use the "Get Current Location" button</li>
          <li>• Click "View on Map" to see selected location in Google Maps</li>
        </ul>
      </div>
    </div>
  )
}