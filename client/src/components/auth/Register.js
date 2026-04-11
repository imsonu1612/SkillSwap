import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Users, MapPin, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser(data);
    setIsLoading(false);
    
    if (result.success) {
      // Redirect to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          userId: result.userId, 
          email: result.email 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/40 to-cyan-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-primary-700 to-primary-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.22),transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-primary-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              SkillSwap
            </div>

            <div className="space-y-6">
              <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                A Time-Credit–Based Peer-to-Peer Online Learning Framework for Non-Monetary Education
              </h1>
              <p className="max-w-xl text-base leading-7 text-primary-100 sm:text-lg">
                Learn, Share, and Grow Skills Without Money
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <ShieldCheck className="h-4 w-4 text-cyan-200" />
                    Verified community
                  </div>
                  <p className="mt-2 text-sm text-primary-100">Build trust with verified profiles and transparent skill sharing.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Users className="h-4 w-4 text-cyan-200" />
                    Learn together
                  </div>
                  <p className="mt-2 text-sm text-primary-100">Create a profile and start exchanging time credits with peers.</p>
                </div>
              </div>
            </div>

            <p className="max-w-lg text-sm text-primary-100/90">
              Join the platform designed for collaborative, non-monetary learning.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Create your account
              </h2>
              <p className="mt-3 text-sm text-gray-500">
                Start your journey of learning and sharing skills.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
                  First name
                </label>
                <div className="group relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-primary-600" />
                  <input
                    id="firstName"
                    type="text"
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters'
                      }
                    })}
                    className={`input-field pl-10 transition-all duration-300 ease-in-out focus:border-primary-500 focus:ring-2 focus:ring-primary-200/60 ${errors.firstName ? 'border-red-500 focus:ring-red-200/60' : ''}`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstName && <p className="mt-1.5 text-sm text-red-600">{errors.firstName.message}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <div className="group relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-primary-600" />
                  <input
                    id="lastName"
                    type="text"
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters'
                      }
                    })}
                    className={`input-field pl-10 transition-all duration-300 ease-in-out focus:border-primary-500 focus:ring-2 focus:ring-primary-200/60 ${errors.lastName ? 'border-red-500 focus:ring-red-200/60' : ''}`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.lastName && <p className="mt-1.5 text-sm text-red-600">{errors.lastName.message}</p>}
              </div>

              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="group relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-primary-600" />
                  <input
                    id="username"
                    type="text"
                    {...register('username', {
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters'
                      },
                      maxLength: {
                        value: 30,
                        message: 'Username cannot exceed 30 characters'
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: 'Username can only contain letters, numbers, and underscores'
                      }
                    })}
                    className={`input-field pl-10 transition-all duration-300 ease-in-out focus:border-primary-500 focus:ring-2 focus:ring-primary-200/60 ${errors.username ? 'border-red-500 focus:ring-red-200/60' : ''}`}
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && <p className="mt-1.5 text-sm text-red-600">{errors.username.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-primary-600" />
                  <input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className={`input-field pl-10 transition-all duration-300 ease-in-out focus:border-primary-500 focus:ring-2 focus:ring-primary-200/60 ${errors.email ? 'border-red-500 focus:ring-red-200/60' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700">
                  Location (optional)
                </label>
                <div className="group relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-primary-600" />
                  <input
                    id="location"
                    type="text"
                    {...register('location')}
                    className="input-field pl-10 transition-all duration-300 ease-in-out focus:border-primary-500 focus:ring-2 focus:ring-primary-200/60"
                    placeholder="Enter your location"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-primary-600" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className={`input-field pl-10 pr-12 transition-all duration-300 ease-in-out focus:border-primary-500 focus:ring-2 focus:ring-primary-200/60 ${errors.password ? 'border-red-500 focus:ring-red-200/60' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-gray-400 transition-all duration-300 hover:text-primary-600 hover:scale-105"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-primary-600" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    className={`input-field pl-10 pr-12 transition-all duration-300 ease-in-out focus:border-primary-500 focus:ring-2 focus:ring-primary-200/60 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200/60' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-gray-400 transition-all duration-300 hover:text-primary-600 hover:scale-105"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>Already have an account?</span>
              <Link to="/login" className="font-semibold text-primary-600 transition-colors duration-300 hover:text-primary-700">
                Login
              </Link>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-gray-500">
              By creating an account, you agree to our{' '}
              <button type="button" className="font-medium text-primary-600 transition-colors duration-300 hover:text-primary-700">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="font-medium text-primary-600 transition-colors duration-300 hover:text-primary-700">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 