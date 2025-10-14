// pages/dashboard/branch-owner/BranchDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { getDailyStoreImagesForBranchOwner, reset } from '../../../store/slices/dailyStoreImageSlice';
import ShopProfile from './ShopProfile';
import SalesTable from './SalesTable';
import ExpensesTable from './ExpensesTable';
import StockRequestsTable from './StockRequestsTable';
import TransportTable from './TransportTable';
import ReportsPanel from './ReportsPanel';
import ExpenseForm from '../../../components/forms/ExpenseForm';
import TransportForm from '../../../components/forms/TransportForm';
import QuickAddForm from '../../../components/forms/QuickAddForm';
import Modal from '../../../components/Modal';
import { createSale } from '../../../store/slices/salesSlice';
import { createExpense } from '../../../store/slices/expensesSlice';
import { createStockRequest } from '../../../store/slices/stockRequestsSlice';
import { createTransport } from '../../../store/slices/transportSlice';

const BranchDashboard = () => {
  const dispatch = useDispatch();
  const { branchOwnerId } = useParams();
  const { theme } = useTheme();
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { dailyStoreImages, isLoading, isError, message } = useSelector(
    (state) => state.dailyStoreImages
  );

  const isDark = theme === 'dark';

  // Handlers for opening modals
  const openModal = (type) => setModal(type);
  const closeModal = () => setModal(null);

  // Submit handlers
  const handleAddSale = async (form) => {
    setLoading(true);
    await dispatch(createSale(form));
    setLoading(false);
    closeModal();
  };

  const handleAddExpense = async (form) => {
    setLoading(true);
    await dispatch(createExpense(form));
    setLoading(false);
    closeModal();
  };

  const handleAddStockRequest = async (form) => {
    setLoading(true);
    await dispatch(createStockRequest(form));
    setLoading(false);
    closeModal();
  };

  const handleAddTransport = async (form) => {
    setLoading(true);
    await dispatch(createTransport(form));
    setLoading(false);
    closeModal();
  };

  useEffect(() => {
    dispatch(getDailyStoreImagesForBranchOwner());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Quick action buttons with simple, clear icons
  const quickActions = [
    {
      id: 'sale',
      label: 'Add Sale',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'emerald',
      description: 'Record new sale',
    },
    {
      id: 'expense',
      label: 'Add Expense',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'rose',
      description: 'Track expenses',
    },
    {
      id: 'stock',
      label: 'Request Stock',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'blue',
      description: 'Order inventory',
    },
    {
      id: 'transport',
      label: 'Add Transport',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      color: 'purple',
      description: 'Manage delivery',
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
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header - Simple and friendly */}
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
                Let's manage your branch operations today
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

        {/* Quick Actions - Large, clear buttons */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${
            isDark ? 'text-slate-200' : 'text-gray-800'
          }`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const colors = getColorClasses(action.color);
              return (
                <button
                  key={action.id}
                  onClick={() => openModal(action.id)}
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

        {/* Modals */}
        {modal === 'sale' && (
          <Modal onClose={closeModal} title="Add Sale">
            <QuickAddForm onSubmit={handleAddSale} onCancel={closeModal} loading={loading} />
          </Modal>
        )}
        {modal === 'expense' && (
          <Modal onClose={closeModal} title="Add Expense">
            <ExpenseForm onSubmit={handleAddExpense} onCancel={closeModal} loading={loading} />
          </Modal>
        )}
        {modal === 'stock' && (
          <Modal onClose={closeModal} title="Request Stock">
            <QuickAddForm type="stock" onSubmit={handleAddStockRequest} onCancel={closeModal} loading={loading} />
          </Modal>
        )}
        {modal === 'transport' && (
          <Modal onClose={closeModal} title="Add Transport">
            <TransportForm onSubmit={handleAddTransport} onCancel={closeModal} loading={loading} />
          </Modal>
        )}

        {/* Shop Profile */}
        <div className={`rounded-2xl overflow-hidden ${
          isDark 
            ? 'bg-slate-800/50 border border-slate-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <ShopProfile />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Sales Section */}
          <div className={`rounded-2xl overflow-hidden ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className={`px-6 py-4 border-b ${
              isDark ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className={`text-lg font-bold ${
                  isDark ? 'text-slate-200' : 'text-gray-900'
                }`}>
                  Sales Overview
                </h2>
              </div>
            </div>
            <SalesTable branchOwnerId={branchOwnerId} />
          </div>

          {/* Expenses Section */}
          <div className={`rounded-2xl overflow-hidden ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className={`px-6 py-4 border-b ${
              isDark ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className={`text-lg font-bold ${
                  isDark ? 'text-slate-200' : 'text-gray-900'
                }`}>
                  Expenses
                </h2>
              </div>
            </div>
            <ExpensesTable branchOwnerId={branchOwnerId} />
          </div>

          {/* Stock Requests Section */}
          <div className={`rounded-2xl overflow-hidden ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className={`px-6 py-4 border-b ${
              isDark ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h2 className={`text-lg font-bold ${
                  isDark ? 'text-slate-200' : 'text-gray-900'
                }`}>
                  Stock Requests
                </h2>
              </div>
            </div>
            <StockRequestsTable branchOwnerId={branchOwnerId} />
          </div>

          {/* Transport Section */}
          <div className={`rounded-2xl overflow-hidden ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className={`px-6 py-4 border-b ${
              isDark ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h2 className={`text-lg font-bold ${
                  isDark ? 'text-slate-200' : 'text-gray-900'
                }`}>
                  Transport
                </h2>
              </div>
            </div>
            <TransportTable branchOwnerId={branchOwnerId} />
          </div>
        </div>

        {/* Reports Section */}
        <div className={`rounded-2xl overflow-hidden ${
          isDark 
            ? 'bg-slate-800/50 border border-slate-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className={`px-6 py-4 border-b ${
            isDark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h2 className={`text-lg font-bold ${
                isDark ? 'text-slate-200' : 'text-gray-900'
              }`}>
                Reports & Analytics
              </h2>
            </div>
          </div>
          <ReportsPanel branchOwnerId={branchOwnerId} />
        </div>

        {/* Daily Store Images */}
        <div className={`rounded-2xl overflow-hidden ${
          isDark 
            ? 'bg-slate-800/50 border border-slate-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className={`px-6 py-4 border-b ${
            isDark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className={`text-lg font-bold ${
                isDark ? 'text-slate-200' : 'text-gray-900'
              }`}>
                Daily Store Photos
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                    Loading images...
                  </p>
                </div>
              </div>
            ) : isError ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-500 font-medium">{message}</p>
              </div>
            ) : dailyStoreImages && dailyStoreImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyStoreImages.map((img) => (
                  <div
                    key={img._id}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer ${
                      isDark 
                        ? 'bg-slate-700 border border-slate-600' 
                        : 'bg-gray-50 border border-gray-200'
                    } hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={`http://localhost:5000/${img.img}`}
                        alt="Daily Store"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                          {new Date(img.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-2 shadow-lg">
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className={`font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-800'}`}>
                  No Photos Yet
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  Upload your first daily store photo to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={`http://localhost:5000/${selectedImage.img}`}
                alt="Daily Store Preview"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="mt-4 text-center text-white">
                <p className="text-sm">
                  {new Date(selectedImage.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchDashboard;