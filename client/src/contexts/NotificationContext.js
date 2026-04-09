import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadRequests, setUnreadRequests] = useState(0);
  const [rateLimitedUntil, setRateLimitedUntil] = useState(0);

  const safeJson = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCounts = async () => {
      if (Date.now() < rateLimitedUntil) {
        return;
      }

      try {
        // Fetch unread messages count
        const messagesResponse = await fetch('/api/connections/unread-count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (messagesResponse.status === 429) {
          setRateLimitedUntil(Date.now() + 60 * 1000);
          return;
        }

        const messagesData = await safeJson(messagesResponse);
        if (!messagesResponse.ok || !messagesData) {
          return;
        }

        setUnreadMessages(messagesData.unreadCount || 0);

        // Fetch pending requests count
        const requestsResponse = await fetch('/api/connections/requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (requestsResponse.status === 429) {
          setRateLimitedUntil(Date.now() + 60 * 1000);
          return;
        }

        const requestsData = await safeJson(requestsResponse);
        if (!requestsResponse.ok || !requestsData) {
          return;
        }

        setUnreadRequests(requestsData.requests?.length || 0);
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user, rateLimitedUntil]);

  const value = {
    unreadMessages,
    unreadRequests,
    setUnreadMessages,
    setUnreadRequests
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};