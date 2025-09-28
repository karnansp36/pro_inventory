// pages/dashboard/branch-owner/SalesPage.jsx
import React, { useState } from 'react';
import SalesForm from './SalesForm';
import SalesTable from './SalesTable';

const SalesPage = () => {
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
          <SalesForm onSaleAdded={handleSaleAdded} />
        </div>
        <div className="lg:col-span-2">
          <SalesTable key={refreshTable} />
        </div>
      </div>
    </div>
  );
};

export default SalesPage;