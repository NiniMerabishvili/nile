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
import boxTrainerImage from '../assets/box-trainer.jpg';
import karateImage from '../assets/karate.jpg';

// Mock data - replace with actual API calls
const mockTrainers = [
  {
    id: 1,
    name: 'John Smith',
    specialty: 'Strength Training',
    location: 'New York, USA',
    rating: 4.9,
    reviews: 48,
    image: boxTrainerImage,
    experience: '8 years',
    price: '$60/hour',
    certifications: ['NASM CPT', 'CrossFit L2']
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    specialty: 'Yoga',
    location: 'Los Angeles, USA',
    rating: 4.8,
    reviews: 36,
    image: karateImage,
    experience: '6 years',
    price: '$50/hour',
    certifications: ['RYT 500', 'Pilates Certified']
  },
  // Add more mock trainers...
]

export default function Trainers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerFadeIn = (delay: number): Variants => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay } }
  })

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
              Find Your Perfect Trainer
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by location or specialty..."
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
              <select className="input-field">
                <option value="">Specialty</option>
                <option value="strength">Strength Training</option>
                <option value="yoga">Yoga</option>
                <option value="cardio">Cardio</option>
                <option value="pilates">Pilates</option>
              </select>

              <select className="input-field">
                <option value="">Price Range</option>
                <option value="0-50">$0 - $50/hour</option>
                <option value="51-100">$51 - $100/hour</option>
                <option value="101+">$101+/hour</option>
              </select>

              <select className="input-field">
                <option value="">Experience</option>
                <option value="1-3">1-3 years</option>
                <option value="4-6">4-6 years</option>
                <option value="7+">7+ years</option>
              </select>
            </motion.div>
          )}
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockTrainers.map((trainer, index) => (
            <motion.div
              key={trainer.id}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerFadeIn(index * 0.1)}
            >
              <Link to={`/trainers/${trainer.id}`} className="block">
                <div className="card group hover:shadow-xl transition-shadow duration-200">
                  <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{trainer.name}</h3>
                  <p className="text-primary-600 font-medium mb-2">
                    {trainer.specialty}
                  </p>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <MapPinIcon className="h-5 w-5 mr-1" />
                    <span>{trainer.location}</span>
                  </div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                      <span>{trainer.rating}</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      ({trainer.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trainer.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-2 py-1 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Experience:
                      </span>
                      <span className="ml-2 font-medium">{trainer.experience}</span>
                    </div>
                    <span className="text-primary-600 font-semibold">
                      {trainer.price}
                    </span>
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