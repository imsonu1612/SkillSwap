import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, User, Briefcase, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConnectButton from '../connections/ConnectButton';

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

const UserProfileView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    isPending: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/users/${userId}`);
        setProfile(response.data.user);

        if (currentUser?._id && currentUser._id !== userId) {
          const statusResponse = await axios.get(`/api/connections/status/${userId}`);
          setConnectionState({
            isConnected: Boolean(statusResponse.data?.isConnected),
            isPending: Boolean(statusResponse.data?.isPending)
          });
        } else {
          setConnectionState({ isConnected: false, isPending: false });
        }
      } catch (error) {
        toast.error('Unable to load profile');
        console.error('Profile fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, currentUser?._id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 bg-gray-200 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="h-4 bg-gray-200 rounded w-3/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600 mb-4">This user profile is unavailable or no longer exists.</p>
          <button onClick={() => navigate('/search')} className="btn-primary">
            Back to Find People
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profile._id;
  const backTarget = location.state?.fromConnections ? '/connections' : '/search';
  const canMessage = !isOwnProfile && connectionState.isConnected;

  const openChat = () => {
    navigate(`/chat/${profile._id}`, {
      state: { userName: `${profile.firstName} ${profile.lastName}` }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        type="button"
        onClick={() => navigate(backTarget)}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <User className="h-10 w-10 text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600">@{profile.username}</p>
              {profile.location && (
                <div className="mt-2 inline-flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex flex-col gap-2 sm:items-end">
              {canMessage ? (
                <button
                  type="button"
                  onClick={openChat}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </button>
              ) : (
                <ConnectButton
                  targetUserId={profile._id}
                  targetUserName={`${profile.firstName} ${profile.lastName}`}
                  onConnect={() => {
                    setConnectionState((current) => ({ ...current, isPending: true }));
                    toast.success('Connection request sent!');
                  }}
                />
              )}
            </div>
          )}
        </div>

        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-sm uppercase tracking-wide font-semibold text-gray-500 mb-2">About</h2>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Skills & Proficiency</h2>
        </div>

        {profile.skills && profile.skills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.skills.map((skill) => (
              <div key={skill._id || `${skill.name}-${skill.level}`} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">{skill.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                    {skill.level}
                  </span>
                </div>
                {skill.description && <p className="text-sm text-gray-600">{skill.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No skills listed yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;
