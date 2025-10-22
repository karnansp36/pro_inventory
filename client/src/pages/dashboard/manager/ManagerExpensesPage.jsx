// client/src/pages/dashboard/manager/ManagerExpensesPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { getExpensesByManager } from '../../../store/slices/expensesSlice';
import ExpensesTable from '../branch-owner/ExpensesTable';
import { useAuth } from '../../../context/AuthContext';
import { CreditCard } from 'lucide-react';

const ManagerExpensesPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [refreshTable, setRefreshTable] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTable(prev => prev + 1);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl p-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Expenses Overview
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                View and monitor expenses across all assigned branches
              </p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-white text-sm font-medium">Read Only Access</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <ExpensesTable
            key={refreshTable}
            isManagerView={true}
            managerId={user?._id}
          />
        </div>
      </div>
    </div>
  );
};

export default ManagerExpensesPage;