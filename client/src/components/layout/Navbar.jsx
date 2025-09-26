// components/layout/Navbar.jsx
import { Bell, Menu, User, LogOut, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useState } from 'react';

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-md hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;