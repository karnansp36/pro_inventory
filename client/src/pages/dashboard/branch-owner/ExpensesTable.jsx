import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { getExpensesByBranch, deleteExpense } from '../../../store/slices/expensesSlice';
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
  ChevronsRight,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const ExpensesTable = ({ branchOwnerId }) => {
  const dispatch = useDispatch();
  const { expenses, totalItems, loading, error } = useSelector((state) => state.expenses);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { theme } = useTheme();

  const categories = ['Rent', 'Utilities', 'Supplies', 'Salaries', 'Maintenance', 'Marketing', 'Transportation', 'Other'];

  useEffect(() => {
    if (branchOwnerId) {
      dispatch(getExpensesByBranch({ branchId: branchOwnerId, page: currentPage, limit: itemsPerPage }));
    }
  }, [dispatch, branchOwnerId, currentPage, itemsPerPage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Server-side pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    
    setDeleteLoading(true);
    try {
      await dispatch(deleteExpense(selectedExpense._id)).unwrap();
      toast.success('Expense deleted successfully!');
      setShowDeleteConfirm(false);
      setSelectedExpense(null);
      
      // Refresh the current page or go to previous page if current page becomes empty
      if (expenses.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        dispatch(getExpensesByBranch({ branchId: branchOwnerId, page: currentPage, limit: itemsPerPage }));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Rent': '🏠',
      'Utilities': '💡',
      'Supplies': '📦',
      'Salaries': '💰',
      'Maintenance': '🔧',
      'Marketing': '📢',
      'Transportation': '🚗',
      'Other': '📋'
    };
    return icons[category] || '📋';
  };

  const getCategoryColor = (category) => {
    const colors = {
      dark: {
        'Rent': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Utilities': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Supplies': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Salaries': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Maintenance': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Marketing': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        'Transportation': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        'Other': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      },
      light: {
        'Rent': 'bg-blue-100 text-blue-700 border-blue-200',
        'Utilities': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Supplies': 'bg-purple-100 text-purple-700 border-purple-200',
        'Salaries': 'bg-green-100 text-green-700 border-green-200',
        'Maintenance': 'bg-orange-100 text-orange-700 border-orange-200',
        'Marketing': 'bg-pink-100 text-pink-700 border-pink-200',
        'Transportation': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Other': 'bg-gray-100 text-gray-700 border-gray-200'
      }
    };
    
    return colors[theme][category] || colors[theme]['Other'];
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

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

  if (loading && expenses.length === 0) {
    return (
      <div className={`rounded-xl p-8 transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
          : 'bg-white border border-gray-200 shadow-lg'
      }`}>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className={`w-12 h-12 animate-spin mb-4 ${
            theme === 'dark' ? 'text-rose-400' : 'text-rose-600'
          }`} />
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading expenses data...
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
                ? 'bg-rose-500/20 border border-rose-500/30'
                : 'bg-rose-50 border border-rose-200'
            }`}>
              <CreditCard className={`w-5 h-5 ${
                theme === 'dark' ? 'text-rose-400' : 'text-rose-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Expenses Overview
              </h2>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {totalItems} expense{totalItems !== 1 ? 's' : ''} total
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
                  ? 'bg-rose-500/20'
                  : 'bg-rose-100'
              }`}>
                <DollarSign className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-rose-400' : 'text-rose-600'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Expenses
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-rose-400' : 'text-rose-600'
                }`}>
                  ₹{getTotalExpenses().toLocaleString('en-IN')}
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
                  {totalItems}
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
                <Receipt className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Avg. Expense
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ₹{expenses.length > 0 ? (getTotalExpenses() / expenses.length).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
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
                Category
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Description
              </th>
              <th className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount
                </div>
              </th>
              <th className={`px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            theme === 'dark' ? 'divide-slate-700/50' : 'divide-gray-200'
          }`}>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Receipt className={`w-12 h-12 mb-3 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No expenses records found
                    </p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Expense transactions will appear here
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((expense, i) => (
                <tr 
                  key={expense._id || i} 
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
                        theme === 'dark' ? 'bg-rose-400' : 'bg-rose-500'
                      }`} />
                      <span className="text-sm font-medium">
                        {expense.date ? new Date(expense.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                    <div className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {expense.date ? new Date(expense.date).toLocaleDateString('en-US', { weekday: 'short' }) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
                      getCategoryColor(expense.category)
                    }`}>
                      <span className="text-base">{getCategoryIcon(expense.category)}</span>
                      {expense.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="max-w-md">
                      <p className="text-sm line-clamp-2">
                        {expense.description || 'No description'}
                      </p>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right ${
                    theme === 'dark' ? 'text-rose-400' : 'text-rose-600'
                  }`}>
                    <div className="text-base font-bold">
                      ₹{expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => {
                        setSelectedExpense(expense);
                        setShowDeleteConfirm(true);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300'
                          : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {expenses.length > 0 && (
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
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-gray-300 focus:border-rose-500'
                  : 'bg-white border-gray-300 text-gray-700 focus:border-rose-500'
              } focus:outline-none focus:ring-2 focus:ring-rose-500/20`}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>

          {/* Right side - Pagination controls */}
          <div className="flex items-center gap-2">
            {/* First Page */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? theme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? theme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? theme === 'dark'
                        ? 'bg-rose-500 text-white'
                        : 'bg-rose-600 text-white'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  } ${page === '...' ? 'cursor-default' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next Page */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? theme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? theme === 'dark'
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200 shadow-xl'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${
                theme === 'dark'
                  ? 'bg-red-500/20'
                  : 'bg-red-100'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Delete Expense
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className={`mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Are you sure you want to delete this expense record? This will permanently remove the expense data.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedExpense(null);
                }}
                disabled={deleteLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:bg-slate-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                  deleteLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleteLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Expense'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTable;