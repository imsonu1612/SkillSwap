import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Users,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Clock3,
  BookOpen,
  Link2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../ui/demo';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
      return;
    }

    navigate('/register');
  };

  return (
    <div className="bg-gradient-to-b from-white via-primary-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary-400/25 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-white/90 px-4 py-1.5 text-sm font-medium text-primary-700 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-primary-300">
              <Sparkles className="h-4 w-4" />
              Non-monetary skill exchange platform
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Learn by Teaching.
              <span className="block text-primary-600 dark:text-primary-400">Teach by Learning.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-8 text-gray-600 dark:text-gray-300">
              SkillSwap connects people who want to share skills without money. Offer what you know,
              request what you want to learn, and grow through time-credit based collaboration.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all duration-300 hover:bg-primary-700 hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>

              {!user && (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Login
                </Link>
              )}

              {user && (
                <Link
                  to="/find-people"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Find People
                  <Search className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skill Sharing</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Share practical skills you already have and earn time credits from the community.</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meaningful Connections</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Discover learners and mentors nearby, then build long-term learning relationships.</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Link2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mutual Growth</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Exchange knowledge fairly and grow through collaborative, peer-to-peer learning.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 lg:p-10 dark:border-gray-800 dark:bg-gray-900">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">How SkillSwap Works</h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">A simple 3-step flow designed to make learning social, fair, and accessible.</p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/60">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold">1</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Create your profile</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">List the skills you can teach and what you want to learn.</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/60">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold">2</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Send requests</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Connect with relevant users and propose your skill exchange plan.</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/60">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold">3</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Learn together</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Collaborate in sessions, exchange time credits, and track growth.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-cyan-600 p-8 sm:p-10 text-white shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to build your learning network?</h2>
              <p className="mt-3 text-white/90 leading-7">
                Join SkillSwap to discover people, exchange skills, and grow faster through practical collaboration.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/90">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verified community</span>
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> Time-credit learning</span>
                <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Real connections</span>
              </div>
            </div>

            <div className="flex lg:justify-end">
              <button
                type="button"
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-50"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
