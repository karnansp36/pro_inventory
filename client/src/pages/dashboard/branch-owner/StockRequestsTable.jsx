// ============================================
// 3. StockRequestsTable.jsx - Table Component
// ============================================

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { getStockRequests } from '../../../store/slices/stockRequestsSlice';

const StockRequestsTable = ({ branchOwnerId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dispatch = useDispatch();
  const { stockRequests, loading, error } = useSelector((state) => state.stockRequests);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(getStockRequests({ branchOwnerId }));
  }, [dispatch, branchOwnerId]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = stockRequests?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((stockRequests?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  const getStatusStyles = (status) => {
    const lightStyles = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Approved: 'bg-green-100 text-green-800 border-green-200',
      Processing: 'bg-blue-100 text-blue-800 border-blue-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
      Completed: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    const darkStyles = {
      Pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      Approved: 'bg-green-900/30 text-green-300 border-green-700',
      Processing: 'bg-blue-900/30 text-blue-300 border-blue-700',
      Rejected: 'bg-red-900/30 text-red-300 border-red-700',
      Completed: 'bg-purple-900/30 text-purple-300 border-purple-700'
    };
    const styles = isDark ? darkStyles : lightStyles;
    return styles[status] || (isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200');
  };

  const getPriorityStyles = (priority) => {
    const lightStyles = {
      Urgent: 'bg-red-100 text-red-700 border-red-200',
      Required: 'bg-orange-100 text-orange-700 border-orange-200',
      Normal: 'bg-green-100 text-green-700 border-green-200'
    };
    const darkStyles = {
      Urgent: 'bg-red-900/30 text-red-300 border-red-700',
      Required: 'bg-orange-900/30 text-orange-300 border-orange-700',
      Normal: 'bg-green-900/30 text-green-300 border-green-700'
    };
    const styles = isDark ? darkStyles : lightStyles;
    return styles[priority] || (isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200');
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      Urgent: '🚨',
      Required: '⚠️',
      Normal: '✅'
    };
    return icons[priority] || '📦';
  };

  return (
    <div className={`rounded-2xl shadow-lg overflow-hidden ${
      isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
    }`}>
      {/* Table Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Request History
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {stockRequests?.length || 0} total requests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading requests...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : stockRequests && stockRequests.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDark ? 'bg-slate-700/30' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Product
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quantity
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Priority
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-200'}`}>
              {currentItems.map((request, i) => (
                <tr 
                  key={request._id || i}
                  className={`transition-colors duration-150 ${
                    isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(request.createdAt || request.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <span className="text-sm">📦</span>
                      </div>
                      <span className="font-medium">{request.productName}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <span className="font-semibold">{request.quantity}</span>
                    <span className={`text-xs ml-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>units</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                      getPriorityStyles(request.priority)
                    }`}>
                      <span>{getPriorityIcon(request.priority)}</span>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      getStatusStyles(request.status)
                    }`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <svg className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className={`text-lg font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              No stock requests yet
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Create your first stock request to get started
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {stockRequests && stockRequests.length > 0 && (
        <div className={`px-6 py-4 border-t ${
          isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Show
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-all duration-200 ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                entries
              </span>
            </div>

            {/* Page info */}
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, stockRequests.length)} of {stockRequests.length} requests
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === 1
                    ? isDark 
                      ? 'bg-slate-700/50 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage = 
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                  
                  const showEllipsis = 
                    (pageNum === currentPage - 2 && currentPage > 3) ||
                    (pageNum === currentPage + 2 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span 
                        key={pageNum}
                        className={`px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : isDark
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === totalPages
                    ? isDark 
                      ? 'bg-slate-700/50 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockRequestsTable;