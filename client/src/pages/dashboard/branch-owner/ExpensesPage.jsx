// pages/dashboard/branch-owner/ExpensesPage.jsx
import React, { useState } from 'react';
import ExpensesForm from './ExpensesForm';
import ExpensesTable from './ExpensesTable';

const ExpensesPage = () => {
  const [refreshTable, setRefreshTable] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTable(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Expenses Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpensesForm onExpenseAdded={handleExpenseAdded} />
        </div>
        <div className="lg:col-span-2">
          <ExpensesTable key={refreshTable} />
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;