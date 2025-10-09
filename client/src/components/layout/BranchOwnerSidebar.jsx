// components/layout/BranchOwnerSidebar.jsx
import { NavLink } from 'react-router-dom';

const BranchOwnerSidebar = ({ isOpen, onClose, branchOwnerId }) => {
  const menuItems = [
    { path: branchOwnerId ? `/dashboard/branch-owner/${branchOwnerId}/dashboard` : '/dashboard/branch-owner', label: 'Dashboard', icon: '📊' },
    { path: branchOwnerId ? `/dashboard/branch-owner/${branchOwnerId}/sales` : '/dashboard/branch-owner/sales', label: 'Sales', icon: '💰' },
    { path: branchOwnerId ? `/dashboard/branch-owner/${branchOwnerId}/expenses` : '/dashboard/branch-owner/expenses', label: 'Expenses', icon: '📝' },
    { path: branchOwnerId ? `/dashboard/branch-owner/${branchOwnerId}/stock-requests` : '/dashboard/branch-owner/stock-requests', label: 'Stock Requests', icon: '📦' },
    { path: branchOwnerId ? `/dashboard/branch-owner/${branchOwnerId}/transport` : '/dashboard/branch-owner/transport', label: 'Transport', icon: '🚚' },
    { path: branchOwnerId ? `/dashboard/branch-owner/${branchOwnerId}/reports` : '/dashboard/branch-owner/reports', label: 'Reports', icon: '📈' },
    { path: branchOwnerId ? `/dashboard/branch-owner/${branchOwnerId}/daily-store-images` : '/dashboard/branch-owner/daily-store-images', label: 'Daily Store Images', icon: '📸' },
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
          <h2 className="text-lg font-bold">Branch Panel</h2>
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
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default BranchOwnerSidebar;