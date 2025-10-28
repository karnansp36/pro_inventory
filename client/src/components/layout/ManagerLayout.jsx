// components/layout/ManagerLayout.jsx
import { useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import ManagerSidebar from './ManagerSidebar';
import Navbar from './Navbar';
import { useTheme } from '../../context/ThemeContext';

const ManagerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();
  const { branchId } = useParams(); // Get branchId from URL params

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      {/* Sidebar - Fixed height */}
      <div className="h-screen">
        <ManagerSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Navbar */}
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
            : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
        }`}>
          <div className="min-h-full">
            <Outlet context={{ branchId }} /> {/* Pass branchId as context */}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default ManagerLayout;