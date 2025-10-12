import {
  Users,
  Building2,
  TrendingUp,
  FileText,
  Package,
  Truck,
  Activity,
  Download,
  Settings,
  Camera,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const BrandOwnerSidebar = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };
  
  const menuItems = [
    { path: '/dashboard/brand-owner', icon: Activity, label: 'Dashboard', category: 'main' },
    { path: '/dashboard/brand-owner/users', icon: Users, label: 'User Management', category: 'main' },
    { path: '/dashboard/brand-owner/sales', icon: TrendingUp, label: 'Sales', category: 'operations' },
    { path: '/dashboard/brand-owner/expenses', icon: FileText, label: 'Expenses', category: 'operations' },
    { path: '/dashboard/brand-owner/stock-requests', icon: Package, label: 'Stock Requests', category: 'operations' },
    { path: '/dashboard/brand-owner/transport', icon: Truck, label: 'Transport', category: 'operations' },
    { path: '/dashboard/brand-owner/daily-store-images', icon: Camera, label: 'Store Images', category: 'monitoring' },
    { path: '/dashboard/brand-owner/reports', icon: FileText, label: 'Reports', category: 'monitoring' },
    { path: '/dashboard/brand-owner/exports', icon: Download, label: 'Exports', category: 'monitoring' },
  ];

  const categories = {
    main: 'Main',
    operations: 'Operations',
    monitoring: 'Monitoring'
  };

  const groupedItems = Object.entries(categories).map(([key, label]) => ({
    label,
    items: menuItems.filter(item => item.category === key)
  }));

  return (
    <>
      {/* Overlay with blur effect */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
            theme === 'dark'
              ? 'bg-black/60 backdrop-blur-sm'
              : 'bg-black/30 backdrop-blur-sm'
          }`}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 transform transition-all duration-300 ease-in-out
        shadow-2xl lg:shadow-none border-r
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${theme === 'dark'
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-slate-800/50'
          : 'bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900 border-gray-200'
        }
      `}>
        {/* Header */}
        <div className={`relative p-6 border-b transition-colors ${
          theme === 'dark'
            ? 'border-slate-800/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10'
            : 'border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${
                theme === 'dark' ? 'shadow-lg shadow-blue-500/20' : 'shadow-md shadow-blue-500/30'
              }`}>
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Brand Owner Panel
                </h1>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  Management System
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-200'
              }`}
            >
              <ChevronRight className={`h-5 w-5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {groupedItems.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 mb-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                }`}>
                  {group.label}
                </span>
              </div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    group flex items-center justify-between px-3 py-2.5 rounded-xl
                    transition-all duration-200 relative overflow-hidden
                    ${isActive
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/30'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }
                  `}
                  onClick={onClose}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className={`absolute inset-0 animate-pulse ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
                            : 'bg-gradient-to-r from-blue-300/30 to-purple-300/30'
                        }`} />
                      )}
                      <div className="flex items-center space-x-3 relative z-10">
                        <div className={`
                          p-1.5 rounded-lg transition-all duration-200
                          ${isActive
                            ? 'bg-white/10'
                            : theme === 'dark'
                              ? 'bg-slate-800/50 group-hover:bg-slate-700/50'
                              : 'bg-gray-100 group-hover:bg-gray-300'
                          }
                        `}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 relative z-10" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer - Settings & Logout */}
        <div className={`p-4 border-t space-y-2 ${
          theme === 'dark'
            ? 'border-slate-800/50 bg-slate-900/50'
            : 'border-gray-200 bg-gray-50'
        }`}>
          <button className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
            theme === 'dark'
              ? 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
          }`}>
            <div className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-slate-800/50 group-hover:bg-slate-700/50'
                : 'bg-gray-100 group-hover:bg-gray-300'
            }`}>
              <Settings className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
            theme === 'dark'
              ? 'text-slate-300 hover:bg-red-600/10 hover:text-red-400'
              : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
          }`}>
            <div className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-slate-800/50 group-hover:bg-red-600/20'
                : 'bg-gray-100 group-hover:bg-red-100'
            }`}>
              <LogOut className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default BrandOwnerSidebar;