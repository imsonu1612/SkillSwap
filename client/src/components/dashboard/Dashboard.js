import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import {
  Users2,
  MessageCircle,
  Bell,
  ArrowRight,
  Search,
  User,
  MapPin,
  Sparkles,
  Plus,
  GraduationCap,
  LayoutGrid,
  Activity,
  Send,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConnectButton from '../connections/ConnectButton';

const DASHBOARD_CACHE_KEY = 'dashboard_cache_v1';
const DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000;

const getCachedDashboardData = () => {
  try {
    const cachedRaw = localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!cachedRaw) {
      return null;
    }

    const cached = JSON.parse(cachedRaw);
    if (!cached?.data || !cached?.cachedAt || !cached?.userId) {
      return null;
    }

    return cached;
  } catch (error) {
    return null;
  }
};

const setCachedDashboardData = (userId, data) => {
  localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({
    userId,
    data,
    cachedAt: Date.now()
  }));
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [activity, setActivity] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadRequests, setUnreadRequests] = useState(0);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const cached = getCachedDashboardData();
    const isCacheForCurrentUser = cached?.userId === user._id;
    const hasCachedData = Boolean(isCacheForCurrentUser && cached?.data);

    if (hasCachedData) {
      setConnections(cached.data.connections || []);
      setActivity(cached.data.activity || []);
      setUnreadMessages(cached.data.unreadMessages || 0);
      setUnreadRequests(cached.data.unreadRequests || 0);
      setRecommendedUsers(cached.data.recommendedUsers || []);
      setLoading(false);

      const isCacheFresh = Date.now() - cached.cachedAt < DASHBOARD_CACHE_TTL_MS;
      if (isCacheFresh) {
        return;
      }
    }

    const fetchDashboardData = async (retryCount = 0) => {
      try {
        setError(null);
        if (!hasCachedData) {
          setLoading(true);
        }

        const [connectionsRes, activityRes, unreadMsgRes, requestsRes, recommendationsRes] = await Promise.all([
          axios.get('/api/connections'),
          axios.get('/api/connections/activity'),
          axios.get('/api/connections/unread-count'),
          axios.get('/api/connections/requests'),
          axios.get('/api/users/search?limit=6')
        ]);

        const nextData = {
          connections: connectionsRes.data.connections || [],
          activity: activityRes.data.activity || [],
          unreadMessages: unreadMsgRes.data.unreadCount || 0,
          unreadRequests: requestsRes.data.requests?.length || 0,
          recommendedUsers: recommendationsRes.data.users || []
        };

        setConnections(nextData.connections);
        setActivity(nextData.activity);
        setUnreadMessages(nextData.unreadMessages);
        setUnreadRequests(nextData.unreadRequests);
        setRecommendedUsers(nextData.recommendedUsers);
        setCachedDashboardData(user._id, nextData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);

        if (err.response?.status === 401 && retryCount < 1) {
          setTimeout(() => {
            fetchDashboardData(retryCount + 1);
          }, 500);
          return;
        }

        if (hasCachedData && err.response?.status === 401) {
          setLoading(false);
          return;
        }

        if (err.response?.status === 401) {
          setError('Session not ready. Please refresh once or log in again.');
        } else {
          setError('Failed to load dashboard data');
        }
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, user]);

  const greetingName = user?.firstName || user?.username || 'there';
  const totalSkills = user?.skills?.length || 0;
  const totalConnections = connections.length;

  const quickActions = useMemo(() => ([
    { label: 'Find People', to: '/search', icon: Search, description: 'Discover new skill matches' },
    { label: 'Add Skill', to: '/profile', icon: Plus, description: 'Expand your profile' },
    { label: 'View Profile', to: '/profile', icon: User, description: 'Review your details' },
    { label: 'Open Chat', to: '/connections', icon: MessageCircle, description: 'Continue conversations' }
  ]), []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/40 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-all duration-300">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-4 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/40 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 text-red-600 transition-all duration-300">
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-900 px-6 py-5 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-all duration-300">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-primary-700 to-primary-600 text-white shadow-2xl">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/3 translate-x-1/4 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 translate-y-1/3 -translate-x-1/4 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-primary-100 backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  Dashboard overview
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Welcome back, {greetingName} 👋
                </h1>
                <p className="mt-3 max-w-2xl text-primary-100 sm:text-lg">
                  Keep learning, connect with peers, and track your time-credit journey in one place.
                </p>
                <p className="mt-4 text-sm text-primary-100/90">
                  {currentTime.toLocaleString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">{totalConnections}</p>
                  <p className="text-xs text-primary-100">Connections</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">{unreadRequests}</p>
                  <p className="text-xs text-primary-100">Pending requests</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Connections', value: totalConnections, icon: Users2, color: 'from-blue-500 to-cyan-500', hint: 'Network strength' },
            { label: 'Pending Requests', value: unreadRequests, icon: BellRing, color: 'from-amber-500 to-orange-500', hint: 'People waiting' },
            { label: 'Messages', value: unreadMessages, icon: MessageCircle, color: 'from-emerald-500 to-teal-500', hint: 'Unread chats' },
            { label: 'Skills Count', value: totalSkills, icon: GraduationCap, color: 'from-fuchsia-500 to-pink-500', hint: 'Your growth' }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="group rounded-2xl border border-white/70 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-gray-200/40 transition-transform duration-300 group-hover:scale-105`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{stat.hint}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/70 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                    <Bell className="h-5 w-5 text-primary-600" />
                    Notifications Panel
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Jump into your messages or requests.</p>
                </div>
                <Link to="/notifications" className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700">
                  View all
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/connections"
                  className="group flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-100 p-3 text-blue-600 transition-transform duration-300 group-hover:scale-105">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Unread Messages</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Continue your chats</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">{unreadMessages}</span>
                </Link>

                <Link
                  to="/notifications"
                  className="group flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 transition-transform duration-300 group-hover:scale-105">
                      <Users2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Connection Requests</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Review new peers</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">{unreadRequests}</span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                    <Activity className="h-5 w-5 text-primary-600" />
                    Recent Activity Timeline
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Your latest network updates over the last 30 days.</p>
                </div>
              </div>

              {activity.length > 0 ? (
                <div className="relative space-y-5 pl-6">
                  <div className="absolute bottom-1 left-2 top-1 w-px bg-gradient-to-b from-primary-500 via-cyan-400 to-transparent" />
                  {activity.map((item, index) => (
                    <div key={`${item.type}-${index}`} className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md">
                      <div className={`absolute -left-[18px] top-5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-900 ${item.type === 'connection_request' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {item.user.firstName} {item.user.lastName}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {item.type === 'connection_request' ? 'sent you a connection request' : 'accepted your connection request'}
                          </p>
                        </div>
                        <p className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-8 text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">No activity yet</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Start connecting to see your timeline fill up.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/70 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                    <LayoutGrid className="h-5 w-5 text-primary-600" />
                    Recommended Users
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Suggested people to connect with.</p>
                </div>
                <Link to="/search" className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700">
                  More
                </Link>
              </div>

              {recommendedUsers.length > 0 ? (
                <div className="space-y-4">
                  {recommendedUsers.slice(0, 6).map((recommendedUser) => (
                    <div key={recommendedUser._id} className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-gray-700">
                          <User className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                                {recommendedUser.firstName} {recommendedUser.lastName}
                              </p>
                              <p className="truncate text-sm text-gray-500 dark:text-gray-400">@{recommendedUser.username}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate(`/user/${recommendedUser._id}`)}
                              className="rounded-full bg-primary-50 dark:bg-gray-700 px-3 py-1.5 text-xs font-semibold text-primary-700 dark:text-primary-300 transition-all duration-300 hover:bg-primary-100 dark:hover:bg-gray-600 hover:shadow-sm"
                            >
                              View
                            </button>
                          </div>

                          {recommendedUser.location && (
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-gray-700 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-300 shadow-sm">
                              <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                              <span>{recommendedUser.location}</span>
                            </div>
                          )}

                          {recommendedUser.skills?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {recommendedUser.skills.slice(0, 3).map((skill) => (
                                <span key={skill._id || skill.name} className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:text-gray-200">
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-4">
                            <ConnectButton
                              targetUserId={recommendedUser._id}
                              targetUserName={`${recommendedUser.firstName} ${recommendedUser.lastName}`}
                              onConnect={() => {}}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-6 text-center">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">No recommendations available</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Try adding more skills to your profile.</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/70 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                    <Send className="h-5 w-5 text-primary-600" />
                    Quick Actions
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Fast shortcuts to common tasks.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      to={action.to}
                      className="group flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary-100 dark:bg-gray-700 p-3 text-primary-600 transition-transform duration-300 group-hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{action.label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Start connecting!
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Explore people, review requests, and keep the conversation moving.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to="/search" className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  Find People
                </Link>
                <Link to="/profile" className="rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
