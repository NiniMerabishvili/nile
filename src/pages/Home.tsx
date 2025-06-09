// import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  MapPinIcon,
  StarIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { isAdmin, isGymOwner } = useAuth()
  const videoSrc = '/gym-video.mp4'

  const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerFadeIn = (delay: number): Variants => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay } }
  })

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeIn}
              className="text-gray-900 dark:text-white text-center md:text-left"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Explore the Best Gyms & <span className="text-primary-500 dark:text-primary-400">Make Your Body Better</span>
              </h1>
              {/* Updated text color to be darker gray in light mode */}
              <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-700 dark:text-dark-300 max-w-xl mx-auto md:mx-0">
                Find and book the perfect gym or trainer anywhere in the world.
                Start your fitness journey today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/gyms" 
                  className="btn-primary bg-gray-900 dark:bg-light-100 text-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-200 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  Find Gyms
                </Link>
                <Link 
                  to="/trainers" 
                  className="btn-secondary bg-transparent hover:bg-gray-100 dark:hover:bg-dark-200 border-gray-500 dark:border-dark-400 text-gray-700 dark:text-gray-200 px-8 py-3 text-lg w-full sm:w-auto"
                >
                  Find Trainers
                </Link>
                {/* Add Gym button for admins and gym owners */}
                {(isAdmin || isGymOwner) && (
                  <Link 
                    to="/add-gym" 
                    className="btn-primary bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-0.5 w-full sm:w-auto flex items-center justify-center"
                  >
                    <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                    Add Gym
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Right Column: Gym Dark Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.6 } }}
              className="hidden md:flex justify-center items-center aspect-[4/3]"
            >
              <div className="w-full h-full bg-gray-200 dark:bg-dark-200 rounded-xl shadow-2xl overflow-hidden">
                <video
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* "Trusted by" Logos Section - Placeholder */}
        <div className="py-12 bg-gray-50 dark:bg-dark-200/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeIn}
              className="text-center"
            >
              {/* Updated text color */}
              <h3 className="text-sm font-semibold text-gray-600 dark:text-dark-400 uppercase tracking-wider mb-8">
                Trusted by leading fitness communities
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 gap-y-4">
                {/* Replace with actual SVG logos or images - Updated text color */}
                <p className="text-gray-500 dark:text-dark-500 text-2xl font-medium">Logo 1</p>
                <p className="text-gray-500 dark:text-dark-500 text-2xl font-medium">Logo 2</p>
                <p className="text-gray-500 dark:text-dark-500 text-2xl font-medium">Logo 3</p>
                <p className="text-gray-500 dark:text-dark-500 text-2xl font-medium">Logo 4</p>
                <p className="text-gray-500 dark:text-dark-500 text-2xl font-medium">Logo 5</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Why Choose Nile</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We make it easy to find and book the perfect gym or trainer,
            wherever you are in the world.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <MapPinIcon className="h-8 w-8" />,
              title: 'Global Access',
              description: 'Find gyms and trainers anywhere in the world'
            },
            {
              icon: <StarIcon className="h-8 w-8" />,
              title: 'Verified Reviews',
              description: 'Real reviews from real users'
            },
            {
              icon: <UserGroupIcon className="h-8 w-8" />,
              title: 'Expert Trainers',
              description: 'Connect with certified professional trainers'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerFadeIn(index * 0.2)}
              className="card text-center"
            >
              <div className="inline-flex p-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 dark:bg-dark-200 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Getting started with Nile is easy. Follow these simple steps to
              find your perfect gym or trainer.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MagnifyingGlassIcon className="h-8 w-8" />,
                title: 'Search',
                description: 'Find gyms and trainers in your desired location'
              },
              {
                icon: <CalendarIcon className="h-8 w-8" />,
                title: 'Book',
                description: 'Choose your preferred time slot and book instantly'
              },
              {
                icon: <ArrowRightIcon className="h-8 w-8" />,
                title: 'Start Training',
                description: 'Begin your fitness journey with confidence'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={staggerFadeIn(index * 0.2)}
                className="relative"
              >
                <div className="card">
                  <div className="inline-flex p-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-1/2 h-0.5 bg-primary-200 dark:bg-primary-800 transform translate-x-8" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 text-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
          className="card bg-primary-600 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of people who have already found their perfect gym
            or trainer through Nile.
          </p>
          <Link
            to="/gyms"
            className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
          >
            Get Started Now
          </Link>
        </motion.div>
      </section>
    </div>
  )
} 