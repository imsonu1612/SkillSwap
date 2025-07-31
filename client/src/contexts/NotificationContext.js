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

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCounts = async () => {
      try {
        // Fetch unread messages count
        const messagesResponse = await fetch('/api/connections/unread-count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const messagesData = await messagesResponse.json();
        setUnreadMessages(messagesData.unreadCount || 0);

        // Fetch pending requests count
        const requestsResponse = await fetch('/api/connections/requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const requestsData = await requestsResponse.json();
        setUnreadRequests(requestsData.requests?.length || 0);
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

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