// client/src/pages/dashboard/brand-owner/BrandOwnerReportsPage.jsx
// Forcing Vite to re-evaluate imports
import React from 'react';
import ReportsPanel from '../branch-owner/ReportsPanel'; // Reusing the existing panel for now

const BrandOwnerReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Reports Overview</h1>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-600">Filtered to your business unit</span>
        </div>
      </div>

      <div className="lg:col-span-2">
        <ReportsPanel isBrandOwner={true} />
      </div>
    </div>
  );
};

export default BrandOwnerReportsPage;