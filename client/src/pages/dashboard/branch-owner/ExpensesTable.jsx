import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { getExpenses } from '../../../store/slices/expensesSlice';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const ExpensesTable = ({ branchOwnerId }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { expenses, loading, error } = useSelector((state) => state.expenses);

  // Pagination & Filtering States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const categories = ['Rent', 'Utilities', 'Supplies', 'Salaries', 'Maintenance', 'Marketing', 'Transportation', 'Other'];

  useEffect(() => {
    dispatch(getExpenses({ branchOwnerId }));
  }, [dispatch, branchOwnerId]);

  // Filter and search
  const filteredExpenses = expenses ? expenses.filter(expense => {
    const matchesSearch = 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  // Sort
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    if (sortConfig.key === 'category') {
      return sortConfig.direction === 'asc' 
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedExpenses.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentExpenses = sortedExpenses.slice(startIndex, endIndex);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/expenses/${selectedExpense._id}`);
      await dispatch(getExpenses({ branchOwnerId }));
      toast.success('Expense deleted successfully!');
      setShowDeleteConfirm(false);
      setSelectedExpense(null);
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
      'Rent': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', darkBg: 'bg-blue-500/20', darkText: 'text-blue-400', darkBorder: 'border-blue-500/30' },
      'Utilities': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', darkBg: 'bg-yellow-500/20', darkText: 'text-yellow-400', darkBorder: 'border-yellow-500/30' },
      'Supplies': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', darkBg: 'bg-purple-500/20', darkText: 'text-purple-400', darkBorder: 'border-purple-500/30' },
      'Salaries': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', darkBg: 'bg-green-500/20', darkText: 'text-green-400', darkBorder: 'border-green-500/30' },
      'Maintenance': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', darkBg: 'bg-orange-500/20', darkText: 'text-orange-400', darkBorder: 'border-orange-500/30' },
      'Marketing': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', darkBg: 'bg-pink-500/20', darkText: 'text-pink-400', darkBorder: 'border-pink-500/30' },
      'Transportation': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', darkBg: 'bg-indigo-500/20', darkText: 'text-indigo-400', darkBorder: 'border-indigo-500/30' },
      'Other': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', darkBg: 'bg-gray-500/20', darkText: 'text-gray-400', darkBorder: 'border-gray-500/30' }
    };
    return colors[category] || colors['Other'];
  };

  // Calculate total
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setCurrentPage(1);
  };

  return (
    <>
      <div className={`rounded-2xl overflow-hidden ${
        isDark 
          ? 'bg-slate-800/50 border border-slate-700' 
          : 'bg-white border border-gray-200'
      } shadow-xl`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDark ? 'border-slate-700 bg-slate-800/70' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${
              isDark ? 'text-slate-200' : 'text-gray-900'
            }`}>
              <span className="text-xl">💳</span>
              Expenses List
              <span className={`text-sm font-normal ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                ({sortedExpenses.length} total)
              </span>
            </h2>
            <div className={`px-4 py-2 rounded-xl ${
              isDark ? 'bg-rose-500/20 border border-rose-500/30' : 'bg-rose-50 border border-rose-200'
            }`}>
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">Total Expenses</div>
              <div className={`text-xl font-bold ${
                isDark ? 'text-rose-400' : 'text-rose-600'
              }`}>
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`px-6 py-4 border-b ${
          isDark ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-slate-400' : 'text-gray-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by description or category..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  }`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              }`}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryIcon(cat)} {cat}
                </option>
              ))}
            </select>

            {/* Rows Per Page */}
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              }`}
            >
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || filterCategory) && (
              <button
                onClick={clearFilters}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                  isDark 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
                <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                  Loading expenses...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-500 font-medium mb-2">{error}</p>
              <button
                onClick={() => dispatch(getExpenses({ branchOwnerId }))}
                className="text-rose-600 hover:text-rose-700 font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          ) : currentExpenses.length > 0 ? (
            <table className="w-full">
              <thead className={isDark ? 'bg-slate-700/50' : 'bg-gray-50'}>
                <tr>
                  <th 
                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors ${
                      isDark ? 'text-slate-300 hover:bg-slate-600/30' : 'text-gray-700 hover:bg-gray-100'
                    }`} 
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Date
                      {sortConfig.key === 'date' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortConfig.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors ${
                      isDark ? 'text-slate-300 hover:bg-slate-600/30' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Category
                      {sortConfig.key === 'category' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortConfig.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className={`px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-opacity-80 transition-colors ${
                      isDark ? 'text-slate-300 hover:bg-slate-600/30' : 'text-gray-700 hover:bg-gray-100'
                    }`} 
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Amount
                      {sortConfig.key === 'amount' && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortConfig.direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </div>
                  </th>
                  <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-200'}`}>
                {currentExpenses.map((expense, index) => {
                  const colors = getCategoryColor(expense.category);
                  return (
                    <tr 
                      key={expense._id || index} 
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDark ? 'text-slate-300' : 'text-gray-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <div className="text-sm font-medium">
                              {new Date(expense.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                              {new Date(expense.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
                          isDark 
                            ? `${colors.darkBg} ${colors.darkText} ${colors.darkBorder}` 
                            : `${colors.bg} ${colors.text} ${colors.border}`
                        }`}>
                          <span className="text-base">{getCategoryIcon(expense.category)}</span>
                          {expense.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right ${
                        isDark ? 'text-rose-400' : 'text-rose-600'
                      }`}>
                        <div className="text-base font-bold">
                          ₹{expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        <div className="max-w-md">
                          <p className="text-sm line-clamp-2">
                            {expense.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowDeleteConfirm(true);
                          }}
                          className={`p-2 rounded-lg transition-all ${
                            isDark 
                              ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300' 
                              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                          title="Delete expense"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                isDark ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                <svg className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className={`font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-800'}`}>
                No Expenses Found
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {searchTerm || filterCategory 
                  ? 'No expenses match your search criteria' 
                  : 'Start by adding your first expense'}
              </p>
              {(searchTerm || filterCategory) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-rose-600 hover:text-rose-700 font-medium text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && currentExpenses.length > 0 && (
          <div className={`px-6 py-4 border-t ${
            isDark ? 'border-slate-700 bg-slate-800/30' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Info */}
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(endIndex, sortedExpenses.length)}</span> of{' '}
                <span className="font-semibold">{sortedExpenses.length}</span> expenses
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? isDark ? 'text-slate-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                      : isDark 
                        ? 'text-slate-300 hover:bg-slate-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="First page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? isDark ? 'text-slate-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                      : isDark 
                        ? 'text-slate-300 hover:bg-slate-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[40px] h-10 rounded-lg font-semibold transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30'
                            : isDark
                              ? 'text-slate-300 hover:bg-slate-700'
                              : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? isDark ? 'text-slate-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                      : isDark 
                        ? 'text-slate-300 hover:bg-slate-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Next page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? isDark ? 'text-slate-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                      : isDark 
                        ? 'text-slate-300 hover:bg-slate-700' 
                        : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Last page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedExpense && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => !deleteLoading && setShowDeleteConfirm(false)}
        >
          <div 
            className={`relative max-w-md w-full rounded-2xl shadow-2xl ${
              isDark 
                ? 'bg-slate-800 border border-slate-700' 
                : 'bg-white'
            } animate-scaleIn`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${
              isDark ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${
                    isDark ? 'text-slate-200' : 'text-gray-900'
                  }`}>
                    Delete Expense
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className={`p-4 rounded-xl mb-4 ${
                isDark ? 'bg-slate-700/50 border border-slate-600' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Date:
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                      {new Date(selectedExpense.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Category:
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                      {getCategoryIcon(selectedExpense.category)} {selectedExpense.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Amount:
                    </span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      ₹{selectedExpense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-600/30 dark:border-slate-500/30">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Description:
                    </span>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                      {selectedExpense.description}
                    </p>
                  </div>
                </div>
              </div>

              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Are you sure you want to delete this expense? This will permanently remove it from your records.
              </p>
            </div>

            {/* Actions */}
            <div className={`px-6 py-4 border-t ${
              isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedExpense(null);
                  }}
                  disabled={deleteLoading}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                    isDark 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
                >
                  {deleteLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Expense
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default ExpensesTable;