// client/src/components/layout/BrandOwnerSidebar.jsx
import { NavLink } from 'react-router-dom';
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

const BrandOwnerSidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/dashboard', icon: Building2, label: 'Dashboard' },
    { path: '/dashboard/users', icon: Users, label: 'User Management' },
    { path: '/dashboard/sales', icon: TrendingUp, label: 'Sales' },
    { path: '/dashboard/expenses', icon: FileText, label: 'Expenses' },
    { path: '/dashboard/stock-requests', icon: Package, label: 'Stock Requests' },
    { path: '/dashboard/transport', icon: Truck, label: 'Transport' },
    { path: '/dashboard/reports', icon: Activity, label: 'Reports' },
    { path: '/dashboard/exports', icon: Download, label: 'Exports' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
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
          <h2 className="text-lg font-bold">Brand Owner Panel</h2>
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

export default BrandOwnerSidebar;