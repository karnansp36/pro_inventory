// ============================================
// 1. StockRequestsPage.jsx - Main Page Component
// ============================================

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import StockRequestForm from './StockRequestForm';
import StockRequestsTable from './StockRequestsTable';

const StockRequestsPage = () => {
  const { branchOwnerId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [refreshTable, setRefreshTable] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleRequestAdded = () => {
    setRefreshTable(prev => prev + 1);
    setShowForm(false);
  };

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Stock Requests
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Request and track stock inventory from headquarters
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
                  New Request
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`grid grid-cols-1 ${showForm ? 'lg:grid-cols-3' : ''} gap-6`}>
          {/* Form - Conditional */}
          {showForm && (
            <div className="lg:col-span-1">
              <StockRequestForm 
                onRequestAdded={handleRequestAdded} 
                branchOwnerId={branchOwnerId}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
          
          {/* Table */}
          <div className={showForm ? 'lg:col-span-2' : ''}>
            <StockRequestsTable 
              key={refreshTable} 
              branchOwnerId={branchOwnerId} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRequestsPage;