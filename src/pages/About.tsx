import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import PageHero from '@/components/PageHero'
import {
  GlobeAltIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: '/team1.jpg',
    bio: 'Former professional athlete turned entrepreneur, passionate about making fitness accessible to everyone.'
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    image: '/team2.jpg',
    bio: 'Tech industry veteran with a mission to revolutionize how people discover and book fitness services.'
  },
  {
    name: 'Emma Davis',
    role: 'Head of Operations',
    image: '/team3.jpg',
    bio: 'Operations expert ensuring smooth experiences for both gyms and users on our platform.'
  }
]

const values = [
  {
    icon: <GlobeAltIcon className="h-8 w-8" />,
    title: 'Global Access',
    description: 'Connect with top fitness facilities and trainers worldwide.'
  },
  {
    icon: <UserGroupIcon className="h-8 w-8" />,
    title: 'Community',
    description: 'Build a supportive network of fitness enthusiasts and professionals.'
  },
  {
    icon: <ShieldCheckIcon className="h-8 w-8" />,
    title: 'Trust & Safety',
    description: 'Verified profiles and secure booking system for peace of mind.'
  },
  {
    icon: <HeartIcon className="h-8 w-8" />,
    title: 'Passion for Fitness',
    description: 'Dedicated to helping everyone achieve their fitness goals.'
  }
]

export default function About() {
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
      {/* Updated Hero Section using PageHero */}
      <PageHero 
        title="Our Mission"
        subtitle="Connecting people with the best gyms and trainers worldwide, making fitness accessible and enjoyable for everyone."
      />

      {/* Values Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Our Values</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            At Alni, we're driven by a set of core values that guide everything we do.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerFadeIn(index * 0.1)}
              className="card text-center"
            >
              <div className="inline-flex p-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-gray-50 dark:bg-dark-200 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                Founded in 2024, Alni was born from a simple observation: finding and
                booking quality fitness facilities and trainers should be easier.
              </p>
              <p>
                What started as a local project quickly grew into a global platform,
                connecting fitness enthusiasts with top-rated gyms and expert trainers
                worldwide.
              </p>
              <p>
                Today, we're proud to serve thousands of users, helping them achieve
                their fitness goals through our network of verified partners.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The passionate individuals behind Alni, working together to
            revolutionize the fitness industry.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerFadeIn(index * 0.1)}
              className="card text-center"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
              />
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-primary-600 font-medium mb-4">{member.role}</p>
              <p className="text-gray-600 dark:text-gray-400">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
          className="card bg-primary-600 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Whether you're a gym owner, trainer, or fitness enthusiast,
            there's a place for you in the Alni community.
          </p>
          <button className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
            Get Started
          </button>
        </motion.div>
      </section>
    </div>
  )
} 