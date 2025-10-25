// BrandOwnerStockRequestsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { 
  getStockRequestsByBrandOwner, 
  updateStockRequest, 
  deleteStockRequest 
} from '../../../store/slices/stockRequestsSlice';
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
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Loader2,
  Plus
} from 'lucide-react';
import StockRequestForm from '../branch-owner/StockRequestForm';

const BrandOwnerStockRequestsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dispatch = useDispatch();
  const { stockRequests, loading, error, totalItems } = useSelector((state) => state.stockRequests);
  const { user: currentUser } = useSelector((state) => state.auth);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    type: 'all',
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [branchOwnerFilter, setBranchOwnerFilter] = useState('');

  // Fetch data when filters/pagination change
useEffect(() => {
  if (currentUser?._id) {
    // Create clean filters object with proper structure
    const cleanFilters = {};
    
    // Add search term if exists
    if (searchTerm) {
      cleanFilters.searchTerm = searchTerm;
    }
    
    // Add status filter if not 'all'
    if (statusFilter && statusFilter !== 'all') {
      cleanFilters.statusFilter = statusFilter;
    }
    
    // Add priority filter if not 'all'
    if (priorityFilter && priorityFilter !== 'all') {
      cleanFilters.priorityFilter = priorityFilter;
    }
    
    // Add branch owner filter if exists
    if (branchOwnerFilter) {
      cleanFilters.branchOwnerName = branchOwnerFilter;
    }
    
    // Add date filter if not 'all' - this will be handled specially in the service
    if (dateFilter.type !== 'all') {
      cleanFilters.dateFilter = dateFilter;
    }

    console.log('Dispatching with filters:', cleanFilters);
    dispatch(getStockRequestsByBrandOwner({ 
      brandOwnerId: currentUser._id, 
      page: currentPage, 
      limit: itemsPerPage,
      filters: cleanFilters 
    }));
  }
}, [dispatch, currentUser?._id, currentPage, itemsPerPage, searchTerm, dateFilter, statusFilter, priorityFilter, branchOwnerFilter]);
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handlers
  const handleRequestAdded = () => {
    setShowModal(false);
    setEditRequest(null);
    // Refresh data
    if (currentUser?._id) {
      dispatch(getStockRequestsByBrandOwner({ 
        brandOwnerId: currentUser._id, 
        page: currentPage, 
        limit: itemsPerPage
      }));
    }
  };

  const handleEdit = (request) => {
    setEditRequest(request);
    setShowModal(true);
  };

  const handleDelete = (requestId) => {
    if (window.confirm('Are you sure you want to delete this stock request?')) {
      dispatch(deleteStockRequest(requestId)).then(() => {
        if (currentUser?._id) {
          dispatch(getStockRequestsByBrandOwner({ 
            brandOwnerId: currentUser._id, 
            page: currentPage, 
            limit: itemsPerPage
          }));
        }
      });
    }
  };

  const handleApproveReject = (requestId, status) => {
    dispatch(updateStockRequest({ 
      id: requestId, 
      stockRequestData: { status } 
    })).then(() => {
      if (currentUser?._id) {
        dispatch(getStockRequestsByBrandOwner({ 
          brandOwnerId: currentUser._id, 
          page: currentPage, 
          limit: itemsPerPage
        }));
      }
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + stockRequests.length, totalItems);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
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

  // Status and Priority Styles
  const getStatusStyles = (status) => {
    const lightStyles = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Approved: 'bg-green-100 text-green-800 border-green-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    const darkStyles = {
      Pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      Approved: 'bg-green-900/30 text-green-300 border-green-700',
      Rejected: 'bg-red-900/30 text-red-300 border-red-700',
    };
    const styles = isDark ? darkStyles : lightStyles;
    return styles[status] || (isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200');
  };

  const getPriorityStyles = (priority) => {
    const lightStyles = {
      High: 'bg-red-100 text-red-700 border-red-200',
      Medium: 'bg-orange-100 text-orange-700 border-orange-200',
      Low: 'bg-green-100 text-green-700 border-green-200'
    };
    const darkStyles = {
      High: 'bg-red-900/30 text-red-300 border-red-700',
      Medium: 'bg-orange-900/30 text-orange-300 border-orange-700',
      Low: 'bg-green-900/30 text-green-300 border-green-700'
    };
    const styles = isDark ? darkStyles : lightStyles;
    return styles[priority] || (isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200');
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      High: '🚨',
      Medium: '⚠️',
      Low: '✅'
    };
    return icons[priority] || '📦';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: <Clock className="w-3 h-3" />,
      Approved: <CheckCircle className="w-3 h-3" />,
      Rejected: <XCircle className="w-3 h-3" />
    };
    return icons[status] || <Clock className="w-3 h-3" />;
  };

  // CSV Export Function
  const downloadCSV = () => {
    if (stockRequests.length === 0) {
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
        'Branch Owner',
        'Quantity',
        'Priority',
        'Status',
        'Request ID',
        'Created At'
      ];

      const csvRows = stockRequests.map(request => [
        escapeCSV(new Date(request.createdAt).toLocaleDateString('en-US')),
        escapeCSV(request.productName || 'Unknown'),
        escapeCSV(request.branchOwner?.name || 'N/A'),
        escapeCSV(request.quantity || '0'),
        escapeCSV(request.priority || 'Medium'),
        escapeCSV(request.status || 'Pending'),
        escapeCSV(request._id || 'N/A'),
        escapeCSV(new Date(request.createdAt).toISOString())
      ]);

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary
      csvContent.push('');
      csvContent.push('Summary');
      csvContent.push(`Total Records (Current Page),${stockRequests.length}`);
      csvContent.push(`Approved Requests (Current Page),${stockRequests.filter(r => r.status === 'Approved').length}`);
      csvContent.push(`Pending Requests (Current Page),${stockRequests.filter(r => r.status === 'Pending').length}`);
      csvContent.push(`Rejected Requests (Current Page),${stockRequests.filter(r => r.status === 'Rejected').length}`);
      csvContent.push(`Total Records (All Pages),${totalItems}`);
      csvContent.push(`Page,${currentPage} of ${totalPages}`);
      
      if (dateFilter.type !== 'all') {
        csvContent.push(`Date Filter,${dateFilter.type}`);
        if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
          csvContent.push(`Start Date,${dateFilter.startDate}`);
          csvContent.push(`End Date,${dateFilter.endDate}`);
        }
      }
      
      if (statusFilter !== 'all') {
        csvContent.push(`Status Filter,${statusFilter}`);
      }
      
      if (priorityFilter !== 'all') {
        csvContent.push(`Priority Filter,${priorityFilter}`);
      }
      
      if (branchOwnerFilter) {
        csvContent.push(`Branch Owner Filter,${branchOwnerFilter}`);
      }
      
      if (searchTerm) {
        csvContent.push(`Search Term,${searchTerm}`);
      }
      
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `brand-owner-stock-requests-page${currentPage}-${date}.csv`;
      
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
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter({ type: 'all', startDate: '', endDate: '' });
    setStatusFilter('all');
    setPriorityFilter('all');
    setBranchOwnerFilter('');
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

  if (loading && stockRequests.length === 0) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
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
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Stock Requests Management
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Manage stock requests from your assigned branches
              </p>
            </div>
            <button
              onClick={() => { setEditRequest(null); setShowModal(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 hover:bg-gray-50 shadow-lg rounded-xl font-semibold transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add Request
            </button>
          </div>
        </div>

        {/* Main Table Component */}
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
                    Stock Requests
                  </h2>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Showing {stockRequests.length} of {totalItems} request{totalItems !== 1 ? 's' : ''}
                    {(dateFilter.type !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm || branchOwnerFilter) && ' (filtered)'}
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
                    disabled={stockRequests.length === 0}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    } ${stockRequests.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Branch Owner Filter */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Branch Owner
                    </label>
                    <input
                      type="text"
                      placeholder="Search branch owner..."
                      value={branchOwnerFilter}
                      onChange={(e) => {
                        setBranchOwnerFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark
                          ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

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
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
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
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                      {stockRequests.length}
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
                      {stockRequests.filter(r => r.status === 'Approved').length}
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
                      {stockRequests.filter(r => r.status === 'Pending').length}
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
                      ? 'bg-red-500/20'
                      : 'bg-red-100'
                  }`}>
                    <XCircle className={`w-4 h-4 ${
                      isDark ? 'text-red-400' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Rejected
                    </p>
                    <p className={`text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stockRequests.filter(r => r.status === 'Rejected').length}
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
                    Product
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Branch Owner
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
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDark ? 'divide-slate-700/50' : 'divide-gray-200'
              }`}>
                {stockRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
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
                          {(dateFilter.type !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm || branchOwnerFilter)
                            ? 'Try adjusting your filters'
                            : 'Stock requests from your branches will appear here'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stockRequests.map((request) => (
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
                          {new Date(request.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className={`text-xs ${
                          isDark ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          {new Date(request.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="font-medium">{request.productName || 'Unknown Product'}</div>
                        <div className={`text-xs ${
                          isDark ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          ID: {request._id?.slice(-8) || 'N/A'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="font-medium">{request.branchOwner?.name || 'Unknown Branch'}</div>
                        <div className={`text-xs ${
                          isDark ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          {request.branchOwner?.email || 'N/A'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="font-medium">{request.quantity || 0}</div>
                        <div className={`text-xs ${
                          isDark ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          units
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{getPriorityIcon(request.priority)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            getPriorityStyles(request.priority)
                          }`}>
                            {request.priority || 'Medium'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            getStatusStyles(request.status)
                          }`}>
                            {request.status || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {request.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApproveReject(request._id, 'Approved')}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isDark
                                    ? 'hover:bg-green-900/30 text-green-400 hover:text-green-300'
                                    : 'hover:bg-green-100 text-green-600 hover:text-green-700'
                                }`}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleApproveReject(request._id, 'Rejected')}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isDark
                                    ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300'
                                    : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                                }`}
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(request)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-blue-900/30 text-blue-400 hover:text-blue-300'
                                : 'hover:bg-blue-100 text-blue-600 hover:text-blue-700'
                            }`}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(request._id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300'
                                : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                            }`}
                            title="Delete"
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
          {stockRequests.length > 0 && (
            <div className={`px-6 py-4 border-t ${
              isDark ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Items per page */}
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Show
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
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
                  Showing {startIndex + 1} to {endIndex} of {totalItems} entries
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
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={typeof page !== 'number'}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? isDark
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-500 text-white'
                            : isDark
                            ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        } ${typeof page !== 'number' ? 'cursor-default' : ''}`}
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
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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

      {/* Stock Request Form Modal */}
      {showModal && (
        <StockRequestForm
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditRequest(null);
          }}
          onRequestAdded={handleRequestAdded}
          editRequest={editRequest}
          isBrandOwner={true}
        />
      )}
    </div>
  );
};

export default BrandOwnerStockRequestsPage;