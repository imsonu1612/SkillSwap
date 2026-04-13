import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Users, MapPin, Sparkles, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { ShaderCanvasBackground } from '../ui/animated-shader-hero';

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
    const { confirmPassword, ...registrationData } = data;
    const result = await registerUser(registrationData);
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
    <div className="min-h-screen w-full relative overflow-hidden bg-black flex items-center justify-center px-4 py-10">
      <ShaderCanvasBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/50 via-black/35 to-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.22),transparent_42%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.15),transparent_40%)]" />

      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white/85 transition-all duration-300 hover:bg-white/10 hover:text-white md:left-6 md:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <div className="relative z-10 w-full max-w-6xl grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/[0.015] p-8 text-white shadow-2xl backdrop-blur-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(216,180,254,0.18),transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-violet-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              SkillSwap
            </div>

            <div className="space-y-6">
              <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                A Time-Credit–Based Peer-to-Peer Online Learning Framework for Non-Monetary Education
              </h1>
              <p className="max-w-xl text-base leading-7 text-violet-100 sm:text-lg">
                Learn, Share, and Grow Skills Without Money
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <ShieldCheck className="h-4 w-4 text-violet-200" />
                    Verified community
                  </div>
                  <p className="mt-2 text-sm text-violet-100">Build trust with verified profiles and transparent skill sharing.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Users className="h-4 w-4 text-violet-200" />
                    Learn together
                  </div>
                  <p className="mt-2 text-sm text-violet-100">Create a profile and start exchanging time credits with peers.</p>
                </div>
              </div>
            </div>

            <p className="max-w-lg text-sm text-violet-100/90">
              Join the platform designed for collaborative, non-monetary learning.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md rounded-[2rem] border border-white/20 bg-black/15 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
            <div className="relative mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg shadow-black/30">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Create your account
              </h2>
              <p className="mt-3 text-sm text-white/65">
                Start your journey of learning and sharing skills.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-white/80">
                  First name
                </label>
                <div className="group relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition-colors duration-300 group-focus-within:text-white" />
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
                    className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pl-10 text-base text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-white/5 ${errors.firstName ? 'border-red-400/70 focus:ring-red-400/10' : ''}`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstName && <p className="mt-1.5 text-sm text-red-300">{errors.firstName.message}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-white/80">
                  Last name
                </label>
                <div className="group relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition-colors duration-300 group-focus-within:text-white" />
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
                    className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pl-10 text-base text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-white/5 ${errors.lastName ? 'border-red-400/70 focus:ring-red-400/10' : ''}`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.lastName && <p className="mt-1.5 text-sm text-red-300">{errors.lastName.message}</p>}
              </div>

              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-white/80">
                  Username
                </label>
                <div className="group relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition-colors duration-300 group-focus-within:text-white" />
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
                    className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pl-10 text-base text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-white/5 ${errors.username ? 'border-red-400/70 focus:ring-red-400/10' : ''}`}
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && <p className="mt-1.5 text-sm text-red-300">{errors.username.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                  Email address
                </label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition-colors duration-300 group-focus-within:text-white" />
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
                    className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pl-10 text-base text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-white/5 ${errors.email ? 'border-red-400/70 focus:ring-red-400/10' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-sm text-red-300">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="location" className="mb-2 block text-sm font-medium text-white/80">
                  Location (optional)
                </label>
                <div className="group relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition-colors duration-300 group-focus-within:text-white" />
                  <input
                    id="location"
                    type="text"
                    {...register('location')}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pl-10 text-base text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-white/5"
                    placeholder="Enter your location"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                  Password
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition-colors duration-300 group-focus-within:text-white" />
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
                    className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pl-10 pr-12 text-base text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-white/5 ${errors.password ? 'border-red-400/70 focus:ring-red-400/10' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-white/35 transition-all duration-300 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-sm text-red-300">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white/80">
                  Confirm password
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition-colors duration-300 group-focus-within:text-white" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pl-10 pr-12 text-base text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-white/5 ${errors.confirmPassword ? 'border-red-400/70 focus:ring-red-400/10' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-white/35 transition-all duration-300 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-300">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3.5 text-base font-semibold text-black shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-black/70" />
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

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/65">
              <span>Already have an account?</span>
              <Link to="/login" className="font-semibold text-violet-200 transition-colors duration-300 hover:text-white">
                Login
              </Link>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-white/50">
              By creating an account, you agree to our{' '}
              <button type="button" className="font-medium text-violet-200 transition-colors duration-300 hover:text-white">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="font-medium text-violet-200 transition-colors duration-300 hover:text-white">
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