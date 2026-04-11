import React, { useEffect, useMemo, useState } from 'react';
import { Users, User, Eye, MessageCircle, MapPin, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

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
      return 'bg-gray-100 text-gray-700';
  }
};

const ConnectionsList = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/connections', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections);
      } else {
        console.error('Failed to fetch connections');
      }
    } catch (error) {
      console.error('Fetch connections error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openProfile = (userId, fromConnections = true) => {
    navigate(`/user/${userId}`, { state: { fromConnections } });
  };

  const openChat = (user) => {
    navigate(`/chat/${user._id}`, {
      state: { userName: `${user.firstName} ${user.lastName}` }
    });
  };

  const filteredConnections = useMemo(() => {
    const trimmedName = nameFilter.trim().toLowerCase();
    const trimmedSkill = skillFilter.trim().toLowerCase();

    return connections.filter(({ user }) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
      const username = (user.username || '').toLowerCase();
      const nameMatches = !trimmedName
        || fullName.includes(trimmedName)
        || username.includes(trimmedName);

      const skills = Array.isArray(user.skills) ? user.skills : [];
      const skillMatches = !trimmedSkill
        || skills.some((skill) => (skill.name || '').toLowerCase().includes(trimmedSkill));

      return nameMatches && skillMatches;
    });
  }, [connections, nameFilter, skillFilter]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Connections</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded mb-3" />
              <div className="h-9 bg-gray-200 rounded mb-2" />
              <div className="h-9 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-700 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-28 w-28 bg-white/10 rounded-full blur-2xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 h-24 w-24 bg-cyan-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-primary-100 mb-3">
              <Sparkles className="h-4 w-4" />
              Your network
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
            <p className="text-primary-100 mt-1">Manage your professional circle and start conversations quickly.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3">
            <p className="text-2xl font-bold leading-none">{connections.length}</p>
            <p className="text-xs text-primary-100 mt-1">Total connections</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              placeholder="Search by name or username"
              className="input-field pl-9"
            />
          </div>
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={skillFilter}
              onChange={(event) => setSkillFilter(event.target.value)}
              placeholder="Filter by skill"
              className="input-field pl-9"
            />
          </div>
        </div>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-14 bg-white border border-dashed border-gray-300 rounded-2xl">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No connections yet. Start connecting with people!</h3>
          <p className="text-gray-600 mb-5">Build your network and discover people who match your interests and skills.</p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Find People
          </button>
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching connections</h3>
          <p className="text-gray-600">Try changing your name or skill filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredConnections.map((connection) => {
            const user = connection.user;
            const isOnline = user.lastActive
              ? (Date.now() - new Date(user.lastActive).getTime()) <= ONLINE_WINDOW_MS
              : false;

            return (
            <div
              key={connection.id}
              className="group bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-3.5">
                <div className="relative flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                  )}
                  <span
                    className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                    title={isOnline ? 'Online' : 'Offline'}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2.5 truncate">
                    @{user.username}
                  </p>

                  {user.location && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 mb-3 bg-gray-50 rounded-full px-2.5 py-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[140px]">{user.location}</span>
                    </div>
                  )}

                  {Array.isArray(user.skills) && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {user.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill._id || `${skill.name}-${skill.level}`}
                          className={`px-2 py-1 rounded-full text-[11px] font-medium ${getSkillLevelColor(skill.level)}`}
                        >
                          {skill.name}
                        </span>
                      ))}
                      {user.skills.length > 3 && (
                        <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                          +{user.skills.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mb-3">No skills added yet</p>
                  )}

                  <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                    <span>
                      Connected {new Date(connection.connectedAt).toLocaleDateString()}
                    </span>
                    <span className={isOnline ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openProfile(user._id);
                  }}
                  className="w-full btn-secondary flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Profile
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openChat(user);
                  }}
                  className="w-full btn-primary flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </button>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default ConnectionsList;