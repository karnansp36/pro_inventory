// pages/admin/ExpensesManagement.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import ExpensesForm from '../../../components/forms/ExpenseForm';
import { 
  getExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense,
  getExpensesByBrandOwner 
} from '../../../store/slices/expensesSlice';
import { getUsers } from '../../../store/slices/usersSlice';
import {
  CreditCard,
  X,
  Plus,
  DollarSign,
  TrendingUp,
  Receipt,
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
  Eye,
  Calendar
} from 'lucide-react';

const ExpensesManagement = () => {
  const dispatch = useDispatch();
  const { expenses, totalItems, loading, error } = useSelector((state) => state.expenses);
  const { users } = useSelector((state) => state.users || {});
  const { user } = useSelector((state) => state.auth || {});
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [refreshTable, setRefreshTable] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editExpense, setEditExpense] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    type: 'all',
    startDate: '',
    endDate: ''
  });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  const categories = ['Rent', 'Utilities', 'Supplies', 'Salaries', 'Maintenance', 'Marketing', 'Transportation', 'Other'];

  // Get unique branches from expenses
  const branches = [...new Set(expenses
    .filter(expense => expense.branchOwner?.name)
    .map(expense => expense.branchOwner.name)
  )].sort();

  // Filter expenses based on search, date, category, and branch filters
  const filteredExpenses = expenses.filter(expense => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.category?.toLowerCase().includes(searchLower) ||
        expense.amount?.toString().includes(searchTerm) ||
        expense.branchOwner?.name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) {
      return false;
    }

    // Branch filter
    if (branchFilter !== 'all' && expense.branchOwner?.name !== branchFilter) {
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
            end.setHours(23, 59, 59, 999);
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
    if (user) {
      if (user.role === 'BrandOwner') {
        dispatch(getExpensesByBrandOwner({ 
          brandOwnerId: user._id, 
          page: currentPage, 
          limit: itemsPerPage 
        }));
      } else if (user.role === 'Admin') {
        dispatch(getExpenses({ page: currentPage, limit: itemsPerPage }));
      }
      
      if (user.role === 'Admin' || user.role === 'BrandOwner') {
        dispatch(getUsers());
      }
    }
  }, [dispatch, user, currentPage, itemsPerPage, refreshTable]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleExpenseAdded = () => {
    setRefreshTable(prev => prev + 1);
    setShowForm(false);
    setEditExpense(null);
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditExpense(null);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;
    
    setDeleteLoading(true);
    try {
      await dispatch(deleteExpense(selectedExpense._id)).unwrap();
      toast.success('Expense deleted successfully!');
      setShowDeleteConfirm(false);
      setSelectedExpense(null);
      setRefreshTable(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to delete expense');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  };

  const getAverageExpense = () => {
    return filteredExpenses.length > 0 ? getTotalExpenses() / filteredExpenses.length : 0;
  };

  const getTopCategory = () => {
    const categories = {};
    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'N/A';
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
      const escapeCSV = (field) => {
        if (field === null || field === undefined) return '""';
        const stringField = String(field);
        if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      const headers = ['Date', 'Branch', 'Category', 'Description', 'Amount (₹)', 'Transaction ID', 'Created At'];

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
      if (dateFilter.type !== 'all' || searchTerm || categoryFilter !== 'all' || branchFilter !== 'all') {
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
        
        if (branchFilter !== 'all') {
          csvContent.push(`Branch Filter,${branchFilter}`);
        }
        
        if (searchTerm) {
          csvContent.push(`Search Term,${searchTerm}`);
        }
        
        csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);
        csvContent.push(`View Type,Admin Management View`);
      }

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `admin-expenses-management-${date}.csv`;
      
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
    setBranchFilter('all');
    setShowFilters(false);
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

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
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl p-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-rose-500 to-red-600'
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
                Manage all expense records across branches
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                showForm
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-white text-rose-600 hover:bg-gray-50 shadow-lg'
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
                  Add Expense
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl border shadow-lg ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Total Expenses
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  isDark ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  ₹{getTotalExpenses().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <DollarSign className={`h-8 w-8 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border shadow-lg ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Total Records
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  isDark ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  {filteredExpenses.length}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <TrendingUp className={`h-8 w-8 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border shadow-lg ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Average Expense
                </p>
                <p className={`text-3xl font-bold mt-2 truncate ${
                  isDark ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  ₹{getAverageExpense().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-sm mt-1 ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Top Category: {getTopCategory()}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <Receipt className={`h-8 w-8 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
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
                <ExpensesForm 
                  onExpenseAdded={handleExpenseAdded} 
                  onCancel={handleCancelEdit}
                  editExpense={editExpense}
                  isAdminView={true}
                  users={users}
                  currentUser={user}
                />
              </div>
            </div>
          )}
          
          {/* Table */}
          <div className={showForm ? 'lg:col-span-2' : ''}>
            <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
              isDark
                ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
                : 'bg-white border border-gray-200 shadow-lg'
            }`}>
              {/* Header with Search and Filters */}
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
                        All Expenses
                      </h2>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {filteredExpenses.length} of {totalItems} expense{totalItems !== 1 ? 's' : ''}
                        {(dateFilter.type !== 'all' || categoryFilter !== 'all' || branchFilter !== 'all' || searchTerm) && ' (filtered)'}
                        {' across all branches'}
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

                      {/* Branch Filter */}
                      <div className="space-y-3">
                        <label className={`text-sm font-medium ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Branch
                        </label>
                        <select
                          value={branchFilter}
                          onChange={(e) => setBranchFilter(e.target.value)}
                          className={`w-full px-3 py-2 rounded border text-sm ${
                            isDark
                              ? 'bg-slate-600 border-slate-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="all">All Branches</option>
                          {branches.map(branch => (
                            <option key={branch} value={branch}>
                              {branch}
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

              {/* Table Content */}
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
                        Branch
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
                                ? 'Expense transactions will appear here'
                                : 'Try adjusting your filters'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <tr 
                          key={expense._id} 
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
                                onClick={() => setSelectedExpense(expense)}
                                className={`p-1.5 rounded transition-colors ${
                                  isDark
                                    ? 'hover:bg-slate-600 text-gray-400 hover:text-white'
                                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                                }`}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleEdit(expense)}
                                className={`p-1.5 rounded transition-colors ${
                                  isDark
                                    ? 'hover:bg-blue-500/20 text-blue-400 hover:text-blue-300'
                                    : 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
                                }`}
                                title="Edit Expense"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedExpense(expense);
                                  setShowDeleteConfirm(true);
                                }}
                                className={`p-1.5 rounded transition-colors ${
                                  isDark
                                    ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                                    : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                }`}
                                title="Delete Expense"
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
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
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
                        className={`px-2 py-1 rounded border text-sm ${
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
                    <div className="flex items-center gap-1">
                      {/* First Page */}
                      <button
                        onClick={goToFirstPage}
                        disabled={currentPage === 1}
                        className={`p-2 rounded ${
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
                        className={`p-2 rounded ${
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
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                          disabled={typeof page !== 'number'}
                          className={`min-w-[2.5rem] px-2 py-1.5 rounded text-sm font-medium ${
                            typeof page === 'number'
                              ? currentPage === page
                                ? isDark
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-blue-500 text-white'
                                : isDark
                                ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                              : isDark
                              ? 'text-gray-600 cursor-default'
                              : 'text-gray-400 cursor-default'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      {/* Next Page */}
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded ${
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
                        className={`p-2 rounded ${
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
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`mx-4 max-w-md w-full rounded-xl p-6 ${
            isDark
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Delete Expense
                </h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${
              isDark ? 'bg-slate-700/50' : 'bg-gray-100'
            }`}>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Are you sure you want to delete this expense?
              </p>
              {selectedExpense && (
                <div className={`mt-2 p-3 rounded border ${
                  isDark ? 'border-slate-600' : 'border-gray-300'
                }`}>
                  <p className="text-sm font-medium">
                    {selectedExpense.description || 'No description'}
                  </p>
                  <p className="text-sm">
                    ₹{selectedExpense.amount?.toFixed(2)} • {selectedExpense.category} • {new Date(selectedExpense.date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedExpense(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleteLoading ? 'Deleting...' : 'Delete Expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManagement;