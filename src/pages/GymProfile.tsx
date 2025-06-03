import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MapPinIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import gymImage1 from '../assets/box.jpg';
import gymImage2 from '../assets/karate.jpg';
import trainerImage1 from '../assets/box-trainer.jpg';
// Assuming a second trainer image, if available, or reuse
// import trainerImage2 from '../assets/some-other-trainer.jpg'; 

// Mock data - replace with actual API call
const mockGym = {
  id: 1,
  name: 'Fitness First',
  location: 'New York, USA',
  rating: 4.8,
  reviews: 156,
  description: 'A state-of-the-art fitness facility offering a wide range of equipment and classes for all fitness levels. Our experienced trainers are here to help you achieve your fitness goals.',
  images: [gymImage1, gymImage2, gymImage1, gymImage2], // Use imported images for gallery
  amenities: [
    'Pool',
    '24/7 Access',
    'Personal Training',
    'Group Classes',
    'Sauna',
    'Parking',
    'Lockers',
    'Towel Service'
  ],
  schedule: {
    'Monday - Friday': '5:00 AM - 11:00 PM',
    'Saturday - Sunday': '7:00 AM - 9:00 PM'
  },
  pricing: {
    monthly: '$50',
    annual: '$500',
    dayPass: '$15'
  },
  trainers: [
    {
      id: 1,
      name: 'John Smith',
      specialty: 'Strength Training',
      image: trainerImage1 // Use imported image
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      specialty: 'Yoga',
      image: trainerImage1 // Reuse trainerImage1, or use a different one if available (e.g., trainerImage2)
    }
  ]
}

export default function GymProfile() {
  const { id } = useParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'dayPass'>('monthly')

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <div className="space-y-8">
      {/* Image Gallery */}
      <section className="relative h-[500px] -mt-8">
        <motion.img
          key={selectedImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={mockGym.images[selectedImage]}
          alt={mockGym.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {mockGym.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`w-3 h-3 rounded-full ${
                index === selectedImage
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="lg:col-span-2 space-y-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{mockGym.name}</h1>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                  <MapPinIcon className="h-5 w-5 mr-1" />
                  <span>{mockGym.location}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                    <span>{mockGym.rating}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({mockGym.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {mockGym.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockGym.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center text-gray-600 dark:text-gray-400"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Schedule</h2>
              <div className="space-y-4">
                {Object.entries(mockGym.schedule).map(([days, hours]) => (
                  <div
                    key={days}
                    className="flex items-start justify-between text-gray-600 dark:text-gray-400"
                  >
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      <span>{days}</span>
                    </div>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trainers */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Our Trainers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockGym.trainers.map((trainer) => (
                  <div key={trainer.id} className="flex items-center space-x-4">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{trainer.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {trainer.specialty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="lg:col-span-1"
          >
            <div className="sticky top-24">
              <div className="card">
                <h2 className="text-xl font-semibold mb-6">Membership Plans</h2>
                <div className="space-y-4">
                  {[
                    { id: 'monthly', label: 'Monthly', price: mockGym.pricing.monthly },
                    { id: 'annual', label: 'Annual', price: mockGym.pricing.annual },
                    { id: 'dayPass', label: 'Day Pass', price: mockGym.pricing.dayPass }
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id as typeof selectedPlan)}
                      className={`w-full p-4 rounded-lg border-2 transition-colors ${
                        selectedPlan === plan.id
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-300 hover:border-primary-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{plan.label}</span>
                        <span className="text-primary-600 font-semibold">
                          {plan.price}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <button className="btn-primary w-full mt-6">
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 