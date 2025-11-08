// pages/dashboard/branch-owner/BranchDashboard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { getStockRequestsByBranch } from '../../../store/slices/stockRequestsSlice';
import { getTransportsByBranch } from '../../../store/slices/transportSlice';
import { getDailyReportsByBranch } from '../../../store/slices/dailyReportSlice';
import ShopProfile from './ShopProfile';

const BranchDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Get user from Redux store
  const { user } = useSelector((state) => state.auth);
  const branchOwnerId = user?._id;
  const dispatch = useDispatch();

  const {
    stockRequests,
    isLoading: stockRequestsLoading,
    error: stockRequestsError,
  } = useSelector((state) => state.stockRequests);

  const {
    transport: transports, // Direct access to transport array
    loading: transportsLoading,
    error: transportsError,
  } = useSelector((state) => state.transport);

  const {
    dailyReports,
    isLoading: dailyReportsLoading,
    error: dailyReportsError,
  } = useSelector((state) => state.dailyReport);

  React.useEffect(() => {
    if (branchOwnerId) {
      dispatch(getStockRequestsByBranch({ branchId: branchOwnerId }));
      dispatch(getTransportsByBranch({ branchId: branchOwnerId }));
      dispatch(getDailyReportsByBranch({ branchId: branchOwnerId }));
    }
  }, [branchOwnerId, dispatch]);

  // Calculate totals
  const totalSales = dailyReports.reduce((acc, report) => 
    acc + (report.gpay || 0) + (report.card || 0) + (report.cash || 0), 0
  );

  const totalExpenses = dailyReports.reduce((acc, report) => 
    acc + (report.expenses || 0), 0
  );

  // Get the count of transport documents instead of quantity sum
  const transportCount = transports?.length || 0;

  // Quick action buttons
  const quickActions = [
    {
      id: 'sale',
      label: 'Sales',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'emerald',
      description: 'View and add sales',
      path: '/dashboard/branch-owner/sales',
    },
    {
      id: 'stock',
      label: 'Stock Requests',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'blue',
      description: 'View and request stock',
      path: '/dashboard/branch-owner/stock-requests',
    },
    {
      id: 'transport',
      label: 'Transport',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      color: 'purple',
      description: 'View and manage transport',
      path: '/dashboard/branch-owner/transport',
    },
    {
      id: 'daily-images',
      label: 'Store Images',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'pink',
      description: 'View daily store photos',
      path: '/dashboard/branch-owner/daily-store-images',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      emerald: {
        bg: 'bg-emerald-500',
        hover: 'hover:bg-emerald-600',
        light: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        shadow: 'shadow-emerald-500/20',
      },
      rose: {
        bg: 'bg-rose-500',
        hover: 'hover:bg-rose-600',
        light: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200',
        shadow: 'shadow-rose-500/20',
      },
      pink: {
        bg: 'bg-pink-500',
        hover: 'hover:bg-pink-600',
        light: 'bg-pink-50',
        text: 'text-pink-600',
        border: 'border-pink-200',
        shadow: 'shadow-pink-500/20',
      },
      blue: {
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        light: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        shadow: 'shadow-blue-500/20',
      },
      purple: {
        bg: 'bg-purple-500',
        hover: 'hover:bg-purple-600',
        light: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        shadow: 'shadow-purple-500/20',
      },
      orange: {
        bg: 'bg-orange-500',
        hover: 'hover:bg-orange-600',
        light: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-200',
        shadow: 'shadow-orange-500/20',
      },
    };
    return colors[color];
  };

  // Function to handle navigation with state
  const handleNavigation = (path) => {
    if (!branchOwnerId) {
      console.error('No branchOwnerId found');
      return;
    }
    
    navigate(path, { 
      state: { branchOwnerId } 
    });
  };


  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className={`rounded-2xl p-6 sm:p-8 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 border-0'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Welcome Back! 👋
              </h1>
              <p className="text-white/90 text-sm sm:text-base">
                Let's manage your Manager operations today
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl ${
              isDark ? 'bg-slate-900/50' : 'bg-white/20'
            } backdrop-blur-sm`}>
              <div className="text-xs text-white/70">Branch ID</div>
              <div className="text-lg font-semibold text-white">
                #{branchOwnerId}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDark ? 'text-slate-200' : 'text-gray-800'
          }`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const colors = getColorClasses(action.color);
              return (
                <button
                  key={action.id}
                  onClick={() => handleNavigation(action.path)}
                  className={`group relative overflow-hidden rounded-2xl ${
                    isDark
                      ? 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                      : 'bg-white border-2 border-gray-100 hover:border-gray-200'
                  } p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left`}
                >
                  <div className={`inline-flex p-3 rounded-xl ${colors.bg} text-white mb-4 ${colors.shadow}`}>
                    {action.icon}
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${
                    isDark ? 'text-slate-200' : 'text-gray-900'
                  }`}>
                    {action.label}
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {action.description}
                  </p>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shop Profile */}
        {/* <div className={`rounded-2xl overflow-hidden ${
          isDark 
            ? 'bg-slate-800/50 border border-slate-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <ShopProfile />
        </div> */}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Sales Card */}
          <div className={`rounded-2xl p-6 ${
            isDark
              ? 'bg-slate-800/50 border border-slate-700'
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-emerald-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Total Sales</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                  {dailyReportsLoading ? 'Loading...' : dailyReportsError ? 'Error' : `$${totalSales.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Total Expenses Card */}
          <div className={`rounded-2xl p-6 ${
            isDark
              ? 'bg-slate-800/50 border border-slate-700'
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500 text-white shadow-rose-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Total Expenses</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                  {dailyReportsLoading ? 'Loading...' : dailyReportsError ? 'Error' : `$${totalExpenses.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Total Stock Requests Card */}
          <div className={`rounded-2xl p-6 ${
            isDark
              ? 'bg-slate-800/50 border border-slate-700'
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500 text-white shadow-blue-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Stock Requests</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                  {stockRequestsLoading ? 'Loading...' : stockRequestsError ? 'Error' : stockRequests.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Transport Card */}
          <div className={`rounded-2xl p-6 ${
            isDark
              ? 'bg-slate-800/50 border border-slate-700'
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500 text-white shadow-purple-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Total Transports</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                  {transportsLoading ? 'Loading...' : transportsError ? 'Error' : transportCount}
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {transportCount === 1 ? 'transport' : 'transports'} made
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDashboard;