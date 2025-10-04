// client/src/components/layout/BrandOwnerLayout.jsx
import { useState } from 'react';
import BrandOwnerSidebar from './BrandOwnerSidebar';
import Navbar from './Navbar';

const BrandOwnerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <BrandOwnerSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BrandOwnerLayout;