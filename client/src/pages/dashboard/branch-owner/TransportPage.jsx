// ============================================
// TransportPage.jsx - Main Page Component
// ============================================

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import TransportTable from './TransportTable';

const TransportPage = () => {
  const { branchOwnerId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl p-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Transport Management
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Confirm received quantities and track shipments
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Live Tracking</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <TransportTable branchOwnerId={branchOwnerId} />
      </div>
    </div>
  );
};

export default TransportPage;