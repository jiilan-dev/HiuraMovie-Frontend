import { Link, useNavigate } from 'react-router';
import { Search, Bell, User, ChevronDown, LogOut, LayoutDashboard, ListVideo, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '~/contexts/auth-context';

export function Navbar() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/95 backdrop-blur-md shadow-lg' 
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                HIURA
              </span>
            </Link>
            
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-white font-medium hover:text-gray-300 transition-colors">
                Home
              </Link>
              <Link to="/movies" className="text-gray-400 hover:text-white transition-colors">
                Movies
              </Link>
              <Link to="/series" className="text-gray-400 hover:text-white transition-colors">
                Series
              </Link>
              {user && (
                <Link to="/my-list" className="text-gray-400 hover:text-white transition-colors">
                  My List
                </Link>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <button className="text-gray-300 hover:text-white transition-colors">
                      <Bell className="w-5 h-5" />
                    </button>
                    
                    {/* User Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-gray-800 rounded-md shadow-xl py-2">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-800">
                            <p className="text-white font-medium truncate">{user.username}</p>
                            <p className="text-gray-500 text-sm truncate">{user.email}</p>
                          </div>

                          {/* Admin Dashboard */}
                          {user.role === 'ADMIN' && (
                            <Link 
                              to="/dashboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard
                            </Link>
                          )}

                          {/* My Playlist */}
                          <Link 
                            to="/my-list"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                          >
                            <ListVideo className="w-4 h-4" />
                            My Playlist
                          </Link>

                          {/* Settings */}
                          <Link 
                            to="/settings"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>

                          {/* Logout */}
                          <div className="border-t border-gray-800 mt-2 pt-2">
                            <button 
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2 w-full text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Login Button */
                  <Link 
                    to="/login"
                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
