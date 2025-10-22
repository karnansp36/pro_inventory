// client/src/pages/dashboard/manager/ManagerTransportPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTransportsByManager } from '../../../store/slices/transportSlice';
import ManagerTransportTable from './ManagerTransportTable';

const ManagerTransportPage = () => {
  const { managerId } = useParams();
  const dispatch = useDispatch();
  const { transport: transports, loading, error, totalItems, currentPage, totalPages } = useSelector((state) => state.transport);
  
  console.log('ManagerTransportPage - Redux State:', { transports, loading, error, totalItems, currentPage, totalPages });

  const memoizedFilters = useMemo(() => ({}), []);

  useEffect(() => {
    if (managerId) {
      console.log("Dispatching getTransportsByManager for managerId:", managerId);
      dispatch(getTransportsByManager({ 
        managerId, 
        filters: memoizedFilters,
        page: 1,
        limit: 10
      }));
    }
  }, [managerId, dispatch, memoizedFilters]);

  // Add safe data handling
  const safeTransports = useMemo(() => {
    return Array.isArray(transports) ? transports : [];
  }, [transports]);

  // Add summary statistics
  const stats = useMemo(() => {
    if (!safeTransports || safeTransports.length === 0) {
      return { total: 0, completed: 0, pending: 0, partial: 0 };
    }

    return {
      total: safeTransports.length,
      completed: safeTransports.filter(t => t.receivedQuantity === t.quantity).length,
      pending: safeTransports.filter(t => !t.receivedQuantity || t.receivedQuantity === 0).length,
      partial: safeTransports.filter(t => t.receivedQuantity > 0 && t.receivedQuantity < t.quantity).length
    };
  }, [safeTransports]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Transport Overview
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Monitor and track transport status across all assigned branches
              </p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-white text-sm font-medium">Read Only Access</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Total Transports</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Partial</div>
            <div className="text-2xl font-bold text-blue-600">{stats.partial}</div>
          </div>
        </div>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-800">
              Debug: {safeTransports.length} transports loaded (Page {currentPage} of {totalPages}, Total: {totalItems})
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
          <ManagerTransportTable
            transports={safeTransports}
            loading={loading}
            error={error}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            managerId={managerId}
          />
        </div>
      </div>
    </div>
  );
};

export default ManagerTransportPage;