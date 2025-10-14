// client/src/components/layout/BrandOwnerLayout.jsx
import { useState } from 'react';
import BrandOwnerSidebar from './BrandOwnerSidebar';
import Navbar from './Navbar';
import { useTheme } from '../../context/ThemeContext';

const BrandOwnerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      {/* Sidebar - Fixed height */}
      <div className="h-screen">
        <BrandOwnerSidebar 
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
            {children}
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

export default BrandOwnerLayout;