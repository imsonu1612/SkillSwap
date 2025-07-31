import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OTPVerification from './components/auth/OTPVerification';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import SearchUsers from './components/search/SearchUsers';
import Notifications from './components/connections/Notifications';
import ConnectionsList from './components/connections/ConnectionsList';
import ChatRoom from './components/chat/ChatRoom';
import Navbar from './components/layout/Navbar';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/verify-otp" element={
                <PublicRoute>
                  <OTPVerification />
                </PublicRoute>
              } />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Profile />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/search" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <SearchUsers />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Notifications />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/connections" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <ConnectionsList />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/chat/:userId" element={
                <ProtectedRoute>
                  <ChatRoom />
                </ProtectedRoute>
              } />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;