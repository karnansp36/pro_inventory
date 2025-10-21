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
  AlertTriangle,
  X
} from 'lucide-react';

const ExpensesTable = ({ branchOwnerId }) => {
  const dispatch = useDispatch();
  const { expenses, totalItems, loading, error } = useSelector((state) => state.expenses);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    type: 'all', // 'all', 'today', 'week', 'month', 'custom'
    startDate: '',
    endDate: ''
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { theme } = useTheme();

  const categories = ['Rent', 'Utilities', 'Supplies', 'Salaries', 'Maintenance', 'Marketing', 'Transportation', 'Other'];

  // Filter expenses based on search, date, and category filters
  const filteredExpenses = expenses.filter(expense => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.category?.toLowerCase().includes(searchLower) ||
        expense.amount?.toString().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) {
      return false;
    }

    // Date filter
    if (dateFilter.type !== 'all') {
      const expenseDate = new Date(expense.date);
      const today = new Date();
      
      switch (dateFilter.type) {
        case 'today':
          return expenseDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return expenseDate >= weekAgo && expenseDate <= today;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return expenseDate >= monthAgo && expenseDate <= today;
        case 'custom':
          if (dateFilter.startDate && dateFilter.endDate) {
            const start = new Date(dateFilter.startDate);
            const end = new Date(dateFilter.endDate);
            end.setHours(23, 59, 59, 999); // Include entire end date
            return expenseDate >= start && expenseDate <= end;
          }
          return true;
        default:
          return true;
      }
    }

    return true;
  });

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
    return filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
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

  // CSV Export Function
  const downloadCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Enhanced CSV formatting with proper escaping
      const escapeCSV = (field) => {
        if (field === null || field === undefined) return '""';
        const stringField = String(field);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      // CSV headers
      const headers = [
        'Date',
        'Category',
        'Description',
        'Amount (₹)',
        'Transaction ID',
        'Branch ID',
        'Created At'
      ];

      // Convert expenses data to CSV rows
      const csvRows = filteredExpenses.map(expense => [
        escapeCSV(expense.date ? new Date(expense.date).toLocaleDateString('en-US') : 'N/A'),
        escapeCSV(expense.category || 'Unknown'),
        escapeCSV(expense.description || 'No description'),
        escapeCSV(expense.amount?.toFixed(2) || '0.00'),
        escapeCSV(expense._id || 'N/A'),
        escapeCSV(expense.branchId || branchOwnerId || 'N/A'),
        escapeCSV(new Date(expense.createdAt || expense.date).toISOString())
      ]);

      // Build CSV content
      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary section if there are filters applied
      if (dateFilter.type !== 'all' || searchTerm || categoryFilter !== 'all') {
        csvContent.push(''); // Empty line
        csvContent.push('Summary');
        csvContent.push(`Total Records,${filteredExpenses.length}`);
        csvContent.push(`Total Amount,₹${getTotalExpenses().toFixed(2)}`);
        csvContent.push(`Average Expense,₹${filteredExpenses.length > 0 ? (getTotalExpenses() / filteredExpenses.length).toFixed(2) : '0.00'}`);
        
        if (dateFilter.type !== 'all') {
          csvContent.push(`Date Filter,${dateFilter.type}`);
          if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
            csvContent.push(`Start Date,${dateFilter.startDate}`);
            csvContent.push(`End Date,${dateFilter.endDate}`);
          }
        }
        
        if (categoryFilter !== 'all') {
          csvContent.push(`Category Filter,${categoryFilter}`);
        }
        
        if (searchTerm) {
          csvContent.push(`Search Term,${searchTerm}`);
        }
        
        csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);
      }

      // Create blob and download
      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Create filename with date and branch info
      const date = new Date().toISOString().split('T')[0];
      const filename = `expenses-data-${branchOwnerId || 'branch'}-${date}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL object
      URL.revokeObjectURL(url);
      
      toast.success('CSV file downloaded successfully!');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV file');
    }
  };

  // Apply quick date filter
  const applyQuickDateFilter = (type) => {
    const today = new Date();
    let startDate = new Date();
    
    switch (type) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'custom':
        setDateFilter({ type: 'custom', startDate: '', endDate: '' });
        return;
      default:
        setDateFilter({ type: 'all', startDate: '', endDate: '' });
        return;
    }

    setDateFilter({
      type,
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter({ type: 'all', startDate: '', endDate: '' });
    setCategoryFilter('all');
    setShowFilters(false);
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

  const dateFilters = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Last 7 Days' },
    { key: 'month', label: 'Last 30 Days' },
    { key: 'custom', label: 'Custom Range' }
  ];

  const exportFormats = [
    { 
      key: 'csv', 
      label: 'CSV', 
      color: 'bg-blue-500 hover:bg-blue-600',
      handler: downloadCSV
    }
  ];

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
                {filteredExpenses.length} of {totalItems} expense{totalItems !== 1 ? 's' : ''}
                {(dateFilter.type !== 'all' || categoryFilter !== 'all' || searchTerm) && ' (filtered)'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border transition-colors text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-rose-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-rose-500'
                } focus:outline-none focus:ring-2 focus:ring-rose-500/20`}
              />
            </div>

            {/* Filter Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters
                  ? theme === 'dark'
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-500 text-white'
                  : theme === 'dark'
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* Export Button with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={filteredExpenses.length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                } ${filteredExpenses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg border z-50 ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="p-2">
                    <div className={`px-3 py-2 text-xs font-semibold ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Export As
                    </div>
                    {exportFormats.map((format) => (
                      <button
                        key={format.key}
                        onClick={format.handler}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-white font-medium transition-all mb-1 last:mb-0 ${format.color}`}
                      >
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`mt-4 p-4 rounded-lg border ${
            theme === 'dark'
              ? 'bg-slate-700/50 border-slate-600'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Filters
              </h3>
              <button
                onClick={clearFilters}
                className={`text-xs flex items-center gap-1 ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div className="space-y-3">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filters */}
              <div className="space-y-3">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date Range
                </label>
                
                {/* Quick Date Filters */}
                <div className="flex flex-wrap gap-2">
                  {dateFilters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => applyQuickDateFilter(filter.key)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        dateFilter.type === filter.key
                          ? theme === 'dark'
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-500 text-white'
                          : theme === 'dark'
                          ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range */}
                {dateFilter.type === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                        className={`w-full px-3 py-1.5 rounded border text-sm ${
                          theme === 'dark'
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                        className={`w-full px-3 py-1.5 rounded border text-sm ${
                          theme === 'dark'
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
                  {filteredExpenses.length}
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
                  ₹{filteredExpenses.length > 0 ? (getTotalExpenses() / filteredExpenses.length).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
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
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Receipt className={`w-12 h-12 mb-3 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {expenses.length === 0 ? 'No expenses records found' : 'No matching expenses found'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {expenses.length === 0 ? 'Expense transactions will appear here' : 'Try adjusting your filters'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense, i) => (
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
      {filteredExpenses.length > 0 && (
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
              Showing <span className="font-medium">{Math.min(startIndex + 1, filteredExpenses.length)}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, filteredExpenses.length)}</span> of{' '}
              <span className="font-medium">{filteredExpenses.length}</span> entries
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