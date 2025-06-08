import { useState, useEffect, useRef } from 'react'
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface LocationData {
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  display_name?: string
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
    postcode?: string
  }
}

export default function LocationSelector({ onLocationChange, initialValues }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    address: initialValues?.address || '',
    city: initialValues?.city || '',
    country: initialValues?.country || '',
    latitude: initialValues?.latitude || 40.7128,
    longitude: initialValues?.longitude || -74.0060,
  })
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markerInstance = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current && showMap) {
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
        mapInstance.current = L.map(mapRef.current!).setView(
          [selectedLocation.latitude, selectedLocation.longitude], 
          13
        )

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current)

        // Add initial marker if location exists
        if (selectedLocation.latitude && selectedLocation.longitude) {
          markerInstance.current = L.marker([selectedLocation.latitude, selectedLocation.longitude])
            .addTo(mapInstance.current)
        }

        // Add click event listener
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
        // Remove existing marker
        if (markerInstance.current) {
          mapInstance.current.removeLayer(markerInstance.current)
        }

        // Add new marker
        markerInstance.current = L.marker([selectedLocation.latitude, selectedLocation.longitude])
          .addTo(mapInstance.current)

        // Center map on new location
        mapInstance.current.setView([selectedLocation.latitude, selectedLocation.longitude], 13)
      })
    }
  }, [selectedLocation.latitude, selectedLocation.longitude])

  // Search for addresses using Nominatim API
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

  // Handle search input change with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(value)
    }, 500)
  }

  // Handle selecting a search result
  const handleResultSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    const locationData: LocationData = {
      address: `${result.address.house_number || ''} ${result.address.road || ''}`.trim() || result.display_name.split(',')[0],
      city: result.address.city || result.address.state || '',
      country: result.address.country || '',
      latitude: lat,
      longitude: lng,
      display_name: result.display_name
    }

    setSelectedLocation(locationData)
    setSearchQuery(result.display_name)
    setShowResults(false)
    onLocationChange(locationData)
  }

  // Handle map click
  const handleMapClick = async (e: any) => {
    const lat = e.latlng.lat
    const lng = e.latlng.lng

    try {
      // Reverse geocoding to get address from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      const locationData: LocationData = {
        address: `${data.address?.house_number || ''} ${data.address?.road || ''}`.trim() || data.display_name.split(',')[0],
        city: data.address?.city || data.address?.state || '',
        country: data.address?.country || '',
        latitude: lat,
        longitude: lng,
        display_name: data.display_name
      }

      setSelectedLocation(locationData)
      setSearchQuery(data.display_name)
      onLocationChange(locationData)
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      // Fallback - just use coordinates
      const locationData: LocationData = {
        address: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`,
        city: '',
        country: '',
        latitude: lat,
        longitude: lng,
      }
      setSelectedLocation(locationData)
      onLocationChange(locationData)
    }
  }

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          // Simulate a map click event
          handleMapClick({ latlng: { lat, lng } })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your current location. Please select on the map or search for an address.')
        }
      )
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
          Search Address
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <input
            type="text"
            className="input-field pl-10 pr-4"
            placeholder="Start typing an address..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown - Updated with gray background */}
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* View on Map Button - Purple styling */}
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 focus:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
        >
          <MapPinIcon className="h-5 w-5 mr-2" />
          {showMap ? 'Hide Map' : 'View on Map'}
        </button>

        {/* Get Current Location Button */}
        <button
          type="button"
          onClick={getCurrentLocation}
          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 focus:bg-gray-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
        >
          <MapPinIcon className="h-5 w-5 mr-2" />
          Get Current Location
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>How to select location:</strong>
        </p>
        <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
          <li>• Type an address in the search box above</li>
          <li>• Click the purple "View on Map" button to select on map</li>
          <li>• Use the "Get Current Location" button</li>
        </ul>
      </div>

      {/* Map Container - Only show when showMap is true */}
      {showMap && (
        <div className="h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>
      )}

      {/* Selected Location Display */}
      {selectedLocation.address && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">📍 Selected Location:</h4>
          <div className="space-y-1 text-sm">
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
      )}
    </div>
  )
} 