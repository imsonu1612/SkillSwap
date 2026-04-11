import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Sparkles,
  User,
  Search,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 text-white shadow-xl">
        <div className="absolute top-0 right-0 h-44 w-44 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 h-40 w-40 bg-cyan-300/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="relative p-6 sm:p-8 lg:p-10 grid gap-8 lg:grid-cols-[1.4fr_0.9fr] items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-primary-100 mb-4">
              <Sparkles className="h-4 w-4" />
              Personalized home
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Welcome, {user?.firstName || user?.username || 'there'}
            </h1>
            <p className="mt-4 max-w-2xl text-primary-100 text-base sm:text-lg leading-7">
              This is your quick overview of SkillSwap. Review your profile, discover recommended people, and stay on top of connection requests.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/search" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 shadow-sm hover:bg-primary-50 transition-colors">
                <Search className="h-4 w-4" />
                Find People
              </Link>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white border border-white/15 hover:bg-white/15 transition-colors">
                <User className="h-4 w-4" />
                View Profile
              </Link>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white border border-white/15 hover:bg-white/15 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Skills
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-5 backdrop-blur">
              <div className="flex items-center gap-3 text-primary-100 mb-3">
                <User className="h-5 w-5" />
                <span className="font-medium">Profile summary</span>
              </div>
              <div className="space-y-3 text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-cyan-200/20 text-cyan-200 text-[10px] font-bold">•</span>
                  <span>{user?.firstName} {user?.lastName}</span>
                </div>
                {user?.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-200" />
                    <span>{user.location}</span>
                  </div>
                ) : (
                  <p className="text-white/70">Add your location to improve recommendations.</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-cyan-200/20 text-cyan-200 text-[10px] font-bold">•</span>
                  <span>{user?.skills?.length || 0} skills listed</span>
                </div>
                <p className="text-white/70 line-clamp-3">
                  {user?.bio || 'Add a short bio so people can understand what you do and what you want to learn.'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 p-5 backdrop-blur">
              <div className="flex items-center gap-3 text-primary-100 mb-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-white text-xs font-bold">⏱</span>
                <span className="font-medium">Quick stats</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">{user?.skills?.length || 0}</p>
                  <p className="text-xs text-white/75">Skills listed</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">{user?.bio ? 1 : 0}</p>
                  <p className="text-xs text-white/75">Profile ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;