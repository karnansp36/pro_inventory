// components/branch-owner/ManagerStockTable.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { getStockRequestsByBranch } from '../../../store/slices/stockRequestsSlice';
import { toast } from 'react-toastify';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';

const ManagerStockTable = ({ 
  branchOwnerId,
  // Manager view props
  requestsData = null,
  totalItems: propTotalItems = 0,
  isManagerView = false,
  filters: propFilters = {},
  currentPage: propCurrentPage = 1,
  itemsPerPage: propItemsPerPage = 10,
  onPageChange = null,
  onItemsPerPageChange = null,
  loading: propLoading = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dispatch = useDispatch();
  const { 
    stockRequests: reduxRequests, 
    totalItems: reduxTotalItems, 
    loading: reduxLoading, 
    error 
  } = useSelector((state) => state.stockRequests);
  
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    type: 'all',
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Use props if provided (manager view), otherwise use Redux state (branch owner view)
  const requests = isManagerView ? (requestsData || []) : reduxRequests;
  const totalItems = isManagerView ? propTotalItems : reduxTotalItems;
  const loading = isManagerView ? propLoading : reduxLoading;

  // Sync with prop changes for manager view
  useEffect(() => {
    if (isManagerView) {
      setCurrentPage(propCurrentPage);
      setItemsPerPage(propItemsPerPage);
    }
  }, [propCurrentPage, propItemsPerPage, isManagerView]);

  // For branch owner view: fetch data when filters/pagination change
  useEffect(() => {
    if (branchOwnerId && !isManagerView) {
      const filters = {
        searchTerm,
        dateFilter,
        statusFilter,
        priorityFilter
      };
      
      dispatch(getStockRequestsByBranch({ 
        branchId: branchOwnerId, 
        page: currentPage, 
        limit: itemsPerPage,
        filters 
      }));
    }
  }, [dispatch, branchOwnerId, currentPage, itemsPerPage, searchTerm, dateFilter, statusFilter, priorityFilter, isManagerView]);

  // For manager view: fetch data when filters/pagination change
  useEffect(() => {
    if (isManagerView && branchOwnerId) {
      const filters = {
        searchTerm,
        dateFilter,
        statusFilter,
        priorityFilter
      };
      dispatch(getStockRequestsByBranch({
        branchId: branchOwnerId,
        page: currentPage,
        limit: itemsPerPage,
        filters: filters
      }));
    }
  }, [dispatch, branchOwnerId, currentPage, itemsPerPage, searchTerm, dateFilter, statusFilter, priorityFilter, isManagerView]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Server-side pagination - use requests directly as they're already paginated
  const currentItems = requests;

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + requests.length, totalItems);

  const handlePageChange = (pageNumber) => {
    if (isManagerView && onPageChange) {
      onPageChange(pageNumber);
    } else {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (value) => {
    if (isManagerView && onItemsPerPageChange) {
      onItemsPerPageChange(value);
    } else {
      setItemsPerPage(value);
      setCurrentPage(1);
    }
  };

  const goToFirstPage = () => {
    const newPage = 1;
    if (isManagerView && onPageChange) {
      onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const goToLastPage = () => {
    const newPage = totalPages;
    if (isManagerView && onPageChange) {
      onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const goToPreviousPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    if (isManagerView && onPageChange) {
      onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const goToNextPage = () => {
    const newPage = Math.min(totalPages, currentPage + 1);
    if (isManagerView && onPageChange) {
      onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

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

  const getStatusStyles = (approved) => {
    const status = approved ? 'Approved' : 'Pending';
    const lightStyles = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Approved: 'bg-green-100 text-green-800 border-green-200',
    };
    const darkStyles = {
      Pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      Approved: 'bg-green-900/30 text-green-300 border-green-700',
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

  const getStatusIcon = (approved) => {
    return approved ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />;
  };

  // CSV Export Function - exports current page data
  const downloadCSV = () => {
    if (requests.length === 0) {
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

      const headers = [
        'Date',
        'Product Name',
        'Quantity',
        'Priority',
        'Status',
        'Request ID',
        'Branch ID',
        'Created At'
      ];

      const csvRows = requests.map(request => [
        escapeCSV(new Date(request.createdAt || request.date).toLocaleDateString('en-US')),
        escapeCSV(request.productName || 'Unknown'),
        escapeCSV(request.quantity || '0'),
        escapeCSV(request.priority || 'Normal'),
        escapeCSV(request.approved ? 'Approved' : 'Pending'),
        escapeCSV(request._id || 'N/A'),
        escapeCSV(request.branchId || branchOwnerId || 'N/A'),
        escapeCSV(new Date(request.createdAt || request.date).toISOString())
      ]);

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary
      csvContent.push('');
      csvContent.push('Summary');
      csvContent.push(`Total Records (Current Page),${requests.length}`);
      csvContent.push(`Approved Requests (Current Page),${(requests || []).filter(r => r.approved).length}`);
      csvContent.push(`Pending Requests (Current Page),${(requests || []).filter(r => !r.approved).length}`);
      csvContent.push(`Total Records (All Pages),${totalItems}`);
      csvContent.push(`Page,${currentPage} of ${totalPages}`);
      
      if (!isManagerView && dateFilter.type !== 'all') {
        csvContent.push(`Date Filter,${dateFilter.type}`);
        if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
          csvContent.push(`Start Date,${dateFilter.startDate}`);
          csvContent.push(`End Date,${dateFilter.endDate}`);
        }
      }
      
      if (!isManagerView && statusFilter !== 'all') {
        csvContent.push(`Status Filter,${statusFilter}`);
      }
      
      if (!isManagerView && priorityFilter !== 'all') {
        csvContent.push(`Priority Filter,${priorityFilter}`);
      }
      
      if (!isManagerView && searchTerm) {
        csvContent.push(`Search Term,${searchTerm}`);
      }
      
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `stock-requests-${branchOwnerId || 'branch'}-page${currentPage}-${date}.csv`;
      
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

  // Apply quick date filter (branch owner view only)
  const applyQuickDateFilter = (type) => {
    if (isManagerView) return;

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
    setCurrentPage(1);
  };

  // Clear all filters (branch owner view only)
  const clearFilters = () => {
    if (isManagerView) return;
    
    setSearchTerm('');
    setDateFilter({ type: 'all', startDate: '', endDate: '' });
    setStatusFilter('all');
    setPriorityFilter('all');
    setShowFilters(false);
    setCurrentPage(1);
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
      label: 'CSV (Current Page)', 
      color: 'bg-blue-500 hover:bg-blue-600',
      handler: downloadCSV
    }
  ];

  if (loading && requests.length === 0) {
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
            Loading stock requests...
          </p>
        </div>
      </div>
    );
  }

  return (
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
              <Package className={`w-5 h-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {isManagerView ? 'Stock Requests Overview' : 'Request History'}
              </h2>
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Showing {requests.length} of {totalItems} request{totalItems !== 1 ? 's' : ''}
                {!isManagerView && (dateFilter.type !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && ' (filtered)'}
                {isManagerView && ' (read-only)'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search - Only for branch owner view */}
            {!isManagerView && (
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`pl-10 pr-4 py-2 rounded-lg border transition-colors text-sm ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            )}

            {/* Filter Button - Only for branch owner view */}
            {!isManagerView && (
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
            )}

            {/* Export Button with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={requests.length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                } ${requests.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Export Dropdown Menu */}
              {showExportMenu && (
                <div className={`absolute right-0 top-full mt-1 w-56 rounded-lg shadow-lg border z-50 ${
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
                        className={`w-full flex items-center justify-center gap-3 px-3 py-2 rounded text-sm text-white font-medium transition-all mb-1 last:mb-0 ${format.color}`}
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

        {/* Filters Panel - Only for branch owner view */}
        {showFilters && !isManagerView && (
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
              {/* Status Filter */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    isDark
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    isDark
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Required">Required</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              {/* Date Filters */}
              <div className="space-y-2">
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
                <Package className={`w-4 h-4 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Requests (Page)
                </p>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {requests.length}
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
                <CheckCircle className={`w-4 h-4 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Approved
                </p>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {(requests || []).filter(r => r.approved).length}
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
                  ? 'bg-yellow-500/20'
                  : 'bg-yellow-100'
              }`}>
                <Clock className={`w-4 h-4 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Pending
                </p>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {(requests || []).filter(r => !r.approved).length}
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
              {isManagerView && (
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Branch
                </th>
              )}
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Product
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Quantity
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Priority
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Status
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDark ? 'divide-slate-700/50' : 'divide-gray-200'
          }`}>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={isManagerView ? 6 : 5} className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Package className={`w-12 h-12 mb-3 ${
                      isDark ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No stock requests found
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {!isManagerView && (dateFilter.type !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm)
                        ? 'Try adjusting your filters'
                        : 'Stock requests will appear here'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((request) => (
                <tr
                  key={request._id}
                  className={`transition-colors ${
                    isDark
                      ? 'hover:bg-slate-700/30'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-blue-400' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm font-medium">
                        {new Date(request.createdAt || request.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  {isManagerView && (
                    <td className={`px-6 py-4 whitespace-nowrap ${
                      isDark ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      <span className="text-sm font-medium">
                        {request.branchOwner?.name || request.branchId || 'N/A'}
                      </span>
                    </td>
                  )}
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
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                      getStatusStyles(request.approved)
                    }`}>
                      {getStatusIcon(request.approved)}
                      {request.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {currentItems.length > 0 && (
        <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark
            ? 'border-slate-700/50 bg-slate-900/30'
            : 'border-gray-200 bg-gray-50'
        }`}>
          {/* Left side - Rows info and per page selector */}
          <div className="flex items-center gap-4">
            <div className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{endIndex}</span> of{' '}
              <span className="font-medium">{totalItems}</span> entries
            </div>
            
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-gray-300 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
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
                  ? isDark
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDark
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
                  ? isDark
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDark
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
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? isDark
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-blue-500 text-white shadow-sm'
                        : isDark
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
                  ? isDark
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDark
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
                  ? isDark
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDark
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

export default ManagerStockTable;