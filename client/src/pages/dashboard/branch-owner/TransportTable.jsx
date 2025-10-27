// components/branch-owner/TransportTable.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { getTransportsByBranch, getTransportsByManager, updateTransport } from '../../../store/slices/transportSlice';
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
  Truck,
  Package,
  CheckCircle,
  Clock,
  Loader2,
  Edit,
  Save
} from 'lucide-react';

const TransportTable = ({ 
  branchOwnerId,
  // Manager view props
  transportsData = null,
  totalItems: propTotalItems = 0,
  isManagerView = false,
  filters: propFilters = {},
  currentPage: propCurrentPage = 1,
  itemsPerPage: propItemsPerPage = 10,
  onPageChange = null,
  onItemsPerPageChange = null,
  loading: propLoading = false,
  refreshSignal = 0
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dispatch = useDispatch();
  const { 
    transport: reduxTransports, 
    totalItems: reduxTotalItems, 
    loading: reduxLoading, 
    error 
  } = useSelector((state) => state.transport);
  
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
  const [locationFilter, setLocationFilter] = useState('all');
  const [editingTransportId, setEditingTransportId] = useState(null);
  const [receivedQuantities, setReceivedQuantities] = useState({});
  const [complaints, setComplaints] = useState({});

  // Use props if provided (manager view), otherwise use Redux state (branch owner view)
  const transports = isManagerView ? (transportsData || []) : reduxTransports;
  const totalItems = isManagerView ? propTotalItems : reduxTotalItems;
  const loading = isManagerView ? propLoading : reduxLoading;

  // Sync with prop changes for manager view
  useEffect(() => {
    if (isManagerView) {
      setCurrentPage(propCurrentPage);
      setItemsPerPage(propItemsPerPage);
    }
  }, [propCurrentPage, propItemsPerPage, isManagerView]);

  // Memoize filter objects to prevent infinite loop
  const memoizedDateFilter = useMemo(() => dateFilter, [dateFilter.type, dateFilter.startDate, dateFilter.endDate]);
  const memoizedFilters = useMemo(() => ({
    searchTerm,
    dateFilter: memoizedDateFilter,
    statusFilter,
    locationFilter
  }), [searchTerm, memoizedDateFilter, statusFilter, locationFilter]);

  // Memoized fetch functions
  const fetchBranchTransports = useCallback(() => {
    if (branchOwnerId && !isManagerView) {
      dispatch(getTransportsByBranch({ branchId: branchOwnerId, page: currentPage, limit: itemsPerPage }));
    }
  }, [branchOwnerId, isManagerView, currentPage, itemsPerPage, dispatch]);

  const fetchManagerTransports = useCallback(() => {
    if (isManagerView && branchOwnerId) {
      dispatch(getTransportsByManager({
        managerId: branchOwnerId,
        page: currentPage,
        limit: itemsPerPage,
        filters: memoizedFilters
      }));
    }
  }, [dispatch, branchOwnerId, currentPage, itemsPerPage, memoizedFilters, isManagerView]);

  // Initial fetch and refresh handling
  useEffect(() => {
    if (isManagerView) {
      fetchManagerTransports();
    } else {
      fetchBranchTransports();
    }
  }, [fetchBranchTransports, fetchManagerTransports, isManagerView, refreshSignal]);

  // Initialize receivedQuantities and complaints when transports load
  useEffect(() => {
    const initialQuantities = {};
    const initialComplaints = {};
    transports.forEach(transport => {
      initialQuantities[transport._id] = transport.receivedQuantity || '';
      initialComplaints[transport._id] = transport.complaints || '';
    });
    setReceivedQuantities(initialQuantities);
    setComplaints(initialComplaints);
  }, [transports]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle update transport
  const handleUpdateTransport = async (transportId) => {
    try {
      const transportData = {
        receivedQuantity: parseInt(receivedQuantities[transportId]) || 0,
        complaints: complaints[transportId] || ''
      };

      await dispatch(updateTransport({ 
        id: transportId, 
        transportData 
      })).unwrap();

      toast.success('Transport updated successfully!');
      setEditingTransportId(null);
      
      // Refresh the table data
      if (isManagerView) {
        fetchManagerTransports();
      } else {
        fetchBranchTransports();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update transport');
    }
  };

  // Server-side pagination - use transports directly as they're already paginated
  const currentItems = transports;

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + transports.length, totalItems);

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

  const getStatusStyles = (transport) => {
    const isDelivered = transport.receivedQuantity !== undefined && transport.receivedQuantity !== null;
    const lightStyles = {
      delivered: 'bg-green-100 text-green-800 border-green-200',
      inTransit: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    const darkStyles = {
      delivered: 'bg-green-900/30 text-green-300 border-green-700',
      inTransit: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
    };
    const styles = isDark ? darkStyles : lightStyles;
    return isDelivered ? styles.delivered : styles.inTransit;
  };

  const getStatusText = (transport) => {
    if (transport.receivedQuantity !== undefined && transport.receivedQuantity !== null) {
      return 'Delivered';
    }
    return 'In Transit';
  };

  const getStatusIcon = (transport) => {
    if (transport.receivedQuantity !== undefined && transport.receivedQuantity !== null) {
      return <CheckCircle className="w-3 h-3" />;
    }
    return <Clock className="w-3 h-3" />;
  };

  // CSV Export Function - exports current page data
  const downloadCSV = () => {
    if (transports.length === 0) {
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
        'From Location',
        'To Location',
        'Sent Quantity',
        'Received Quantity',
        'Complaints',
        'Status',
        'Transport ID',
        'Branch ID',
        'Created At'
      ];

      const csvRows = transports.map(transport => [
        escapeCSV(new Date(transport.createdAt).toLocaleDateString('en-US')),
        escapeCSV(transport.stockRequest?.productName || 'Unknown'),
        escapeCSV(transport.from || 'N/A'),
        escapeCSV(transport.to || 'N/A'),
        escapeCSV(transport.quantity || '0'),
        escapeCSV(transport.receivedQuantity || '0'),
        escapeCSV(transport.complaints || 'N/A'),
        escapeCSV(getStatusText(transport)),
        escapeCSV(transport._id || 'N/A'),
        escapeCSV(transport.branchId || branchOwnerId || 'N/A'),
        escapeCSV(new Date(transport.createdAt).toISOString())
      ]);

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary
      csvContent.push('');
      csvContent.push('Summary');
      csvContent.push(`Total Records (Current Page),${transports.length}`);
      csvContent.push(`Delivered (Current Page),${(transports || []).filter(t => t.receivedQuantity !== undefined && t.receivedQuantity !== null).length}`);
      csvContent.push(`In Transit (Current Page),${(transports || []).filter(t => t.receivedQuantity === undefined || t.receivedQuantity === null).length}`);
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
      
      if (!isManagerView && locationFilter !== 'all') {
        csvContent.push(`Location Filter,${locationFilter}`);
      }
      
      if (!isManagerView && searchTerm) {
        csvContent.push(`Search Term,${searchTerm}`);
      }
      
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `transport-records-${branchOwnerId || 'branch'}-page${currentPage}-${date}.csv`;
      
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
    setLocationFilter('all');
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

  if (loading && transports.length === 0) {
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
            Loading transport records...
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
              <Truck className={`w-5 h-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {isManagerView ? 'Transport Overview' : 'Transport History'}
              </h2>
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Showing {transports.length} of {totalItems} transport{totalItems !== 1 ? 's' : ''}
                {!isManagerView && (dateFilter.type !== 'all' || statusFilter !== 'all' || locationFilter !== 'all' || searchTerm) && ' (filtered)'}
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
                  placeholder="Search transports..."
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
                disabled={transports.length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                } ${transports.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Location
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    isDark
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Locations</option>
                  <option value="from">From Location</option>
                  <option value="to">To Location</option>
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
                <Truck className={`w-4 h-4 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Transports (Page)
                </p>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {transports.length}
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
                  Delivered
                </p>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {(transports || []).filter(t => t.receivedQuantity !== undefined && t.receivedQuantity !== null).length}
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
                  In Transit
                </p>
                <p className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {(transports || []).filter(t => t.receivedQuantity === undefined || t.receivedQuantity === null).length}
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
                Transport Details
              </th>
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
            {currentItems.map((transport) => (
              <tr 
                key={transport._id}
                className={`transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700/30'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Transport Details */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {new Date(transport.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          From:
                        </span>
                        <span className={`text-xs font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {transport.from || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          To:
                        </span>
                        <span className={`text-xs font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {transport.to || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Product */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Package className={`w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {transport.stockRequest?.productName || 'Unknown Product'}
                    </span>
                  </div>
                </td>

                {/* Quantity */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {/* Sent Quantity */}
                    <div>
                      <span className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Sent:
                      </span>
                      <span className={`text-sm font-medium ml-1 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {transport.quantity || 0}
                      </span>
                    </div>
                    
                    {/* Received Quantity */}
                    <div>
                      <span className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Received:
                      </span>
                      {editingTransportId === transport._id ? (
                        <input
                          type="number"
                          min="0"
                          max={transport.quantity}
                          value={receivedQuantities[transport._id] || ''}
                          onChange={(e) => setReceivedQuantities(prev => ({
                            ...prev,
                            [transport._id]: e.target.value
                          }))}
                          className={`ml-1 w-20 px-2 py-1 text-sm rounded border ${
                            isDark
                              ? 'bg-slate-600 border-slate-500 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      ) : (
                        <span className={`text-sm font-medium ml-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {transport.receivedQuantity || 0}
                        </span>
                      )}
                    </div>

                    {/* Complaints */}
                    <div>
                      <span className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Complaints:
                      </span>
                      {editingTransportId === transport._id ? (
                        <textarea
                          value={complaints[transport._id] || ''}
                          onChange={(e) => setComplaints(prev => ({
                            ...prev,
                            [transport._id]: e.target.value
                          }))}
                          placeholder="Enter complaints..."
                          rows="2"
                          className={`ml-1 w-full px-2 py-1 text-sm rounded border ${
                            isDark
                              ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      ) : (
                        <span className={`text-sm font-medium ml-1 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {transport.complaints || 'No complaints'}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${getStatusStyles(transport)}`}>
                    {getStatusIcon(transport)}
                    {getStatusText(transport)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  {!isManagerView && (
                    <div className="flex items-center gap-2">
                      {editingTransportId === transport._id ? (
                        <>
                          <button
                            onClick={() => handleUpdateTransport(transport._id)}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-3 h-3" />
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingTransportId(null)}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditingTransportId(transport._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {currentItems.length === 0 && !loading && (
        <div className="py-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <Truck className={`w-16 h-16 mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              No Transport Records Found
            </h3>
            <p className={`text-sm max-w-md mx-auto ${
              isDark ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {!isManagerView && (dateFilter.type !== 'all' || statusFilter !== 'all' || locationFilter !== 'all' || searchTerm)
                ? 'Try adjusting your filters to see more results.'
                : 'Transport records will appear here once they are created.'}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {currentItems.length > 0 && (
        <div className={`px-6 py-4 border-t ${
          isDark ? 'border-slate-700/50' : 'border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Show
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
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                  disabled={page === '...'}
                  className={`min-w-[2rem] px-2 py-1 rounded text-sm font-medium ${
                    page === currentPage
                      ? isDark
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${page === '...' ? 'cursor-default' : ''}`}
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
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
  );
};

export default TransportTable;