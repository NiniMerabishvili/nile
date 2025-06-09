import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MapPinIcon,
  StarIcon,
  ClockIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

// Mock data - replace with actual API call
const mockTrainer = {
  id: 1,
  name: 'John Smith',
  specialty: 'Strength Training',
  location: 'New York, USA',
  rating: 4.9,
  reviewCount: 48,
  image: '/trainer1.jpg',
  experience: '8 years',
  price: '$60/hour',
  bio: 'Certified personal trainer with 8 years of experience specializing in strength training and functional fitness. My approach focuses on building sustainable habits and achieving long-term results through personalized training programs.',
  certifications: [
    'NASM Certified Personal Trainer',
    'CrossFit Level 2 Trainer',
    'Precision Nutrition Level 1',
    'First Aid & CPR Certified'
  ],
  specialties: [
    'Strength Training',
    'Weight Loss',
    'Muscle Building',
    'Functional Fitness',
    'Sports Performance'
  ],
  availability: {
    'Monday - Friday': '6:00 AM - 8:00 PM',
    'Saturday': '8:00 AM - 2:00 PM',
    'Sunday': 'Closed'
  },
  packages: [
    {
      id: 'single',
      name: 'Single Session',
      price: '$60',
      description: 'Perfect for trying out my training style'
    },
    {
      id: '5pack',
      name: '5 Session Pack',
      price: '$275',
      description: 'Most popular choice for getting started'
    },
    {
      id: '10pack',
      name: '10 Session Pack',
      price: '$500',
      description: 'Best value for committed training'
    }
  ],
  clientReviews: [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      date: '2 weeks ago',
      comment: 'John is an amazing trainer! He helped me achieve my fitness goals and made every session challenging yet enjoyable.'
    },
    {
      id: 2,
      name: 'Mike R.',
      rating: 5,
      date: '1 month ago',
      comment: 'Great attention to form and very knowledgeable. Highly recommend!'
    }
  ]
}

export default function TrainerProfile() {
  const [selectedPackage, setSelectedPackage] = useState(mockTrainer.packages[0].id)

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative h-[400px] -mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 opacity-90" />
        <div className="absolute inset-0 bg-[url('/trainer-bg.jpg')] bg-cover bg-center mix-blend-overlay" />
        <div className="container mx-auto px-4 h-full">
          <div className="flex items-end h-full pb-8 relative z-10">
            <div className="flex items-end space-x-8">
              <img
                src={mockTrainer.image}
                alt={mockTrainer.name}
                className="w-40 h-40 rounded-xl object-cover border-4 border-white shadow-lg"
              />
              <div className="text-white pb-2">
                <h1 className="text-4xl font-bold mb-2">{mockTrainer.name}</h1>
                <p className="text-xl text-primary-100 mb-4">{mockTrainer.specialty}</p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>{mockTrainer.location}</span>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                    <span>{mockTrainer.rating}</span>
                    <span className="ml-2">({mockTrainer.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            {/* About */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">About Me</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {mockTrainer.bio}
              </p>
            </div>

            {/* Certifications */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Certifications</h2>
              <div className="space-y-3">
                {mockTrainer.certifications.map((cert) => (
                  <div
                    key={cert}
                    className="flex items-center text-gray-600 dark:text-gray-400"
                  >
                    <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-3" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {mockTrainer.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Availability</h2>
              <div className="space-y-4">
                {Object.entries(mockTrainer.availability).map(([days, hours]) => (
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

            {/* Reviews */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Client Reviews</h2>
              <div className="space-y-6">
                {mockTrainer.clientReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 dark:border-dark-300 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <h3 className="font-semibold mr-3">{review.name}</h3>
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className="h-5 w-5 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {review.comment}
                    </p>
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
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-6">Book a Session</h2>
                <div className="space-y-4">
                  {mockTrainer.packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPackage === pkg.id
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-300 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <span className="font-bold text-primary-600">{pkg.price}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pkg.description}
                      </p>
                    </button>
                  ))}
                </div>
                <button className="btn-primary w-full mt-6">
                  Book Selected Package
                </button>
              </div>

              {/* Contact Card */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
                <button className="btn-secondary w-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 