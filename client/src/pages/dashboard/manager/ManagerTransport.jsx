// TransportPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ManagerTransportTable from './ManagerTransportTable';
import { useTheme } from '../../../context/ThemeContext';
import { getTransportsByBranch } from '../../../store/slices/transportSlice';
import { Truck, X, Plus } from 'lucide-react';
import TransportForm from '../../../components/forms/TransportForm';

const ManagerTransport = () => {
  const location = useLocation();
  const { branchOwnerId } = location.state || {};
  const dispatch = useDispatch();
  const { transport: transports, totalItems, loading, error } = useSelector((state) => state.transport);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [refreshTable, setRefreshTable] = useState(0);
  const [showForm, setShowForm] = useState(false);


  const handleTransportAdded = () => {
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
              <button
                onClick={() => setShowForm(!showForm)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  showForm
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white text-emerald-600 hover:bg-gray-50 shadow-lg'
                }`}
              >
                {showForm ? (
                  <>
                    <X className="w-5 h-5" />
                    Close Form
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Transport
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`grid grid-cols-1 ${showForm ? 'lg:grid-cols-3' : ''} gap-6`}>
          {/* Form - Conditional */}
          {showForm && (
            <div className="lg:col-span-1">
              <div className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
                isDark
                  ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-slate-700/50'
                  : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <TransportForm
                  onClose={handleTransportAdded}
                  branchOwnerId={branchOwnerId}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className={showForm ? 'lg:col-span-2' : ''}>
            <ManagerTransportTable
              key={refreshTable}
              branchOwnerId={branchOwnerId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerTransport;