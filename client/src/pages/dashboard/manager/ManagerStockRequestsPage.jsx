// client/src/pages/dashboard/manager/ManagerStockRequestsPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getStockRequestsByManager } from '../../../store/slices/stockRequestsSlice';
import ManagerStockRequestsTable from './ManagerStockRequestsTable';

const ManagerStockRequestsPage = () => {
  const { managerId } = useParams();
  const dispatch = useDispatch();
  const { stockRequests, loading, error } = useSelector((state) => state.stockRequests);
  
  console.log('ManagerStockRequestsPage - Redux State:', { stockRequests, loading, error });

  const memoizedFilters = useMemo(() => ({}), []);

  useEffect(() => {
    if (managerId) {
      console.log("Dispatching getStockRequestsByManager for managerId:", managerId);
      dispatch(getStockRequestsByManager({ managerId, filters: memoizedFilters }));
    }
  }, [managerId, dispatch, memoizedFilters]); // REMOVE stockRequests from dependencies

  // Add safe data handling
  const safeStockRequests = useMemo(() => {
    return Array.isArray(stockRequests) ? stockRequests : [];
  }, [stockRequests]);

  // Add summary statistics
  const stats = useMemo(() => {
    if (!safeStockRequests || safeStockRequests.length === 0) {
      return { total: 0, approved: 0, pending: 0, urgent: 0 };
    }

    return {
      total: safeStockRequests.length,
      approved: safeStockRequests.filter(req => req.approved).length,
      pending: safeStockRequests.filter(req => !req.approved).length,
      urgent: safeStockRequests.filter(req => req.priority === 'Urgent').length
    };
  }, [safeStockRequests]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Stock Requests Overview</h1>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-600">Read Only Access</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Requests</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Approved</div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Urgent</div>
          <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
        </div>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800">
            Debug: {safeStockRequests.length} requests loaded
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <ManagerStockRequestsTable
          stockRequests={safeStockRequests}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default ManagerStockRequestsPage;