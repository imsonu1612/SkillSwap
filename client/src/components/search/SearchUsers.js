import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, MapPin, User, X, Users, Sparkles, ChevronDown } from 'lucide-react';
import ConnectButton from '../connections/ConnectButton';

const SUGGESTION_LIMIT = 6;

const SearchUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [bestMatches, setBestMatches] = useState([]);
  const [otherMatches, setOtherMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeQuery, setActiveQuery] = useState({ skill: '', location: '' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
    limit: SUGGESTION_LIMIT
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { skill: '', location: '' }
  });

  const fetchPeople = async ({ skill = '', location = '', page = 1, append = false } = {}) => {
    if (page > 1) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(SUGGESTION_LIMIT)
      });

      if (skill) params.append('skill', skill);
      if (location) params.append('location', location);

      const response = await axios.get(`/api/users/search?${params}`);
      const nextUsers = response.data.users || [];
      const nextBestMatches = response.data.bestMatches || [];
      const nextOtherMatches = response.data.otherMatches || [];

      setUsers((current) => (append ? [...current, ...nextUsers] : nextUsers));
      setBestMatches((current) => (append ? [...current, ...nextBestMatches] : nextBestMatches));
      setOtherMatches((current) => (append ? [...current, ...nextOtherMatches] : nextOtherMatches));
      setPagination(response.data.pagination);
      setActiveQuery({ skill, location });
    } catch (error) {
      toast.error('Failed to load people');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPeople({ page: 1 });
  }, []);

  const handleSearch = (data) => {
    fetchPeople({
      skill: data.skill?.trim() || '',
      location: data.location?.trim() || '',
      page: 1,
      append: false
    });
  };

  const handleLoadMore = () => {
    fetchPeople({
      skill: activeQuery.skill,
      location: activeQuery.location,
      page: pagination.currentPage + 1,
      append: true
    });
  };

  const clearFilters = () => {
    reset();
    fetchPeople({ page: 1, append: false });
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const isPrioritizedSearch = Boolean(activeQuery.skill) && Boolean(activeQuery.location);

  const renderUserCard = (user, { showSuggestedTag = false } = {}) => (
    <div
      key={user._id}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/user/${user._id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/user/${user._id}`);
        }
      }}
      className="card w-full text-left hover:shadow-lg transition-all duration-300 border-gray-200/80 dark:border-gray-700"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-14 w-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center shrink-0">
            <User className="h-7 w-7 text-primary-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                {user.firstName} {user.lastName}
              </h3>
              {showSuggestedTag && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-primary-300">
                  Suggested
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-300 truncate">@{user.username}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {user.location && (
          <div className="flex items-center text-gray-500 dark:text-gray-300">
            <MapPin className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-300" />
            <span className="text-sm">{user.location}</span>
          </div>
        )}

        {user.bio && <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{user.bio}</p>}

        {user.skills && user.skills.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {user.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}
                >
                  {skill.name}
                </span>
              ))}
              {user.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                  +{user.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">View profile or connect to start a conversation.</p>
        <div onClick={(event) => event.stopPropagation()}>
          <ConnectButton
            targetUserId={user._id}
            targetUserName={`${user.firstName} ${user.lastName}`}
            onConnect={() => toast.success('Connection request sent!')}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 h-24 w-24 bg-cyan-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary-100">
            <Sparkles className="h-4 w-4" />
            Suggested people
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find People</h1>
            <p className="text-primary-100 max-w-2xl">
              Start with a small set of relevant people. Load more only when you need to explore further.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-primary-100">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">Latest verified users</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">Skill matching</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">Load more on demand</span>
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <form onSubmit={handleSubmit(handleSearch)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Skill</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                </div>
                <input
                  {...register('skill')}
                  className="input-field pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Search by skill (e.g., JavaScript, Python)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                </div>
                <input
                  {...register('location')}
                  className="input-field pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Search by location"
                />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </button>
              <button type="button" onClick={clearFilters} className="btn-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {loading ? 'Finding people...' : users.length > 0 ? 'Suggested people' : 'No people found'}
            </h2>
            {activeQuery.skill || activeQuery.location ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Showing results for
                {activeQuery.skill && <span className="font-medium"> "{activeQuery.skill}"</span>}
                {activeQuery.skill && activeQuery.location && ' and '}
                {activeQuery.location && <span className="font-medium"> "{activeQuery.location}"</span>}
              </p>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Showing a compact set of suggestions instead of the full user directory.
              </p>
            )}
          </div>

          {pagination.totalUsers > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <span>{users.length} of {pagination.totalUsers}</span>
              <span className="hidden sm:inline">•</span>
              <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <>
            {isPrioritizedSearch ? (
              <div className="space-y-8">
                <section>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Best Matches (Skill + Location)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">People matching both your skill and location query.</p>
                  </div>
                  {bestMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      {bestMatches.map((user) => renderUserCard(user))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      No exact skill + location matches on this page yet.
                    </div>
                  )}
                </section>

                <section>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Other Matches (Skill Only)</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">People matching your skill, even if location differs.</p>
                  </div>
                  {otherMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      {otherMatches.map((user) => renderUserCard(user))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      No additional skill-only matches on this page.
                    </div>
                  )}
                </section>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {users.map((user) => renderUserCard(user, { showSuggestedTag: true }))}
              </div>
            )}

            {pagination.hasNext && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-secondary inline-flex items-center gap-2 px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 dark:border-gray-200" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 rounded-3xl bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400 dark:text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search criteria or refresh the suggested people list.
            </p>
            <button onClick={() => fetchPeople({ page: 1, append: false })} className="btn-primary">
              Refresh Suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;