import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();
const AUTH_USER_CACHE_KEY = 'auth_user_cache';
const AUTH_USER_CACHE_TTL_MS = 5 * 60 * 1000;

const getCachedAuthUser = () => {
  try {
    const cachedRaw = localStorage.getItem(AUTH_USER_CACHE_KEY);
    if (!cachedRaw) {
      return null;
    }

    const cached = JSON.parse(cachedRaw);
    if (!cached?.user || !cached?.cachedAt) {
      return null;
    }

    return cached;
  } catch (error) {
    return null;
  }
};

const setCachedAuthUser = (user) => {
  localStorage.setItem(AUTH_USER_CACHE_KEY, JSON.stringify({
    user,
    cachedAt: Date.now()
  }));
};

const clearCachedAuthUser = () => {
  localStorage.removeItem(AUTH_USER_CACHE_KEY);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = getCachedAuthUser();
    return cached?.user || null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Always attach the latest token to outgoing requests.
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        clearCachedAuthUser();
        setUser(null);
        setLoading(false);
        return;
      }

      const cached = getCachedAuthUser();
      if (cached?.user) {
        setUser(cached.user);
        const isFresh = Date.now() - cached.cachedAt < AUTH_USER_CACHE_TTL_MS;
        if (isFresh) {
          setLoading(false);
          return;
        }
      }

      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
        setCachedAuthUser(response.data.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        clearCachedAuthUser();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setCachedAuthUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      const errorType = error.response?.data?.error;
      
      if (errorType === 'Email not verified') {
        const { userId, email: userEmail } = error.response.data;
        return { 
          success: false, 
          error: errorType, 
          userId, 
          email: userEmail 
        };
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { userId, email } = response.data;
      
      toast.success('OTP sent to your email!');
      return { success: true, userId, email };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOTP = async (userId, otp) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { userId, otp });
      const { token: newToken, user: userInfo } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userInfo);
      setCachedAuthUser(userInfo);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const resendOTP = async (userId) => {
    try {
      await axios.post('/api/auth/resend-otp', { userId });
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      clearCachedAuthUser();
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    setCachedAuthUser(updatedUser);
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 