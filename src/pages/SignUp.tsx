import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      await signUp(email, password, fullName);
      navigate('/signin'); // Navigate to signin after successful signup
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center btn-primary"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 