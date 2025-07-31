import React, { useState, useEffect } from 'react';
import { Bell, Check, X, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

const Notifications = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setUnreadRequests } = useNotifications();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/connections/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
        // Reset unread requests when viewing them
        setUnreadRequests(0);
      } else {
        console.error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await fetch(`/api/connections/accept/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Connection request accepted!');
        fetchRequests(); // Refresh the list
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Accept error:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(`/api/connections/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Connection request rejected');
        fetchRequests(); // Refresh the list
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject request');
    }
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
        <Bell className="h-6 w-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Connection Requests
        </h1>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pending requests
          </h3>
          <p className="text-gray-600">
            You don't have any pending connection requests at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {request.from.avatar ? (
                    <img
                      src={request.from.avatar}
                      alt={request.from.firstName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {request.from.firstName} {request.from.lastName}
                    </h3>
                    <span className="text-sm text-gray-500">
                      @{request.from.username}
                    </span>
                  </div>

                  {request.message && (
                    <p className="text-gray-600 mb-4 italic">
                      "{request.message}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      Requested {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="btn-primary flex items-center gap-2 px-4 py-2"
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="btn-secondary flex items-center gap-2 px-4 py-2"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;