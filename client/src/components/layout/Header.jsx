// components/layout/Header.jsx
import { useSelector, useDispatch } from 'react-redux'
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, User, LogOut, Menu, ChevronDown } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'

const Header = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const userMenuRef = useRef(null)
  const notificationsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <nav className="ml-4 flex space-x-2 text-sm">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Current Page</span>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-danger-500 rounded-full"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {/* Notification items would go here */}
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">New stock request requires approval</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600"
            >
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header