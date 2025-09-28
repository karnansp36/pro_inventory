// pages/dashboard/branch-owner/BranchOwnerDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ShopProfile from './ShopProfile';
import SalesTable from './SalesTable';
import ExpensesTable from './ExpensesTable';
import StockRequestsTable from './StockRequestsTable';
import TransportTable from './TransportTable';
import ReportsPanel from './ReportsPanel';

const BranchOwnerDashboard = () => {
  const quickActions = [
    { to: '/sales', label: 'Add Sales', icon: '➕', color: 'green' },
    { to: '/expenses', label: 'Add Expense', icon: '💸', color: 'red' },
    { to: '/stock-requests', label: 'Request Stock', icon: '📦', color: 'blue' },
    { to: '/transport', label: 'Check Transport', icon: '🚚', color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Branch Owner Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back! Ready for today's operations?
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.to}
            className={`
              p-4 rounded-lg shadow-sm border text-center transition-all hover:shadow-md
              bg-white hover:scale-105 cursor-pointer
            `}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <div className="font-medium text-gray-800">{action.label}</div>
          </Link>
        ))}
      </div>

      {/* Shop Profile */}
      <ShopProfile />

      {/* Data Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SalesTable />
          <ExpensesTable />
        </div>
        <div className="space-y-6">
          <StockRequestsTable />
          <TransportTable />
        </div>
      </div>

      {/* Reports */}
      <ReportsPanel />
    </div>
  );
};

export default BranchOwnerDashboard;