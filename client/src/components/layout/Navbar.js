import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
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

  const navGradients = {
    '/': { from: '#a955ff', to: '#ea51ff' },
    '/dashboard': { from: '#56CCF2', to: '#2F80ED' },
    '/find-people': { from: '#FF9966', to: '#FF5E62' },
    '/connections': { from: '#80FF72', to: '#2dd4bf' },
    '/notifications': { from: '#ffa9c6', to: '#f434e2' },
  };

  const navGradientStyle = (path) => ({
    '--gradient-from': navGradients[path]?.from || '#3b82f6',
    '--gradient-to': navGradients[path]?.to || '#1d4ed8',
  });

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const handleProtectedNavigation = (path) => {
    setIsMenuOpen(false);
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login', { state: { from: path, message: 'Please login to continue' } });
      return;
    }

    navigate(path);
  };

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  const navClassName = (path) => `group px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out flex items-center relative cursor-pointer overflow-hidden hover:-translate-y-0.5 ${isActiveRoute(path) ? 'text-white shadow-none' : 'text-gray-700 dark:text-gray-200 hover:text-white'}`;
  const navGradientClass = (path) => `pointer-events-none absolute inset-0 rounded-md bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] transition-opacity duration-500 ${isActiveRoute(path) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`;
  const navGlowClass = (path) => `pointer-events-none absolute inset-x-0 top-1 -z-10 h-full rounded-md bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[12px] transition-opacity duration-500 ${isActiveRoute(path) ? 'opacity-40' : 'opacity-0 group-hover:opacity-35'}`;
  const navUnderlineClass = (path) => `pointer-events-none absolute left-2 right-2 -bottom-0.5 h-0.5 rounded-full bg-white transition-transform duration-300 ease-in-out origin-center ${isActiveRoute(path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`;
  const mobileNavClassName = (path) => `group flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium relative transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${isActiveRoute(path) ? 'text-white' : 'text-gray-700 dark:text-gray-200 hover:text-white'}`;
  const utilityButtonClass = 'group relative overflow-hidden rounded-md transition-all duration-300';
  const utilityOverlayClass = 'pointer-events-none absolute inset-0 rounded-md bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-opacity duration-500 group-hover:opacity-100';
  const utilityGlowClass = 'pointer-events-none absolute inset-x-0 top-1 -z-10 h-full rounded-md bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 blur-[10px] transition-opacity duration-500 group-hover:opacity-35';

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
            <Link to="/" className="group flex items-center space-x-2 transition-all duration-300 ease-in-out hover:opacity-95">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out group-hover:text-primary-700 dark:group-hover:text-primary-300">SkillSwap</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" style={navGradientStyle('/')} className={navClassName('/')}>
              <span aria-hidden="true" className={navGlowClass('/')} />
              <span aria-hidden="true" className={navGradientClass('/')} />
              <span className="relative z-10 flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </span>
              <span aria-hidden="true" className={navUnderlineClass('/')} />
            </Link>
            <button type="button" style={navGradientStyle('/dashboard')} onClick={() => handleProtectedNavigation('/dashboard')} className={navClassName('/dashboard')}>
              <span aria-hidden="true" className={navGlowClass('/dashboard')} />
              <span aria-hidden="true" className={navGradientClass('/dashboard')} />
              <span className="relative z-10 flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Dashboard</span>
              </span>
              <span aria-hidden="true" className={navUnderlineClass('/dashboard')} />
            </button>
            <button type="button" style={navGradientStyle('/find-people')} onClick={() => handleProtectedNavigation('/find-people')} className={navClassName('/find-people')}>
              <span aria-hidden="true" className={navGlowClass('/find-people')} />
              <span aria-hidden="true" className={navGradientClass('/find-people')} />
              <span className="relative z-10 flex items-center space-x-1">
                <Search className="h-4 w-4" />
                <span>Find People</span>
              </span>
              <span aria-hidden="true" className={navUnderlineClass('/find-people')} />
            </button>
            <button type="button" style={navGradientStyle('/connections')} onClick={() => handleProtectedNavigation('/connections')} className={navClassName('/connections')}>
              <span aria-hidden="true" className={navGlowClass('/connections')} />
              <span aria-hidden="true" className={navGradientClass('/connections')} />
              <span className="relative z-10 flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>Connections</span>
              </span>
              <span aria-hidden="true" className={navUnderlineClass('/connections')} />
              {unreadMessages > 0 && (
                <span className="absolute z-20 -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>
            <button type="button" style={navGradientStyle('/notifications')} onClick={() => handleProtectedNavigation('/notifications')} className={navClassName('/notifications')}>
              <span aria-hidden="true" className={navGlowClass('/notifications')} />
              <span aria-hidden="true" className={navGradientClass('/notifications')} />
              <span className="relative z-10 flex items-center space-x-1">
                <Bell className="h-4 w-4" />
                <span>Requests</span>
              </span>
              <span aria-hidden="true" className={navUnderlineClass('/notifications')} />
              {unreadRequests > 0 && (
                <span className="absolute z-20 -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadRequests}
                </span>
              )}
            </button>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              onClick={toggleTheme}
              style={{ '--gradient-from': '#60a5fa', '--gradient-to': '#a855f7' }}
              className="group relative flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white text-gray-700 transition-all duration-300 ease-in-out hover:scale-105 hover:text-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1 -z-10 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 blur-[10px] transition-opacity duration-500 group-hover:opacity-40" />
              <span className="relative z-10">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </span>
            </button>

            {user ? (
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
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  style={{ '--gradient-from': '#56CCF2', '--gradient-to': '#2F80ED' }}
                  className={`${utilityButtonClass} px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-white`}
                >
                  <span aria-hidden="true" className={utilityGlowClass} />
                  <span aria-hidden="true" className={utilityOverlayClass} />
                  <span className="relative z-10">Login</span>
                </Link>
                <Link
                  to="/register"
                  style={{ '--gradient-from': '#a955ff', '--gradient-to': '#ea51ff' }}
                  className={`${utilityButtonClass} px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-white`}
                >
                  <span aria-hidden="true" className={utilityGlowClass} />
                  <span aria-hidden="true" className={utilityOverlayClass} />
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </div>
            )}
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
              style={{ '--gradient-from': '#60a5fa', '--gradient-to': '#a855f7' }}
              className="group relative w-full overflow-hidden rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all duration-300 ease-in-out cursor-pointer hover:text-white dark:text-gray-200"
            >
              <span aria-hidden="true" className={utilityOverlayClass} />
              <span className="relative z-10 flex items-center space-x-2">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </span>
            </button>

            <Link
              to="/"
              style={navGradientStyle('/')}
              className={mobileNavClassName('/')}
              onClick={() => setIsMenuOpen(false)}
            >
              <span aria-hidden="true" className={navGradientClass('/')} />
              <span className="relative z-10 flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </span>
            </Link>
            <button type="button" style={navGradientStyle('/dashboard')} onClick={() => handleProtectedNavigation('/dashboard')} className={mobileNavClassName('/dashboard')}>
              <span aria-hidden="true" className={navGradientClass('/dashboard')} />
              <span className="relative z-10 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Dashboard</span>
              </span>
            </button>
            <button type="button" style={navGradientStyle('/find-people')} onClick={() => handleProtectedNavigation('/find-people')} className={mobileNavClassName('/find-people')}>
              <span aria-hidden="true" className={navGradientClass('/find-people')} />
              <span className="relative z-10 flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Find People</span>
              </span>
            </button>
            <button type="button" style={navGradientStyle('/connections')} onClick={() => handleProtectedNavigation('/connections')} className={mobileNavClassName('/connections')}>
              <span aria-hidden="true" className={navGradientClass('/connections')} />
              <span className="relative z-10 flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Connections</span>
              </span>
              {unreadMessages > 0 && (
                <span className="absolute z-20 top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>
            <button type="button" style={navGradientStyle('/notifications')} onClick={() => handleProtectedNavigation('/notifications')} className={mobileNavClassName('/notifications')}>
              <span aria-hidden="true" className={navGradientClass('/notifications')} />
              <span className="relative z-10 flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Requests</span>
              </span>
              {unreadRequests > 0 && (
                <span className="absolute z-20 top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadRequests}
                </span>
              )}
            </button>
            {user ? (
              <>
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
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{ '--gradient-from': '#56CCF2', '--gradient-to': '#2F80ED' }}
                  className="group relative block overflow-hidden rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-all duration-300 hover:text-white dark:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span aria-hidden="true" className={utilityOverlayClass} />
                  <span className="relative z-10">Login</span>
                </Link>
                <Link
                  to="/register"
                  style={{ '--gradient-from': '#a955ff', '--gradient-to': '#ea51ff' }}
                  className="group relative block overflow-hidden rounded-md px-3 py-2 text-base font-semibold text-gray-700 transition-all duration-300 hover:text-white dark:text-gray-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span aria-hidden="true" className={utilityOverlayClass} />
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;