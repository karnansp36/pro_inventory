// client/src/pages/dashboard/manager/ManagerExpensesPage.jsx
import React from 'react';
import ExpensesTable from '../branch-owner/ExpensesTable'; // Reusing the existing table for now
import { useAuth } from '../../../context/AuthContext';

const ManagerExpensesPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Expenses Overview</h1>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-600">Read Only Access</span>
        </div>
      </div>

      <div className="lg:col-span-2">
        <ExpensesTable
          isManagerView={true}
          branchOwnerId={user?.managerId ? user.managerId : null}
        />
      </div>
    </div>
  );
};

export default ManagerExpensesPage;