// pages/admin/StockRequestsManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { 
  getStockRequests, 
  approveStockRequest, 
  deleteStockRequest,
  getStockRequestsByBrandOwner 
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
  Clock,
  TrendingUp,
  Loader2,
  Truck,
  XCircle,
  User
} from 'lucide-react';

const StockRequestsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const { 
    stockRequests, 
    totalItems, 
    loading, 
    error 
  } = useSelector((state) => state.stockRequests);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [managerNameFilter, setManagerNameFilter] = useState('');

  // Fetch data when filters/pagination change
  useEffect(() => {
    const filters = {
      status: statusFilter !== 'all' ? statusFilter : '',
      managerName: managerNameFilter
    };
    
    dispatch(getStockRequests({
      page: currentPage,
      limit: itemsPerPage,
      filters
    }));
  }, [dispatch, currentPage, itemsPerPage, statusFilter, priorityFilter, managerNameFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle approve request
  const handleApprove = (requestId) => {
    dispatch(approveStockRequest(requestId))
      .unwrap()
      .then(() => {
        toast.success('Stock request approved successfully');
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to approve request');
      });
  };

  // Handle delete request
  const handleDelete = (requestId) => {
    if (window.confirm('Are you sure you want to delete this stock request?')) {
      dispatch(deleteStockRequest(requestId))
        .unwrap()
        .then(() => {
          toast.success('Stock request deleted successfully');
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to delete request');
        });
    }
  };

  // Handle create transport
  const handleCreateTransport = (request) => {
    navigate('/dashboard/admin/transport', { state: { stockRequest: request } });
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
        'Quantity',
        'Priority',
        'Status',
        'Branch Owner',
        'Manager',
        'Request ID',
        'Created At'
      ];

      const csvRows = stockRequests.map(request => [
        escapeCSV(new Date(request.createdAt).toLocaleDateString('en-US')),
        escapeCSV(request.productName || 'Unknown'),
        escapeCSV(request.quantity || '0'),
        escapeCSV(request.priority || 'Normal'),
        escapeCSV(request.approved ? 'Approved' : 'Pending'),
        escapeCSV(request.branchOwner?.name || 'Unknown'),
        escapeCSV(request.branchOwner?.assignedManager?.name || 'N/A'),
        escapeCSV(request._id || 'N/A'),
        escapeCSV(new Date(request.createdAt).toISOString())
      ]);

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary
      csvContent.push('');
      csvContent.push('Summary');
      csvContent.push(`Total Records (Current Page),${stockRequests.length}`);
      csvContent.push(`Approved Requests (Current Page),${stockRequests.filter(r => r.approved).length}`);
      csvContent.push(`Pending Requests (Current Page),${stockRequests.filter(r => !r.approved).length}`);
      csvContent.push(`Total Records (All Pages),${totalItems}`);
      csvContent.push(`Page,${currentPage} of ${totalPages}`);
      
      if (statusFilter !== 'all') {
        csvContent.push(`Status Filter,${statusFilter}`);
      }
      
      if (priorityFilter !== 'all') {
        csvContent.push(`Priority Filter,${priorityFilter}`);
      }
      
      if (managerNameFilter) {
        csvContent.push(`Manager Filter,${managerNameFilter}`);
      }
      
      if (searchTerm) {
        csvContent.push(`Search Term,${searchTerm}`);
      }
      
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `stock-requests-management-page${currentPage}-${date}.csv`;
      
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

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setManagerNameFilter('');
    setShowFilters(false);
    setCurrentPage(1);
  };

  const exportFormats = [
    { 
      key: 'csv', 
      label: 'CSV (Current Page)', 
      color: 'bg-blue-500 hover:bg-blue-600',
      handler: downloadCSV
    }
  ];

  // Calculate stats
  const totalRequests = totalItems;
  const pendingRequests = stockRequests.filter(r => !r.approved).length;
  const approvedRequests = stockRequests.filter(r => r.approved).length;
  const urgentRequests = stockRequests.filter(r => r.priority === 'Urgent').length;

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
                Approve and manage stock requests from all branches
              </p>
            </div>
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
                  <Package className={`w-5 h-5 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    All Stock Requests
                  </h2>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Showing {stockRequests.length} of {totalItems} request{totalItems !== 1 ? 's' : ''}
                    {(statusFilter !== 'all' || priorityFilter !== 'all' || managerNameFilter || searchTerm) && ' (filtered)'}
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

                  {/* Manager Filter */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Manager Name
                    </label>
                    <input
                      type="text"
                      placeholder="Filter by manager..."
                      value={managerNameFilter}
                      onChange={(e) => {
                        setManagerNameFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark
                          ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
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
                      Total Requests
                    </p>
                    <p className={`text-lg font-bold ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {totalRequests}
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
                      {pendingRequests}
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
                      {approvedRequests}
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
                    <TrendingUp className={`w-4 h-4 ${
                      isDark ? 'text-red-400' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Urgent
                    </p>
                    <p className={`text-lg font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {urgentRequests}
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
                    Branch
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Manager
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
                    <td colSpan={8} className="px-6 py-12">
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
                          {(statusFilter !== 'all' || priorityFilter !== 'all' || managerNameFilter || searchTerm)
                            ? 'Try adjusting your filters'
                            : 'Stock requests will appear here'}
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
                          <span className="text-sm font-medium">
                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
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
                        <span className="text-sm font-medium">
                          {request.branchOwner?.name || 'Unknown Branch'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          <User className={`w-4 h-4 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className="text-sm">
                            {request.branchOwner?.assignedManager?.name || 'N/A'}
                          </span>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {!request.approved && (
                            <>
                              <button
                                onClick={() => handleApprove(request._id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isDark
                                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                                }`}
                              >
                                <CheckCircle className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleDelete(request._id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isDark
                                    ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                                }`}
                              >
                                <XCircle className="w-3 h-3" />
                                Delete
                              </button>
                            </>
                          )}
                          {request.approved && (
                            <button
                              onClick={() => handleCreateTransport(request)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isDark
                                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                              }`}
                            >
                              <Truck className="w-3 h-3" />
                              Transport
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {stockRequests.length > 0 && (
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
                  Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold">{endIndex}</span> of{' '}
                  <span className="font-semibold">{totalItems}</span> results
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Rows per page:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
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
                </div>
              </div>

              {/* Right side - Pagination controls */}
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
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? isDark
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-500 text-white'
                          : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StockRequestsManagement;