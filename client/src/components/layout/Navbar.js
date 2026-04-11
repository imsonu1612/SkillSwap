import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Users, 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Bell,
  MessageCircle,
  Moon,
  Sun
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadMessages, unreadRequests } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const isActiveRoute = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const navClassName = (path) => `px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out flex items-center space-x-1 relative cursor-pointer hover:bg-primary-50/80 dark:hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-sm ${isActiveRoute(path) ? 'text-primary-700 bg-primary-50 dark:bg-gray-800 dark:text-primary-300 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300'}`;
  const navUnderlineClass = (path) => `pointer-events-none absolute left-2 right-2 -bottom-0.5 h-0.5 rounded-full bg-primary-600 transition-transform duration-300 ease-in-out origin-center ${isActiveRoute(path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`;
  const mobileNavClassName = (path) => `flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium relative transition-all duration-300 ease-in-out cursor-pointer ${isActiveRoute(path) ? 'text-primary-700 bg-primary-50 dark:bg-gray-800 dark:text-primary-300 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50/70 dark:hover:bg-gray-800'}`;

  useEffect(() => {
    const handlePointerDownOutside = (event) => {
      if (!isUserMenuOpen || !userMenuRef.current) {
        return;
      }

      if (!userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscapeClose = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('keydown', handleEscapeClose);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleEscapeClose);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/home" className="group flex items-center space-x-2 transition-all duration-300 ease-in-out hover:opacity-95">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out group-hover:text-primary-700 dark:group-hover:text-primary-300">SkillSwap</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/home"
              className={`group ${navClassName('/home')}`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
              <span aria-hidden="true" className={navUnderlineClass('/home')} />
            </Link>
            <Link
              to="/dashboard"
              className={`group ${navClassName('/dashboard')}`}
            >
              <Users className="h-4 w-4" />
              <span>Dashboard</span>
              <span aria-hidden="true" className={navUnderlineClass('/dashboard')} />
            </Link>
            <Link
              to="/search"
              className={`group ${navClassName('/search')}`}
            >
              <Search className="h-4 w-4" />
              <span>Find People</span>
              <span aria-hidden="true" className={navUnderlineClass('/search')} />
            </Link>
            <Link
              to="/connections"
              className={`group ${navClassName('/connections')}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Connections</span>
              <span aria-hidden="true" className={navUnderlineClass('/connections')} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link
              to="/notifications"
              className={`group ${navClassName('/notifications')}`}
            >
              <Bell className="h-4 w-4" />
              <span>Requests</span>
              <span aria-hidden="true" className={navUnderlineClass('/notifications')} />
              {unreadRequests > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadRequests}
                </span>
              )}
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 hover:shadow-sm flex items-center justify-center"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div ref={userMenuRef} className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 hover:shadow-sm"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="h-8 w-8 bg-primary-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <span>{user?.firstName || user?.username}</span>
              </button>

              {/* User Dropdown */}
              <div
                className={`absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-1.5 z-50 shadow-xl ring-1 ring-black/5 dark:ring-white/5 transition-all duration-200 origin-top-right ${isUserMenuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}
              >
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-800 hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-300 ease-in-out cursor-pointer"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 text-left transition-all duration-300 ease-in-out cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-800 p-2 rounded-md transition-all duration-300 ease-in-out cursor-pointer hover:scale-105"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50/70 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ease-in-out cursor-pointer"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <Link
              to="/home"
              className={mobileNavClassName('/home')}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/dashboard"
              className={mobileNavClassName('/dashboard')}
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/search"
              className={mobileNavClassName('/search')}
              onClick={() => setIsMenuOpen(false)}
            >
              <Search className="h-4 w-4" />
              <span>Find People</span>
            </Link>
            <Link
              to="/connections"
              className={mobileNavClassName('/connections')}
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Connections</span>
              {unreadMessages > 0 && (
                <span className="absolute top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link
              to="/notifications"
              className={mobileNavClassName('/notifications')}
              onClick={() => setIsMenuOpen(false)}
            >
              <Bell className="h-4 w-4" />
              <span>Requests</span>
              {unreadRequests > 0 && (
                <span className="absolute top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadRequests}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50/70 dark:hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ease-in-out cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center space-x-2 w-full text-left text-gray-700 dark:text-gray-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ease-in-out cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;