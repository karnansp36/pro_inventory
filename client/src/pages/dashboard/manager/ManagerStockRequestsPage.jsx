// client/src/pages/dashboard/manager/ManagerStockRequestsPage.jsx
import React from 'react';
import StockRequestsTable from '../branch-owner/StockRequestsTable'; // Reusing the existing table for now

const ManagerStockRequestsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Stock Requests Overview</h1>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-600">Read Only Access</span>
        </div>
      </div>

      <div className="lg:col-span-2">
        <StockRequestsTable isManagerView={true} />
      </div>
    </div>
  );
};

export default ManagerStockRequestsPage;