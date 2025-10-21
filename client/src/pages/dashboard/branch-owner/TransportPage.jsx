// TransportPage.jsx - Updated to match StockRequestsPage pattern
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TransportTable from './TransportTable';
import { useTheme } from '../../../context/ThemeContext';
import { getTransportsByBranch } from '../../../store/slices/transportSlice';
import { Truck } from 'lucide-react';

const TransportPage = () => {
  const location = useLocation();
  const { branchOwnerId } = location.state || {};
  const dispatch = useDispatch();
  const { transport: transports, totalItems, loading, error } = useSelector((state) => state.transport);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    if (branchOwnerId) {
      dispatch(getTransportsByBranch({ branchId: branchOwnerId, page: 1, limit: 10 }));
    }
  }, [branchOwnerId, dispatch, refreshTable]);

  const handleTransportAdded = () => {
    setRefreshTable(prev => prev + 1);
  };

  if (loading && !transports.length) {
    return <div className="text-center text-white">Loading transports...</div>;
  }

  if (error && !transports.length) {
    return <div className="text-center text-red-500">Error: {error.message}</div>;
  }

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
              key={refreshTable}
              branchOwnerId={branchOwnerId}
              transports={transports}
              totalItems={totalItems}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportPage;