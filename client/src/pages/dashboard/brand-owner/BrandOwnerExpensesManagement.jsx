// client/src/pages/dashboard/brand-owner/BrandOwnerExpensesManagement.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  getExpensesByBrandOwner, 
  deleteExpense, 
  createExpense, 
  updateExpense 
} from '../../../store/slices/expensesSlice';
import { useTheme } from '../../../context/ThemeContext';
import ExpenseForm from '../branch-owner/ExpensesForm';
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
  X,
  Eye,
  Plus,
  Edit
} from 'lucide-react';

const BrandOwnerExpensesManagement = () => {
  const dispatch = useDispatch();
  const { expenses, totalItems, loading, error } = useSelector((state) => state.expenses);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    type: 'all',
    startDate: '',
    endDate: ''
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [branchOwnerFilter, setBranchOwnerFilter] = useState('');

  const categories = ['Rent', 'Utilities', 'Supplies', 'Salaries', 'Maintenance', 'Marketing', 'Transportation', 'Other'];

// In your BrandOwnerExpensesManagement component - Update the useEffect
useEffect(() => {
  if (currentUser?._id) {
    const filters = {
      search: searchTerm || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      branchOwnerName: branchOwnerFilter || undefined,
      dateFilter: dateFilter.type !== 'all' ? JSON.stringify(dateFilter) : undefined
    };

    // Remove undefined values
    const cleanFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        cleanFilters[key] = filters[key];
      }
    });

    dispatch(getExpensesByBrandOwner({ 
      brandOwnerId: currentUser._id, 
      page: currentPage,
      limit: itemsPerPage,
      filters: cleanFilters 
    }));
  }
}, [dispatch, currentUser?._id, currentPage, itemsPerPage, searchTerm, categoryFilter, dateFilter, branchOwnerFilter]);
useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter expenses client-side for additional filtering
  const filteredExpenses = expenses?.filter(expense => {
    // Branch owner filter
    if (branchOwnerFilter && !expense.branchOwner?.name?.toLowerCase().includes(branchOwnerFilter.toLowerCase())) {
      return false;
    }

    // Date filter (client-side for custom ranges)
    if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
      const expenseDate = new Date(expense.date);
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      end.setHours(23, 59, 59, 999);
      
      if (expenseDate < start || expenseDate > end) {
        return false;
      }
    }

    return true;
  }) || [];

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Handlers
  const handleExpenseAdded = () => {
    setShowModal(false);
    setEditExpense(null);
    // Refresh the data
    if (currentUser?._id) {
      dispatch(getExpensesByBrandOwner({ 
        brandOwnerId: currentUser._id, 
        filters: { page: currentPage, limit: itemsPerPage } 
      }));
    }
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setShowModal(true);
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
        if (currentUser?._id) {
          dispatch(getExpensesByBrandOwner({ 
            brandOwnerId: currentUser._id, 
            filters: { page: currentPage, limit: itemsPerPage } 
          }));
        }
      }
    } catch (error) {
      toast.error('Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  // CSV Export Function
  const downloadCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const escapeCSV = (field) => {
        if (field === null || field === undefined) return '""';
        const stringField = String(field);
        if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      const headers = ['Date', 'Branch Owner', 'Category', 'Description', 'Amount (₹)', 'Transaction ID', 'Created At'];

      const csvRows = filteredExpenses.map(expense => {
        return [
          escapeCSV(expense.date ? new Date(expense.date).toLocaleDateString('en-US') : 'N/A'),
          escapeCSV(expense.branchOwner?.name || 'Unknown Branch'),
          escapeCSV(expense.category || 'Unknown'),
          escapeCSV(expense.description || 'No description'),
          escapeCSV(expense.amount?.toFixed(2) || '0.00'),
          escapeCSV(expense._id || 'N/A'),
          escapeCSV(new Date(expense.createdAt || expense.date).toISOString())
        ];
      });

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary section
      if (dateFilter.type !== 'all' || searchTerm || categoryFilter !== 'all' || branchOwnerFilter) {
        csvContent.push('');
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
        
        if (branchOwnerFilter) {
          csvContent.push(`Branch Owner Filter,${branchOwnerFilter}`);
        }
        
        if (searchTerm) {
          csvContent.push(`Search Term,${searchTerm}`);
        }
        
        csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);
        csvContent.push(`View Type,Brand Owner View`);
      }

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `brand-owner-expenses-${currentUser?._id || 'brand'}-${date}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('CSV file downloaded successfully!');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Failed to download CSV file');
    }
  };

  // Utility functions
  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
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
    setBranchOwnerFilter('');
    setShowFilters(false);
  };

  // Pagination controls
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
      <div className="min-h-screen p-6">
        <div className={`rounded-xl p-8 transition-all duration-300 ${
          isDark
            ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className={`w-12 h-12 animate-spin mb-4 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Loading expenses data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl p-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Expenses Management
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Manage expense records for your assigned branches
              </p>
            </div>
            <button
              onClick={() => { setEditExpense(null); setShowModal(true); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-white text-blue-600 hover:bg-gray-50 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b ${
            isDark ? 'border-slate-700/50' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isDark
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <CreditCard className={`w-5 h-5 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    All Branch Expenses
                  </h2>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {filteredExpenses.length} of {totalItems} expense{totalItems !== 1 ? 's' : ''}
                    {(dateFilter.type !== 'all' || categoryFilter !== 'all' || searchTerm || branchOwnerFilter) && ' (filtered)'}
                    {' across all assigned branches'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search expenses across branches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border transition-colors text-sm ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>

                {/* Filter Button */}
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${
                    showFilters
                      ? isDark
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark
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
                      isDark
                        ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    } ${filteredExpenses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Export Dropdown Menu */}
                  {showExportMenu && (
                    <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg border z-50 ${
                      isDark
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className="p-2">
                        <div className={`px-3 py-2 text-xs font-semibold ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
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
                isDark
                  ? 'bg-slate-700/50 border-slate-600'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className={`text-xs flex items-center gap-1 ${
                      isDark 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Branch Owner Filter */}
                  <div className="space-y-3">
                    <label className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Branch Owner
                    </label>
                    <input
                      type="text"
                      placeholder="Filter by branch owner..."
                      value={branchOwnerFilter}
                      onChange={(e) => setBranchOwnerFilter(e.target.value)}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark
                          ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark
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
                      isDark ? 'text-gray-300' : 'text-gray-700'
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
                              ? isDark
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-500 text-white'
                              : isDark
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
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            className={`w-full px-3 py-1.5 rounded border text-sm ${
                              isDark
                                ? 'bg-slate-600 border-slate-500 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            End Date
                          </label>
                          <input
                            type="date"
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                            className={`w-full px-3 py-1.5 rounded border text-sm ${
                              isDark
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
            isDark ? 'border-slate-700/50' : 'border-gray-200'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${
                isDark
                  ? 'bg-slate-900/50 border border-slate-700/50'
                  : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isDark
                      ? 'bg-blue-500/20'
                      : 'bg-blue-100'
                  }`}>
                    <DollarSign className={`w-4 h-4 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total Expenses
                    </p>
                    <p className={`text-lg font-bold ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      ₹{getTotalExpenses().toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                isDark
                  ? 'bg-slate-900/50 border border-slate-700/50'
                  : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isDark
                      ? 'bg-green-500/20'
                      : 'bg-green-100'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Transactions
                    </p>
                    <p className={`text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {filteredExpenses.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                isDark
                  ? 'bg-slate-900/50 border border-slate-700/50'
                  : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isDark
                      ? 'bg-purple-500/20'
                      : 'bg-purple-100'
                  }`}>
                    <Receipt className={`w-4 h-4 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Avg. Expense
                    </p>
                    <p className={`text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
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
                  isDark
                    ? 'bg-slate-900/50 border-b border-slate-700/50'
                    : 'bg-gray-50 border-b border-gray-200'
                }`}>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Branch Owner
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Category
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Description
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="w-4 h-4" />
                      Amount
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDark ? 'divide-slate-700/50' : 'divide-gray-200'
              }`}>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Receipt className={`w-12 h-12 mb-3 ${
                          isDark ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {expenses.length === 0 ? 'No expenses records found' : 'No matching expenses found'}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {expenses.length === 0 
                            ? 'Expense transactions from assigned branches will appear here'
                            : 'Try adjusting your filters'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense, i) => (
                    <tr 
                      key={expense._id || i} 
                      className={`transition-colors ${
                        isDark
                          ? 'hover:bg-slate-700/30'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="text-sm">
                          {expense.date ? new Date(expense.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'N/A'}
                        </div>
                      </td>
                      
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="text-sm font-medium">
                          {expense.branchOwner?.name || 'Unknown Branch'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${
                          getCategoryColor(expense.category)
                        }`}>
                          <span>{getCategoryIcon(expense.category)}</span>
                          {expense.category || 'Other'}
                        </div>
                      </td>
                      
                      <td className={`px-6 py-4 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="text-sm max-w-xs truncate">
                          {expense.description || 'No description'}
                        </div>
                      </td>
                      
                      <td className={`px-6 py-4 whitespace-nowrap text-right ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="text-sm font-semibold">
                          ₹{expense.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-slate-700 text-gray-400 hover:text-blue-400'
                                : 'hover:bg-gray-200 text-gray-600 hover:text-blue-600'
                            }`}
                            title="Edit expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedExpense(expense);
                              setShowDeleteConfirm(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-slate-700 text-gray-400 hover:text-red-400'
                                : 'hover:bg-gray-200 text-gray-600 hover:text-red-600'
                            }`}
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredExpenses.length > 0 && (
            <div className={`px-6 py-4 border-t ${
              isDark ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items per page */}
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Show
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded border text-sm ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    per page
                  </span>
                </div>

                {/* Page info */}
                <div className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? isDark
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                        : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
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
                        ? isDark
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                        : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
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
                        className={`min-w-[2.5rem] h-10 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? isDark
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-500 text-white'
                            : page === '...'
                            ? isDark
                              ? 'text-gray-500 cursor-default'
                              : 'text-gray-400 cursor-default'
                            : isDark
                            ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                        }`}
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
                        ? isDark
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                        : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
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
                        ? isDark
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                        : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense Form Modal */}
      {showModal && (
        <ExpenseForm
          expense={editExpense}
          onClose={() => {
            setShowModal(false);
            setEditExpense(null);
          }}
          onExpenseAdded={handleExpenseAdded}
          isOpen={showModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 ${
            isDark
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200 shadow-2xl'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${
                isDark
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-red-100 text-red-600'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Delete Expense
              </h3>
            </div>
            
            <p className={`mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Are you sure you want to delete this expense record? This action cannot be undone.
            </p>
            
            <div className={`p-4 rounded-lg mb-6 ${
              isDark
                ? 'bg-slate-700/50 border border-slate-600'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedExpense?.description || 'No description'}
                  </p>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {selectedExpense?.category} • {selectedExpense?.date ? new Date(selectedExpense.date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  ₹{selectedExpense?.amount?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedExpense(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandOwnerExpensesManagement;