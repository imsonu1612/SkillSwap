import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OTPVerification from './components/auth/OTPVerification';
import Home from './components/home/Home';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import UserProfileView from './components/profile/UserProfileView';
import SearchUsers from './components/search/SearchUsers';
import Notifications from './components/connections/Notifications';
import ConnectionsList from './components/connections/ConnectionsList';
import ChatRoom from './components/chat/ChatRoom';
import Navbar from './components/layout/Navbar';
import './index.css';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user
    ? children
    : <Navigate to="/login" replace state={{ from: location.pathname, message: 'Please login to continue' }} />;
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
  
  return user ? <Navigate to="/" replace /> : children;
};

const RouterShell = ({ isDark }) => {
  const location = useLocation();
  const hideNavbarOnAuthPages = ['/login', '/register', '/verify-otp'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 transition-all duration-300 dark:bg-gray-950 dark:text-gray-100">
      {!hideNavbarOnAuthPages && <Navbar />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#111827' : '#363636',
            color: '#fff',
            border: isDark ? '1px solid #374151' : 'none'
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

        {/* Private Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/find-people" element={
          <PrivateRoute>
            <SearchUsers />
          </PrivateRoute>
        } />
        <Route path="/search" element={
          <Navigate to="/find-people" replace />
        } />
        <Route path="/user/:userId" element={
          <PrivateRoute>
            <UserProfileView />
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } />
        <Route path="/connections" element={
          <PrivateRoute>
            <ConnectionsList />
          </PrivateRoute>
        } />
        <Route path="/chat/:userId" element={
          <PrivateRoute>
            <ChatRoom />
          </PrivateRoute>
        } />

        {/* Default redirect */}
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RouterShell isDark={isDark} />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;