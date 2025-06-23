import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, EnvelopeIcon, LockClosedIcon, BuildingOfficeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGymOwner, setIsGymOwner] = useState(false);
  const [isCoach, setIsCoach] = useState(false);
  const [error, setError] = useState('');
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await signUp(email, password, fullName, isGymOwner, isCoach);
      
      // If user is registering as a coach, redirect to coach registration flow
      if (isCoach) {
        navigate('/coach/registration');
      } else {
        // For other user types, navigate to signin
        navigate('/signin');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign up.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-dark-200 to-dark-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-dark-200 shadow-2xl rounded-2xl"
      >
        <div>
          <h2 className="mt-6 text-center text-4xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/signin" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 rounded-md">
              <p>{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="full-name" className="sr-only">Full name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="full-name"
                  name="full-name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input-field pl-10 !rounded-b-none"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-10 !rounded-t-none !rounded-b-none"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-field pl-10 !rounded-t-none !rounded-b-none"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-field pl-10 !rounded-t-none"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Beautiful Gym Owner Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Account Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Regular User Option */}
              <motion.button
                type="button"
                onClick={() => {
                  setIsGymOwner(false);
                  setIsCoach(false);
                }}
                className={`
                  relative px-4 py-3 rounded-xl border-2 transition-all duration-300 ease-out
                  ${!isGymOwner && !isCoach 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                  }
                `}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: !isGymOwner && !isCoach ? 1 : 1.02 }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <UserIcon className={`h-6 w-6 ${!isGymOwner && !isCoach ? 'text-primary-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Regular User</span>
                </div>
                {!isGymOwner && !isCoach && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 h-5 w-5 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>

              {/* Gym Owner Option */}
              <motion.button
                type="button"
                onClick={() => {
                  setIsGymOwner(true);
                  setIsCoach(false);
                }}
                className={`
                  relative px-4 py-3 rounded-xl border-2 transition-all duration-300 ease-out
                  ${isGymOwner 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                  }
                `}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: isGymOwner ? 1 : 1.02 }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <BuildingOfficeIcon className={`h-6 w-6 ${isGymOwner ? 'text-primary-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Gym Owner</span>
                </div>
                {isGymOwner && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 h-5 w-5 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>

              {/* Coach Option */}
              <motion.button
                type="button"
                onClick={() => {
                  setIsGymOwner(false);
                  setIsCoach(true);
                }}
                className={`
                  relative px-4 py-3 rounded-xl border-2 transition-all duration-300 ease-out
                  ${isCoach 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                  }
                `}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: isCoach ? 1 : 1.02 }}
              >
                <div className="flex flex-col items-center space-y-2">
                  <AcademicCapIcon className={`h-6 w-6 ${isCoach ? 'text-primary-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Coach</span>
                </div>
                {isCoach && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 h-5 w-5 bg-primary-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            </div>
            
            {/* Helper Text */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {isGymOwner ? (
                <span className="text-primary-600 dark:text-primary-400">
                  You'll be able to list and manage your gym after account creation
                </span>
              ) : isCoach ? (
                <span className="text-primary-600 dark:text-primary-400">
                  You'll be able to manage your coaching services after account creation
                </span>
              ) : (
                <span>
                  You can explore and book gyms and trainers
                </span>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center btn-primary"
            >
              {loading ? 'Creating account...' : (isGymOwner ? 'Create Gym Owner Account' : isCoach ? 'Create Coach Account' : 'Create Account')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 