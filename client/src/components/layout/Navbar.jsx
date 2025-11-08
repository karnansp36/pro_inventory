import { Bell, Menu, User, LogOut, Search, ChevronDown, Settings } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useState } from 'react';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { theme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className={`backdrop-blur-xl border-b z-30 sticky top-0 transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800/50'
        : 'bg-white/80 border-gray-200/60'
    }`}>
      <div className="flex items-center justify-between px-4 lg:px-6 py-3.5">
        {/* Left Section */}
        <div className="flex items-center space-x-3 lg:space-x-6 flex-1">
          <button
            onClick={onMenuToggle}
            className={`p-2 rounded-xl lg:hidden transition-all duration-200 ${
              theme === 'dark'
                ? 'hover:bg-slate-800/50 active:scale-95'
                : 'hover:bg-gray-100 active:scale-95'
            }`}
          >
            <Menu className={`h-5 w-5 transition-colors ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`} />
          </button>
          
          <div className="relative max-w-md w-full">
            <Search className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
              searchFocused
                ? theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                : theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search anything..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-300 outline-none ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:bg-slate-800 focus:border-blue-500/50 focus:shadow-lg focus:shadow-blue-500/20'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500/50 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 lg:space-x-3">
          <ThemeToggle />
          
          <button className={`relative p-2.5 rounded-xl transition-all duration-200 ${
            theme === 'dark'
              ? 'hover:bg-slate-800/50 active:scale-95'
              : 'hover:bg-gray-100 active:scale-95'
          }`}>
            <Bell className={`h-5 w-5 transition-colors ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`} />
            <span className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse ${
              theme === 'dark'
                ? 'bg-blue-500 ring-2 ring-slate-900/50 shadow-lg shadow-blue-500/50'
                : 'bg-blue-500 ring-2 ring-white/50'
            }`}></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                showDropdown
                  ? theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'
                  : theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
              }`}
            >
              <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20'
              }`}>
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className={`text-sm font-semibold ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
                }`}>{user?.name}</p>
                <p className={`text-xs capitalize ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>{user?.role === 'Manager' ? 'Owner' : user?.role === 'Branch' ? 'Manager' : user?.role}</p>
              </div>
              <ChevronDown className={`h-4 w-4 transition-all duration-300 hidden md:block ${
                showDropdown ? 'rotate-180' : 'rotate-0'
              } ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border overflow-hidden z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-800/50'
                    : 'bg-white/95 border-gray-200'
                }`}>
                  <div className={`px-5 py-5 border-b ${
                    theme === 'dark'
                      ? 'border-slate-800/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10'
                      : 'border-gray-100 bg-gradient-to-br from-gray-50 to-white'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        theme === 'dark'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20'
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25'
                      }`}>
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          theme === 'dark' ? 'text-slate-200' : 'text-gray-800'
                        }`}>{user?.name}</p>
                        <p className={`text-xs capitalize ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                        }`}>{user?.role}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-2 rounded-lg text-xs truncate ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 text-slate-400'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user?.email}
                    </div>
                  </div>
                  
                  <div className={`p-2 ${theme === 'dark' ? 'bg-slate-900/50' : ''}`}>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setShowDropdown(false)}
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${
                        theme === 'dark'
                          ? 'text-slate-300 hover:bg-blue-600/10 hover:text-blue-400 active:scale-98'
                          : 'text-gray-700 hover:bg-blue-50 active:scale-98'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-slate-800/50 group-hover:bg-blue-600/20'
                          : 'bg-blue-50 group-hover:bg-blue-100'
                      }`}>
                        <Settings className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                      </div>
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${
                        theme === 'dark'
                          ? 'text-slate-300 hover:bg-red-600/10 hover:text-red-400 active:scale-98'
                          : 'text-gray-700 hover:bg-red-50 active:scale-98'
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-slate-800/50 group-hover:bg-red-600/20'
                          : 'bg-red-50 group-hover:bg-red-100'
                      }`}>
                        <LogOut className={`h-4 w-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;