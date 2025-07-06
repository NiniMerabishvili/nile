import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { supabase, updatePassword } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  useEffect(() => {
    // Handle the authentication session from URL fragments
    const handleAuthSession = async () => {
      try {
        // Check if we have error in the URL hash
        const hash = window.location.hash;
        if (hash.includes('error=')) {
          const errorMatch = hash.match(/error=([^&]+)/);
          const errorDescriptionMatch = hash.match(/error_description=([^&]+)/);
          
          const error = errorMatch ? decodeURIComponent(errorMatch[1]) : 'Unknown error';
          const errorDescription = errorDescriptionMatch 
            ? decodeURIComponent(errorDescriptionMatch[1].replace(/\+/g, ' ')) 
            : '';

          console.error('Reset password error:', { error, errorDescription });
          
          if (error === 'access_denied' || errorDescription.includes('expired')) {
            toast.error('The password reset link has expired. Please request a new one.');
          } else {
            toast.error(`Reset failed: ${errorDescription || error}`);
          }
          
          navigate('/forgot-password');
          return;
        }

        // Check if we have access_token and refresh_token in the URL hash
        const accessTokenMatch = hash.match(/access_token=([^&]+)/);
        const refreshTokenMatch = hash.match(/refresh_token=([^&]+)/);
        
        if (accessTokenMatch && refreshTokenMatch) {
          const accessToken = accessTokenMatch[1];
          const refreshToken = refreshTokenMatch[1];
          
          // Set the session using Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Session error:', error);
            toast.error('Invalid or expired reset link. Please request a new one.');
            navigate('/forgot-password');
            return;
          }

          if (data.session) {
            setIsValidSession(true);
            // Clear the URL hash for security
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            toast.error('Failed to create session. Please request a new reset link.');
            navigate('/forgot-password');
          }
        } else {
          // No tokens found, redirect to forgot password
          toast.error('Invalid reset link. Please request a new password reset.');
          navigate('/forgot-password');
        }
      } catch (error) {
        console.error('Error handling auth session:', error);
        toast.error('An error occurred. Please request a new password reset.');
        navigate('/forgot-password');
      }
    };

    handleAuthSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isValidSession) {
      toast.error('Invalid session. Please request a new password reset.');
      navigate('/forgot-password');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      toast.success('Password updated successfully!');
      
      // Sign out the user so they can sign in with the new password
      await supabase.auth.signOut();
      
      navigate('/signin');
    } catch (error: any) {
      console.error('Update password error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-dark-200 to-dark-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-white">Verifying reset link...</p>
        </div>
      </div>
    );
  }

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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 