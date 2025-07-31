import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle2, Users2, Clock, MessageCircle, Bell } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [connections, setConnections] = useState([]);
  const [activity, setActivity] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadRequests, setUnreadRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          connectionsRes, 
          activityRes, 
          unreadMsgRes,
          requestsRes
        ] = await Promise.all([
          axios.get('/api/connections'),
          axios.get('/api/connections/activity'),
          axios.get('/api/connections/unread-count'),
          axios.get('/api/connections/requests')
        ]);

        setConnections(connectionsRes.data.connections);
        setActivity(activityRes.data.activity);
        setUnreadMessages(unreadMsgRes.data.unreadCount);
        setUnreadRequests(requestsRes.data.requests.length);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Connections Card */}
        <Link 
          to="/connections"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center mb-4">
            <Users2 className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">My Connections</h2>
          </div>
          <p className="text-3xl font-bold text-gray-700 mb-4">{connections.length}</p>
          <p className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center">
            View all connections
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </Link>

        {/* Messages & Notifications Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <Link 
              to="/chat"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-blue-500 mr-2" />
                <span>Unread Messages</span>
              </div>
              {unreadMessages > 0 && (
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link 
              to="/connections"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <Users2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Connection Requests</span>
              </div>
              {unreadRequests > 0 && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  {unreadRequests}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-purple-500 mr-2" />
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          {activity.length > 0 ? (
            <ul className="space-y-4">
              {activity.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {item.type === 'connection_request' ? (
                      <div className="w-2 h-2 mt-2 bg-yellow-400 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 mt-2 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{item.user.firstName} {item.user.lastName}</span>
                      {item.type === 'connection_request' ? ' sent you a connection request' : ' accepted your connection request'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;