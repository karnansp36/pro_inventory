// client/src/pages/dashboard/manager/ManagerSalesPage.jsx
import React from 'react';
import SalesTable from '../branch-owner/SalesTable'; // Reusing the existing table for now

const ManagerSalesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sales Overview</h1>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-600">Read Only Access</span>
        </div>
      </div>

      <div className="lg:col-span-2">
        <SalesTable isManagerView={true} />
      </div>
    </div>
  );
};

export default ManagerSalesPage;