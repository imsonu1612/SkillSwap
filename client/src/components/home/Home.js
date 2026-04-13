import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Clock3,
  BookOpen,
  Users,
  Bell,
  GraduationCap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../ui/footer';

const featureCards = [
  {
    title: 'Skill Exchange',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    details: [
      'Skill Exchange lets users teach what they know and learn what they need.',
      'Members match through shared goals instead of money-based transactions.',
      'You can plan sessions with clear outcomes before starting.',
      'The system rewards both learners and mentors with fair value.',
      'Example: teach UI design while learning spoken English in return.',
    ],
  },
  {
    title: 'Find Skilled People',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
    details: [
      'Find Skilled People helps users search by skill, goal, and profile fit.',
      'It removes random browsing and shows relevant matches faster.',
      'Users can compare profiles and send focused requests quickly.',
      'This improves first interactions and saves discovery time.',
      'Example: find an interview mentor with real hiring experience.',
    ],
  },
  {
    title: 'Real-time Chat',
    icon: MessageCircle,
    image: 'https://images.unsplash.com/photo-1611746869696-d09bce200020?auto=format&fit=crop&w=1200&q=80',
    details: [
      'Real-time Chat keeps communication instant after users connect.',
      'Members can discuss goals, timing, and session plans in one place.',
      'Live messaging helps resolve doubts quickly during learning.',
      'This keeps collaboration organized and more accountable over time.',
      'Example: mentors send tasks and learners share progress updates.',
    ],
  },
  {
    title: 'Connections System',
    icon: Bell,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    details: [
      'Connections System manages requests with clear accept or decline flow.',
      'Users stay in control of who they collaborate with.',
      'Live notifications prevent missed requests and delayed responses.',
      'This creates safer and more intentional learning relationships.',
      'Example: review multiple requests and choose the best-fit partner.',
    ],
  },
  {
    title: 'Learning & Mentorship',
    icon: GraduationCap,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    details: [
      'Learning & Mentorship supports guided growth with practical sessions.',
      'Users can split big goals into clear weekly milestones.',
      'Regular feedback improves consistency and confidence.',
      'Mentorship adds accountability for long-term skill progress.',
      'Example: follow a web development roadmap with expert feedback.',
    ],
  },
  {
    title: 'Community Growth',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
    details: [
      'Community Growth builds a strong peer-learning network over time.',
      'Users gain exposure to more skills and perspectives through connections.',
      'Repeated contributions increase trust and platform engagement.',
      'Members benefit from ongoing collaboration beyond one session.',
      'Example: learners become mentors and grow the community cycle.',
    ],
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: 'easeOut',
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

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

        <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pt-8 pb-10">
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
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(45deg,#4f46e5,#06b6d4)] opacity-100" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1 -z-10 h-full rounded-full bg-[linear-gradient(45deg,#4f46e5,#06b6d4)] opacity-35 blur-[12px] transition-opacity duration-500 group-hover:opacity-50" />
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="relative z-10 h-4 w-4" />
              </button>

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

      <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 sm:p-5 lg:p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">How SkillSwap Works</h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">A simple 3-step flow designed to make learning social, fair, and accessible.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/60">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold">1</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Create your profile</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">List the skills you can teach and what you want to learn.</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/60">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold">2</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Send requests</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Connect with relevant users and propose your skill exchange plan.</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/60">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold">3</div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Learn together</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Collaborate in sessions, exchange time credits, and track growth.</p>
            </div>
          </div>
        </div>
      </section>

      <motion.section
        className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionVariants}
      >
        <div className="rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 p-4 sm:p-5 lg:p-6 dark:border-indigo-900/50 dark:from-slate-900 dark:via-indigo-950/60 dark:to-purple-950/40">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Explore SkillSwap Features</h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">Discover how SkillSwap helps you connect, learn, and grow together.</p>
          </div>

          <motion.div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" variants={sectionVariants}>
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.article
                  key={feature.title}
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className="group relative overflow-hidden rounded-xl border border-white/60 bg-white/80 shadow-lg shadow-indigo-200/45 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-300/50 dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-black/40"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
                    <div className="absolute left-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-md">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                    <div className="mt-3 space-y-2.5 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {feature.details.map((line, idx) => (
                        <p key={`${feature.title}-${idx}`}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <section className="w-full px-4 md:px-6 lg:px-8 pb-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-cyan-600 px-5 py-6 sm:px-6 sm:py-8 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to build your learning network?</h2>
              <p className="mt-2 text-white/90 leading-7">
                Join SkillSwap to discover people, exchange skills, and grow faster through practical collaboration.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Verified community</span>
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> Time-credit learning</span>
                <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Real connections</span>
              </div>
            </div>

            <div className="flex shrink-0 lg:justify-end">
              <button
                type="button"
                onClick={handleGetStarted}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              >
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(45deg,#a955ff,#ea51ff)] opacity-100" />
                <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1 -z-10 h-full rounded-full bg-[linear-gradient(45deg,#a955ff,#ea51ff)] opacity-35 blur-[12px] transition-opacity duration-500 group-hover:opacity-50" />
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="relative z-10 h-4 w-4" />
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
