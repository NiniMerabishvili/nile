import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline'
import boxImage from '../assets/box.jpg'; // Import the image

// Mock data - replace with actual API calls
const mockGyms = [
  {
    id: 1,
    name: 'Fitness First',
    location: 'New York, USA',
    rating: 4.8,
    image: boxImage, // Use imported image
    amenities: ['Pool', '24/7 Access', 'Personal Training'],
    price: '$50/month',
    priceValue: 50
  },
  {
    id: 2,
    name: "Gold's Gym",
    location: 'Los Angeles, USA',
    rating: 4.6,
    image: boxImage, // Use imported image (can vary if more images become available)
    amenities: ['Cardio Area', 'Free Weights', 'Classes'],
    price: '$45/month',
    priceValue: 45
  },
  // Add more mock gyms...
]

export default function Gyms() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: '',
    amenities: '',
    rating: ''
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerFadeIn = (delay: number): Variants => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay } }
  })

  const filteredGyms = mockGyms.filter(gym => {
    // Search Query Filter (incorporating existing search)
    if (searchQuery && 
        !(gym.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          gym.location.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }

    // Price Range Filter
    if (filters.priceRange) {
      const [minStr, maxStr] = filters.priceRange.split('-');
      const minPrice = parseInt(minStr);
      const maxPrice = maxStr && maxStr !== '+' ? parseInt(maxStr) : Infinity;
      if (gym.priceValue < minPrice || gym.priceValue > maxPrice) {
        return false;
      }
    }

    // Amenities Filter
    if (filters.amenities) {
      if (!gym.amenities.map(a => a.toLowerCase()).includes(filters.amenities.toLowerCase())) {
        return false;
      }
    }

    // Rating Filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating); // e.g., "4+" -> 4
      if (gym.rating < minRating) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="-mt-8 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="max-w-2xl mx-auto space-y-4"
          >
            <h1 className="text-3xl font-bold text-white text-center">
              Find Your Perfect Gym
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by location or gym name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filters */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Add filter components here */}
              <select 
                name="priceRange" 
                value={filters.priceRange}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">Price Range</option>
                <option value="0-50">$0 - $50</option>
                <option value="51-100">$51 - $100</option>
                <option value="101+">$101+</option>
              </select>

              <select 
                name="amenities" 
                value={filters.amenities}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">Amenities</option>
                <option value="Pool">Pool</option>
                <option value="24/7 Access">24/7 Access</option>
                <option value="Classes">Classes</option>
                <option value="Personal Training">Personal Training</option>
                <option value="Free Weights">Free Weights</option>
                <option value="Cardio Area">Cardio Area</option>
              </select>

              <select 
                name="rating" 
                value={filters.rating}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </motion.div>
          )}
        </div>

        {/* Gym Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGyms.map((gym, index) => (
            <motion.div
              key={gym.id}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerFadeIn(index * 0.1)}
            >
              <Link to={`/gyms/${gym.id}`} className="block">
                <div className="card group hover:shadow-xl transition-shadow duration-200">
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={gym.image}
                      alt={gym.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{gym.name}</h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <MapPinIcon className="h-5 w-5 mr-1" />
                    <span>{gym.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                    <StarIcon className="h-5 w-5 mr-1 text-yellow-400" />
                    <span>{gym.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gym.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 text-sm bg-gray-100 dark:bg-dark-300 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-semibold">
                      {gym.price}
                    </span>
                    <button className="btn-primary">View Details</button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 