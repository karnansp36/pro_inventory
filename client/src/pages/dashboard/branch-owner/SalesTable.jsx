// components/branch-owner/SalesTable.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { useTheme } from '../../../context/ThemeContext';
import { 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Receipt,
  TrendingUp,
  Search,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

import salesService from '../../../services/salesService'; // Import salesService

const SalesTable = ({ branchOwnerId, isManagerView, filters, currentPage, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0); // New state for total items
  const { theme } = useTheme();

  useEffect(() => {
    fetchSales();
  }, [branchOwnerId, isManagerView, filters, currentPage, itemsPerPage]); // Add filters, currentPage, itemsPerPage to dependencies

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await salesService.getSales({
        branchId: branchOwnerId || (isManagerView ? filters?.branchId : undefined),
        page: currentPage,
        limit: itemsPerPage,
        ...filters, // Pass other filters
      });
      setSales(response.data.sales); // Assuming API returns { sales: [], totalItems: 0 }
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Error loading sales data');
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations (now based on totalItems from backend)
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + sales.length; // Use sales.length for current page

  const getTotalSales = () => {
    return sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
  };

  const goToFirstPage = () => onPageChange(1);
  const goToLastPage = () => onPageChange(totalPages);
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));

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

  const getPaymentMethodBadge = (method) => {
    const colors = {
      dark: {
        Cash: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        Card: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        UPI: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        Online: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      },
      light: {
        Cash: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Card: 'bg-blue-50 text-blue-700 border-blue-200',
        UPI: 'bg-purple-50 text-purple-700 border-purple-200',
        Online: 'bg-orange-50 text-orange-700 border-orange-200',
      }
    };
    
    return colors[theme][method] || colors[theme].Cash;
  };

  if (loading) {
    return (
      <div className={`rounded-xl p-8 transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
          : 'bg-white border border-gray-200 shadow-lg'
      }`}>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className={`w-12 h-12 animate-spin mb-4 ${
            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
          }`} />
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading sales data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
        : 'bg-white border border-gray-200 shadow-lg'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <Receipt className={`w-5 h-5 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Daily Sales
              </h2>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {sales.length} transaction{sales.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}>
              <Search className="w-4 h-4" />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}>
              <Filter className="w-4 h-4" />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}>
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`px-6 py-4 border-b ${
        theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-slate-900/50 border border-slate-700/50'
              : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-emerald-500/20'
                  : 'bg-emerald-100'
              }`}>
                <DollarSign className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Sales
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  ${getTotalSales().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-slate-900/50 border border-slate-700/50'
              : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-blue-500/20'
                  : 'bg-blue-100'
              }`}>
                <TrendingUp className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Transactions
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {sales.length}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-slate-900/50 border border-slate-700/50'
              : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-purple-500/20'
                  : 'bg-purple-100'
              }`}>
                <CreditCard className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Avg. Sale
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${sales.length > 0 ? (getTotalSales() / sales.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${
              theme === 'dark'
                ? 'bg-slate-900/50 border-b border-slate-700/50'
                : 'bg-gray-50 border-b border-gray-200'
            }`}>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment
                </div>
              </th>
              <th className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            theme === 'dark' ? 'divide-slate-700/50' : 'divide-gray-200'
          }`}>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Receipt className={`w-12 h-12 mb-3 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No sales records found
                    </p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Sales transactions will appear here
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sales.map((sale, i) => (
                <tr
                  key={sale._id || i} // Use _id for unique key if available
                  className={`transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-slate-700/30'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                      }`} />
                      <span className="text-sm font-medium">
                        {new Date(sale.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <span className="text-sm font-semibold">
                      ${sale.amount?.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      getPaymentMethodBadge(sale.paymentMethod)
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-bold ${
                      theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                    }`}>
                      ${sale.amount?.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sales.length > 0 && (
        <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
          theme === 'dark' 
            ? 'border-slate-700/50 bg-slate-900/30' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          {/* Left side - Rows info and per page selector */}
          <div className="flex items-center gap-4">
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> entries
            </div>
            
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-gray-300 focus:border-emerald-500'
                  : 'bg-white border-gray-300 text-gray-700 focus:border-emerald-500'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          {/* Right side - Pagination controls */}
          <div className="flex items-center gap-2">
            {/* First page button */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 1
                  ? theme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous page button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 1
                  ? theme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className={`px-3 py-1.5 text-sm ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? theme === 'dark'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-emerald-500 text-white shadow-sm'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>

            {/* Next page button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all ${
                currentPage === totalPages
                  ? theme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last page button */}
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all ${
                currentPage === totalPages
                  ? theme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTable;