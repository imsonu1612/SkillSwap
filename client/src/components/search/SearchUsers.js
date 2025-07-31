import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  MapPin, 
  User, 
  Star,
  Filter,
  X,
  Users
} from 'lucide-react';
import ConnectButton from '../connections/ConnectButton';

const SearchUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });

  const {
    register,
    handleSubmit,
    watch,
    reset
  } = useForm({
    defaultValues: {
      skill: '',
      location: ''
    }
  });

  const watchedSkill = watch('skill');
  const watchedLocation = watch('location');

  const searchUsers = async (data, page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      if (data.skill) params.append('skill', data.skill);
      if (data.location) params.append('location', data.location);

      const response = await axios.get(`/api/users/search?${params}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to search users');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (data) => {
    searchUsers(data, 1);
  };

  const handlePageChange = (page) => {
    const formData = { skill: watchedSkill, location: watchedLocation };
    searchUsers(formData, page);
  };

  const clearFilters = () => {
    reset();
    searchUsers({}, 1);
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    // Load initial users
    searchUsers({}, 1);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find People</h1>
        <p className="text-gray-600">
          Discover and connect with people who share your interests and skills
        </p>
      </div>

      {/* Search Form */}
      <div className="card mb-8">
        <form onSubmit={handleSubmit(handleSearch)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('skill')}
                  className="input-field pl-10"
                  placeholder="Search by skill (e.g., JavaScript, Python)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('location')}
                  className="input-field pl-10"
                  placeholder="Search by location"
                />
              </div>
            </div>

            <div className="flex items-end space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {loading ? 'Searching...' : `Found ${pagination.totalUsers} people`}
            </h2>
            {(watchedSkill || watchedLocation) && (
              <p className="text-sm text-gray-600 mt-1">
                Showing results for
                {watchedSkill && <span className="font-medium"> "{watchedSkill}"</span>}
                {watchedSkill && watchedLocation && ' and '}
                {watchedLocation && <span className="font-medium"> "{watchedLocation}"</span>}
              </p>
            )}
          </div>

          {pagination.totalUsers > 0 && (
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          )}
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div key={user._id} className="card hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>

                  {user.location && (
                    <div className="flex items-center text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}

                  {user.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {user.skills && user.skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {user.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}
                          >
                            {skill.name}
                          </span>
                        ))}
                        {user.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{user.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <ConnectButton
                      targetUserId={user._id}
                      targetUserName={`${user.firstName} ${user.lastName}`}
                      onConnect={() => {
                        // Optionally refresh the user list or show a success message
                        toast.success('Connection request sent!');
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          page === pagination.currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all users.
            </p>
            <button
              onClick={() => searchUsers({}, 1)}
              className="btn-primary"
            >
              Browse All Users
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUsers; 