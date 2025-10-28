// TransportPage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { Truck } from 'lucide-react';
import TransportTable from './TransportTable';

const TransportPage = () => {
  const location = useLocation();
  const { branchOwnerId } = location.state || {};
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
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Transport Management
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Confirm received quantities and track shipments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Live Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6">
          {/* Table */}
          <div>
            <TransportTable
              branchOwnerId={branchOwnerId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportPage;