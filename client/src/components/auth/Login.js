import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Users, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (location.state?.message) {
      toast.error(location.state.message);
    }
  }, [location.state]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/', { replace: true });
    } else if (result.error === 'Email not verified') {
      // Redirect to OTP verification if email is not verified
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
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/35 via-violet-900/40 to-black" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110vh] h-[48vh] rounded-b-[50%] bg-violet-400/20 blur-[80px]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85vh] h-[85vh] rounded-t-full bg-violet-400/20 blur-[70px]" />

      <div className="relative z-10 w-full max-w-6xl grid gap-8 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur-xl">
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
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <ShieldCheck className="h-4 w-4 text-violet-200" />
                    Trusted learning network
                  </div>
                  <p className="mt-2 text-sm text-violet-100">Connect with verified peers and exchange knowledge with confidence.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Users className="h-4 w-4 text-violet-200" />
                    Community-driven growth
                  </div>
                  <p className="mt-2 text-sm text-violet-100">Build skills through sharing, mentoring, and practical collaboration.</p>
                </div>
              </div>
            </div>

            <p className="max-w-lg text-sm text-violet-100/90">
              The faster, cleaner way to join your learning network.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="absolute -inset-[1px] rounded-[2rem] opacity-0 transition-opacity duration-700 hover:opacity-70" style={{ boxShadow: '0 0 15px 5px rgba(255,255,255,0.05)' }} />
            <div className="relative mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg shadow-black/30">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Welcome back
              </h2>
              <p className="mt-3 text-sm text-white/65">
                Sign in to continue your learning journey.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
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
                    placeholder="Enter your password"
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

              <button
                type="submit"
                disabled={isLoading}
                className="group inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3.5 text-base font-semibold text-black shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-black/70" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/65">
              <span>New to SkillSwap?</span>
              <Link to="/register" className="font-semibold text-violet-200 transition-colors duration-300 hover:text-white">
                Sign Up
              </Link>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-white/50">
              By signing in, you agree to our{' '}
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

export default Login; 