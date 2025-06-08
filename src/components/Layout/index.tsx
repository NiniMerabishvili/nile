import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, profile, signOut, loading, isAdmin, isGymOwner } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/gyms', label: 'Gyms' },
    { path: '/trainers', label: 'Trainers' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ]

  // Add admin link if user is admin
  const adminLinks = isAdmin ? [
    { path: '/admin', label: 'Admin Dashboard' }
  ] : []

  const allNavLinks = [...navLinks, ...adminLinks]

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-dark-100 shadow-sm">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            to="/" 
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Alni
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {allNavLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${
                  location.pathname === link.path ? 'nav-link-active' : ''
                } ${link.path === '/admin' ? 'text-red-600 dark:text-red-400 font-semibold' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Add Gym - Only for gym owners */}
            {isGymOwner && (
              <Link
                to="/add-gym"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
              >
                <BuildingOfficeIcon className="h-5 w-5 inline mr-1" />
                Add Gym
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-200 
                       transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            
            {/* Desktop Auth Links */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <UserCircleIcon className="h-5 w-5" />
                    <span>{profile?.full_name || profile?.username || user.email}</span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="btn-secondary px-4 py-2 text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    to="/signin"
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-200 md:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-dark-200
                       bg-white dark:bg-dark-100"
            >
              <div className="container mx-auto px-4 py-4 space-y-4">
                {allNavLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block nav-link ${
                      location.pathname === link.path ? 'nav-link-active' : ''
                    } ${link.path === '/admin' ? 'text-red-600 dark:text-red-400 font-semibold' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile Auth Links */}
                {user ? (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-dark-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                      <UserCircleIcon className="h-5 w-5" />
                      <span>{profile?.full_name || profile?.username || user.email}</span>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="btn-secondary w-full text-center"
                      disabled={loading}
                    >
                      {loading ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                ) : (
                  <>
                    <Link 
                      to="/signin"
                      className="btn-secondary w-full text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup"
                      className="btn-primary w-full text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-grow container mx-auto px-4 py-8"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-100 border-t border-gray-200 dark:border-dark-200">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <Link to="/" className="text-2xl font-bold gradient-text">
                Alni
              </Link>
              <p className="text-gray-600 dark:text-gray-400">
                Discover and book the best gyms and trainers worldwide.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <div className="space-y-2">
                {allNavLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block nav-link"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <div className="space-y-2">
                <Link to="/faq" className="block nav-link">FAQ</Link>
                <Link to="/privacy" className="block nav-link">Privacy Policy</Link>
                <Link to="/terms" className="block nav-link">Terms of Service</Link>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Newsletter</h3>
              <form className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input-field"
                />
                <button type="submit" className="btn-primary w-full">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-200">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>&copy; {new Date().getFullYear()} Alni. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 