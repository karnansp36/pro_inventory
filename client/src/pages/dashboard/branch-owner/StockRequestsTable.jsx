// ============================================
// 3. StockRequestsTable.jsx - Table Component
// ============================================

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
  Clock
} from 'lucide-react';

const StockRequestsTable = ({ branchOwnerId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dispatch = useDispatch();
  const { stockRequests: requests, totalItems, loading, error } = useSelector((state) => state.stockRequests);
  
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

  // Filter stock requests based on search and filters
  const filteredRequests = requests.filter(request => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        request.productName?.toLowerCase().includes(searchLower) ||
        request.quantity?.toString().includes(searchTerm) ||
        request.priority?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'approved' && !request.approved) return false;
      if (statusFilter === 'pending' && request.approved) return false;
    }

    // Priority filter
    if (priorityFilter !== 'all' && request.priority !== priorityFilter) {
      return false;
    }

    // Date filter
    if (dateFilter.type !== 'all') {
      const requestDate = new Date(request.createdAt || request.date);
      const today = new Date();
      
      switch (dateFilter.type) {
        case 'today':
          return requestDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return requestDate >= weekAgo && requestDate <= today;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return requestDate >= monthAgo && requestDate <= today;
        case 'custom':
          if (dateFilter.startDate && dateFilter.endDate) {
            const start = new Date(dateFilter.startDate);
            const end = new Date(dateFilter.endDate);
            end.setHours(23, 59, 59, 999);
            return requestDate >= start && requestDate <= end;
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
      dispatch(getStockRequestsByBranch({ branchId: branchOwnerId, page: currentPage, limit: itemsPerPage }));
    }
  }, [dispatch, branchOwnerId, currentPage, itemsPerPage]);

  // CSV Export Function
  const downloadCSV = () => {
    if (filteredRequests.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Enhanced CSV formatting with proper escaping
      const escapeCSV = (field) => {
        if (field === null || field === undefined) return '""';
        const stringField = String(field);
        if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      // CSV headers
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

      // Convert requests data to CSV rows
      const csvRows = filteredRequests.map(request => [
        escapeCSV(new Date(request.createdAt || request.date).toLocaleDateString('en-US')),
        escapeCSV(request.productName || 'Unknown'),
        escapeCSV(request.quantity || '0'),
        escapeCSV(request.priority || 'Normal'),
        escapeCSV(request.approved ? 'Approved' : 'Pending'),
        escapeCSV(request._id || 'N/A'),
        escapeCSV(request.branchId || branchOwnerId || 'N/A'),
        escapeCSV(new Date(request.createdAt || request.date).toISOString())
      ]);

      // Build CSV content
      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary section if there are filters applied
      if (dateFilter.type !== 'all' || searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') {
        csvContent.push('');
        csvContent.push('Summary');
        csvContent.push(`Total Records,${filteredRequests.length}`);
        csvContent.push(`Approved Requests,${filteredRequests.filter(r => r.approved).length}`);
        csvContent.push(`Pending Requests,${filteredRequests.filter(r => !r.approved).length}`);
        
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
        
        if (searchTerm) {
          csvContent.push(`Search Term,${searchTerm}`);
        }
        
        csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);
      }

      // Create blob and download
      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `stock-requests-${branchOwnerId || 'branch'}-${date}.csv`;
      
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
    setStatusFilter('all');
    setPriorityFilter('all');
    setShowFilters(false);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
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

  return (
    <div className={`rounded-2xl shadow-lg overflow-hidden ${
      isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
    }`}>
      {/* Table Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Package className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Request History
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredRequests.length} of {totalItems || 0} request{totalItems !== 1 ? 's' : ''}
                {(dateFilter.type !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || searchTerm) && ' (filtered)'}
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
                disabled={filteredRequests.length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                } ${filteredRequests.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              {/* Status Filter */}
              <div className="space-y-3">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
              <div className="space-y-3">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
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

      {/* Table Body */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading requests...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-2">
              <AlertTriangle className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDark ? 'bg-slate-700/30' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </div>
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Product
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Quantity
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Priority
                </th>
                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-200'}`}>
              {currentItems.map((request) => (
                <tr 
                  key={request._id}
                  className={`transition-colors duration-150 ${
                    isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      {new Date(request.createdAt || request.date).toLocaleDateString()}
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
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isDark ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <Package className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <p className={`text-lg font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {requests.length === 0 ? 'No stock requests yet' : 'No matching requests found'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {requests.length === 0 ? 'Create your first stock request to get started' : 'Try adjusting your filters'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className={`px-6 py-4 border-t ${
          isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Show
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-all duration-200 ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                entries
              </span>
            </div>

            {/* Page info */}
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} requests
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              {/* First page button */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === 1
                    ? isDark 
                      ? 'bg-slate-700/50 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>

              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === 1
                    ? isDark 
                      ? 'bg-slate-700/50 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const showPage = 
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                  
                  const showEllipsis = 
                    (pageNum === currentPage - 2 && currentPage > 3) ||
                    (pageNum === currentPage + 2 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span 
                        key={pageNum}
                        className={`px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : isDark
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === totalPages
                    ? isDark 
                      ? 'bg-slate-700/50 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Last page button */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  currentPage === totalPages
                    ? isDark 
                      ? 'bg-slate-700/50 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockRequestsTable;