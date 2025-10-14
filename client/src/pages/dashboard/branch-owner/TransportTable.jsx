// ============================================
// TransportTable.jsx - Redesigned Table Component with Pagination
// ============================================

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTransports } from '../../../store/slices/transportSlice';
import { useTheme } from '../../../context/ThemeContext';

const TransportTable = ({ branchOwnerId }) => {
  const dispatch = useDispatch();
  const { transport, loading, error } = useSelector((state) => state.transport);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(getTransports({ branchOwnerId }));
  }, [dispatch, branchOwnerId]);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [transport]);

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'delivered' || statusLower === 'completed') {
      return isDark 
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (statusLower === 'pending' || statusLower === 'in transit') {
      return isDark
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        : 'bg-amber-100 text-amber-700 border-amber-200';
    }
    if (statusLower === 'cancelled' || statusLower === 'rejected') {
      return isDark
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : 'bg-red-100 text-red-700 border-red-200';
    }
    return isDark
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  // Pagination calculations
  const totalItems = transport?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = transport?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (loading) {
    return (
      <div className={`rounded-2xl p-8 ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      } shadow-xl`}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className={`mt-4 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Loading transport records...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-6 ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      } shadow-xl`}>
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden ${
      isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
    } shadow-xl`}>
      {/* Table Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Transport Receipts
          </h2>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
            }`}>
              {totalItems} Records
            </span>
            <div className="flex items-center gap-2">
              <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Show:
              </label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' 
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {currentData && currentData.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'bg-slate-700/50' : 'bg-gray-100'}>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  From
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  To
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Sent Qty
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Received Qty
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {currentData.map((t, i) => (
                <tr 
                  key={t._id || i}
                  className={`transition-colors duration-150 ${
                    isDark 
                      ? 'hover:bg-slate-700/50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(t.createdAt || t.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.from}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.to}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {t.quantity}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    {t.receivedQuantity ? (
                      <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {t.receivedQuantity}
                      </span>
                    ) : (
                      <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      getStatusColor(t.status)
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className={`p-4 rounded-full mb-4 ${
              isDark ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <svg className={`w-12 h-12 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
              No Transport Records
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              There are no transport records to display at this time.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className={`px-6 py-4 border-t ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results info */}
            <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> of{' '}
              <span className="font-semibold">{totalItems}</span> results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === 1
                    ? isDark
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, idx) => (
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className={`px-3 py-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? isDark
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-emerald-600 text-white shadow-lg'
                          : isDark
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === totalPages
                    ? isDark
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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

export default TransportTable;