import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { getSalesByBranch } from '../../../store/slices/salesSlice';
import { getExpensesByBranch } from '../../../store/slices/expensesSlice';
import { getTransportsByBranch } from '../../../store/slices/transportSlice';
import { getStockRequestsByBranch } from '../../../store/slices/stockRequestsSlice';

const ManagerBranchDetails = () => {
  const { branchId: branchOwnerId } = useParams();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const {
    sales,
    expenses,
    transports,
    stockRequests,
    loading,
    error,
  } = useSelector((state) => ({
    sales: state.sales.sales,
    expenses: state.expenses.expenses,
    transports: state.transport.transport,
    stockRequests: state.stockRequests.stockRequests,
    loading: state.sales.loading || state.expenses.loading || state.transport.loading || state.stockRequests.loading,
    error: state.sales.error || state.expenses.error || state.transport.error || state.stockRequests.error,
  }));

  useEffect(() => {
    dispatch(getSalesByBranch(branchOwnerId));
    dispatch(getExpensesByBranch(branchOwnerId));
    dispatch(getTransportsByBranch(branchOwnerId));
    dispatch(getStockRequestsByBranch(branchOwnerId));
  }, [dispatch, branchOwnerId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 lg:p-8 rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
          : 'bg-gradient-to-r from-white via-gray-50 to-white border-gray-200 shadow-gray-200/50'
      }`}>
        <div className="space-y-1">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
            theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
          }`}>
            Branch Overview
          </h1>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            View sales, expenses, transport, and stock requests data for this branch.
          </p>
        </div>
      </div>

      {/* Sales Data */}
      <div>
        <h2>Sales</h2>
        {sales.length > 0 ? (
          <ul>
            {sales.map((sale) => (
              <li key={sale._id}>{sale.amount}</li>
            ))}
          </ul>
        ) : (
          <p>No sales data available.</p>
        )}
      </div>

      {/* Expenses Data */}
      <div>
        <h2>Expenses</h2>
        {expenses.length > 0 ? (
          <ul>
            {expenses.map((expense) => (
              <li key={expense._id}>{expense.amount}</li>
            ))}
          </ul>
        ) : (
          <p>No expenses data available.</p>
        )}
      </div>

      {/* Transport Data */}
      <div>
        <h2>Transport</h2>
        {transports.length > 0 ? (
          <ul>
            {transports.map((transport) => (
              <li key={transport._id}>{transport.cost}</li>
            ))}
          </ul>
        ) : (
          <p>No transport data available.</p>
        )}
      </div>

      {/* Stock Requests Data */}
      <div>
        <h2>Stock Requests</h2>
        {stockRequests.length > 0 ? (
          <ul>
            {stockRequests.map((request) => (
              <li key={request._id}>{request.quantity}</li>
            ))}
          </ul>
        ) : (
          <p>No stock requests data available.</p>
        )}
      </div>
    </div>
  );
};

export default ManagerBranchDetails;