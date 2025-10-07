// pages/dashboard/branch-owner/StockRequestsPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import StockRequestForm from './StockRequestForm';
import StockRequestsTable from './StockRequestsTable';

const StockRequestsPage = () => {
  const { branchOwnerId } = useParams();
  const [refreshTable, setRefreshTable] = useState(0);

  const handleRequestAdded = () => {
    setRefreshTable(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Stock Requests</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StockRequestForm onRequestAdded={handleRequestAdded} branchOwnerId={branchOwnerId} />
        </div>
        <div className="lg:col-span-2">
          <StockRequestsTable key={refreshTable} branchOwnerId={branchOwnerId} />
        </div>
      </div>
    </div>
  );
};

export default StockRequestsPage;
