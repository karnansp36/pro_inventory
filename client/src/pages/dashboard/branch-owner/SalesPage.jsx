// pages/dashboard/branch-owner/SalesPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import SalesForm from '../../../components/forms/SalesForm';
import SalesTable from './SalesTable';

const SalesPage = () => {
  const { branchOwnerId } = useParams();
  const [refreshTable, setRefreshTable] = useState(0);

  const handleSaleAdded = () => {
    setRefreshTable(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sales Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SalesForm onClose={handleSaleAdded} branchOwnerId={branchOwnerId} />
        </div>
        <div className="lg:col-span-2">
          <SalesTable key={refreshTable} branchOwnerId={branchOwnerId} />
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
