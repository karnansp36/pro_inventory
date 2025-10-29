// ============================================
// 1. AdminStock.jsx - Main Page Component
// ============================================

import React, { useState, useEffect } from 'react';
import { useLocation, useOutletContext, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import ManagerStockTable from './AdminStockTable';
import { getStockRequestsByBranch } from '../../../store/slices/stockRequestsSlice';

const AdminStock = () => {
  const { branchId } = useParams(); // Get branchId from URL params
  const branchOwnerId = branchId; // Use branchId from URL params
  const dispatch = useDispatch();
  const { stockRequests, loading, error } = useSelector((state) => state.stockRequests);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [refreshTable, setRefreshTable] = useState(0);

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
                View stock inventory requests (Read Only)
              </p>
            </div>
          </div>
        </div>

        {/* Content - Only Table */}
        <div>
          <ManagerStockTable 
            key={refreshTable} 
            branchOwnerId={branchOwnerId} 
          />
        </div>
      </div>
    </div>
  );
};

export default AdminStock;