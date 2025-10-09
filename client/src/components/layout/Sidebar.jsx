// components/layout/Sidebar.jsx
import { 
  Users, 
  Building2, 
  TrendingUp, 
  FileText, 
  Package, 
  Truck,
  Activity,
  Download,
  Settings
} from 'lucide-react';
import { Camera } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/dashboard/admin', icon: Users, label: 'Dashboard' },
    { path: '/dashboard/admin/users', icon: Users, label: 'User Management' },
    { path: '/dashboard/admin/sales', icon: TrendingUp, label: 'Sales' },
    { path: '/dashboard/admin/expenses', icon: FileText, label: 'Expenses' },
    { path: '/dashboard/admin/stock-requests', icon: Package, label: 'Stock Requests' },
    { path: '/dashboard/admin/transport', icon: Truck, label: 'Transport' },
    { path: '/dashboard/admin/reports', icon: Activity, label: 'Reports' },
    { path: '/dashboard/admin/exports', icon: Download, label: 'Exports' },
    { path: '/dashboard/admin/activity-logs', icon: Activity, label: 'Activity Logs' },
    { path: '/dashboard/admin/daily-store-images', icon: Camera, label: 'Daily Store Images' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
  w-48 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-800"
          >
            ✕
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 p-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
              onClick={onClose}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;