import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConnectionsList = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const handleChat = (userId, userName) => {
    navigate(`/chat/${userId}`, { state: { userName } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          My Connections
        </h1>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No connections yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start connecting with other users to build your network.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary"
          >
            Find People to Connect With
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {connection.user.avatar ? (
                    <img
                      src={connection.user.avatar}
                      alt={connection.user.firstName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {connection.user.firstName} {connection.user.lastName}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2">
                    @{connection.user.username}
                  </p>

                  {connection.user.location && (
                    <p className="text-sm text-gray-600 mb-3">
                      📍 {connection.user.location}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      Connected {new Date(connection.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleChat(connection.user._id, `${connection.user.firstName} ${connection.user.lastName}`)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionsList;