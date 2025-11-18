// pages/dashboard/admin2/ManagerProductPaymentsPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import ManagerProductPaymentForm from './ManagerProductPaymentForm';
import ManagerProductPaymentsTable from './ManagerProductPaymentsTable';
import { getProductPaymentsByUserId } from '../../../store/slices/productPaymentsSlice';

const ManagerProductPaymentsPage = () => {
  const dispatch = useDispatch();
  const { productPayments, loading, summary } = useSelector((state) => state.productPayments);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showForm, setShowForm] = useState(false);
  const [refreshTable, setRefreshTable] = useState(0);
    const { user } = useSelector((state) => state.auth);
  
  const handlePaymentAdded = () => {
    setRefreshTable(prev => prev + 1);
    setShowForm(false);
    // Refresh the table data
    dispatch(getProductPaymentsByUserId({  userId: user?._id, page: 1, limit: 10 }));
  };

  // Load initial data
  useEffect(() => {
    dispatch(getProductPaymentsByUserId({ userId: user?._id, page: 1, limit: 10 }));
  }, [dispatch]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl p-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Product Payments
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Manage product payments and track payment status
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                showForm
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-white text-blue-600 hover:bg-gray-50 shadow-lg'
              }`}
            >
              {showForm ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close Form
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Payment
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Amount
                </p>
                <p className={`text-2xl font-bold mt-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  ${summary?.totalAmount?.toLocaleString() || '0'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Paid
                </p>
                <p className={`text-2xl font-bold mt-2 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  ${summary?.totalPaid?.toLocaleString() || '0'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                isDark ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Pending Balance
                </p>
                <p className={`text-2xl font-bold mt-2 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  ${summary?.totalPending?.toLocaleString() || '0'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`grid grid-cols-1 ${showForm ? 'lg:grid-cols-3' : ''} gap-6`}>
          {/* Form - Conditional */}
          {showForm && (
            <div className="lg:col-span-1">
              <ManagerProductPaymentForm 
                onPaymentAdded={handlePaymentAdded}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
          
          {/* Table */}
          <div className={showForm ? 'lg:col-span-2' : ''}>
            <ManagerProductPaymentsTable 
              key={refreshTable}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerProductPaymentsPage;