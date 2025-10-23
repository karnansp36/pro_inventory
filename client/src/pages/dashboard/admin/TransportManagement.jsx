// pages/admin/TransportManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
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
  User,
  Plus
} from 'lucide-react';
import { getTransports, createTransport } from '../../../store/slices/transportSlice';
import { getStockRequests } from '../../../store/slices/stockRequestsSlice';
import { useTheme } from '../../../context/ThemeContext';
import TransportForm from '../../../components/forms/TransportForm';
import { toast } from 'react-toastify';

const TransportManagement = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const { transport: transports, totalItems, loading, error } = useSelector((state) => state.transport);
  const { stockRequests } = useSelector((state) => state.stockRequests || {});
  const { user } = useSelector((state) => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [initialStockRequest, setInitialStockRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filters, setFilters] = useState({
    managerName: '',
    status: 'all',
    search: '',
    dateFilter: 'all',
    startDate: '',
    endDate: ''
  });

  const brandOwnerId = user?._id;

  useEffect(() => {
    if (brandOwnerId) {
      dispatch(getTransports({ 
        page: currentPage, 
        limit: itemsPerPage, 
        filters 
      }));
    }
    dispatch(getStockRequests());
  }, [dispatch, brandOwnerId, currentPage, itemsPerPage, filters]);

  useEffect(() => {
    if (location.state && location.state.stockRequest) {
      setInitialStockRequest(location.state.stockRequest);
      setShowModal(true);
    }
  }, [location.state]);

  const handleAdd = () => {
    setInitialStockRequest(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleFormSubmit = (formData) => {
    dispatch(createTransport(formData)).then((res) => {
      if (!res.error) {
        setShowModal(false);
        // Refresh the table
        if (brandOwnerId) {
          dispatch(getTransportsByBrandOwner({ 
            brandOwnerId, 
            page: currentPage, 
            limit: itemsPerPage, 
            filters 
          }));
        }
      }
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      managerName: '',
      status: 'all',
      search: '',
      dateFilter: 'all',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + transports.length, totalItems);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
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
    const receivedQty = transport.receivedQuantity || 0;
    const totalQty = transport.quantity || 0;
    
    if (receivedQty === totalQty) {
      return isDark
        ? 'bg-green-900/30 text-green-300 border-green-700'
        : 'bg-green-100 text-green-800 border-green-200';
    } else if (receivedQty > 0) {
      return isDark
        ? 'bg-blue-900/30 text-blue-300 border-blue-700'
        : 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      return isDark
        ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700'
        : 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (transport) => {
    const receivedQty = transport.receivedQuantity || 0;
    const totalQty = transport.quantity || 0;
    
    if (receivedQty === totalQty) return 'Delivered';
    if (receivedQty > 0) return 'Partially Received';
    return 'In Transit';
  };

  const getStatusIcon = (transport) => {
    const receivedQty = transport.receivedQuantity || 0;
    const totalQty = transport.quantity || 0;
    
    if (receivedQty === totalQty) return <CheckCircle className="w-3 h-3" />;
    if (receivedQty > 0) return <Clock className="w-3 h-3" />;
    return <Truck className="w-3 h-3" />;
  };

  // CSV Export Function
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
        'Manager',
        'Branch',
        'Product Name',
        'From Location',
        'To Location',
        'Sent Quantity',
        'Received Quantity',
        'Status',
        'Transport ID',
        'Created At'
      ];

      const csvRows = transports.map(transport => [
        escapeCSV(new Date(transport.createdAt).toLocaleDateString('en-US')),
        escapeCSV(transport.stockRequest?.branchOwner?.assignedManager?.name || 'N/A'),
        escapeCSV(transport.stockRequest?.branchOwner?.name || 'N/A'),
        escapeCSV(transport.stockRequest?.productName || 'Unknown'),
        escapeCSV(transport.from || 'N/A'),
        escapeCSV(transport.to || 'N/A'),
        escapeCSV(transport.quantity || '0'),
        escapeCSV(transport.receivedQuantity || '0'),
        escapeCSV(getStatusText(transport)),
        escapeCSV(transport._id || 'N/A'),
        escapeCSV(new Date(transport.createdAt).toISOString())
      ]);

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary
      csvContent.push('');
      csvContent.push('Summary');
      csvContent.push(`Total Records (Current Page),${transports.length}`);
      csvContent.push(`Total Records (All Pages),${totalItems}`);
      csvContent.push(`Page,${currentPage} of ${totalPages}`);
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `transport-records-admin-page${currentPage}-${date}.csv`;
      
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

  const exportFormats = [
    { 
      key: 'csv', 
      label: 'CSV (Current Page)', 
      color: 'bg-blue-500 hover:bg-blue-600',
      handler: downloadCSV
    }
  ];

  const dateFilters = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Last 7 Days' },
    { key: 'month', label: 'Last 30 Days' },
    { key: 'custom', label: 'Custom Range' }
  ];

  // Calculate statistics
  const totalTransports = transports?.length || 0;
  const inTransit = transports?.filter(t => (t.receivedQuantity || 0) === 0).length || 0;
  const delivered = transports?.filter(t => (t.receivedQuantity || 0) === (t.quantity || 0)).length || 0;
  const partiallyReceived = transports?.filter(t => (t.receivedQuantity || 0) > 0 && (t.receivedQuantity || 0) < (t.quantity || 0)).length || 0;

  if (!brandOwnerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Truck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Brand owner ID not found</p>
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
            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Transport Management
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Monitor and manage all transport operations across your branches
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold text-white transition-all duration-200 backdrop-blur-sm border border-white/30 hover:border-white/40"
              >
                <Plus className="w-5 h-5" />
                <span>Create Transport</span>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Live Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
                  Total Transports
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  isDark ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  {totalItems}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Truck className={`h-8 w-8 ${
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
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  In Transit
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  isDark ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  {inTransit}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
              }`}>
                <Clock className={`h-8 w-8 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
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
                  Partially Received
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  isDark ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  {partiallyReceived}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}>
                <Package className={`h-8 w-8 ${
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
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Delivered
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  isDark ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  {delivered}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <CheckCircle className={`h-8 w-8 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Container */}
        <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
            : 'bg-white border border-gray-200 shadow-lg'
        }`}>
          {/* Table Header */}
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
                    All Transports
                  </h2>
                  <p className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Showing {transports.length} of {totalItems} transport{totalItems !== 1 ? 's' : ''}
                    {(filters.managerName || filters.status !== 'all' || filters.search || filters.dateFilter !== 'all') && ' (filtered)'}
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
                    placeholder="Search transports..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
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
                  {/* Manager Filter */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Manager
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <input
                        type="text"
                        placeholder="Filter by manager..."
                        value={filters.managerName}
                        onChange={(e) => handleFilterChange('managerName', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded border text-sm ${
                          isDark
                            ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className={`w-full px-3 py-2 rounded border text-sm ${
                        isDark
                          ? 'bg-slate-600 border-slate-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">All Status</option>
                      <option value="in-transit">In Transit</option>
                      <option value="partial">Partially Received</option>
                      <option value="completed">Delivered</option>
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
                          onClick={() => handleFilterChange('dateFilter', filter.key)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                            filters.dateFilter === filter.key
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
                    {filters.dateFilter === 'custom' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
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
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
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

                {/* Apply Filters Button */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowFilters(false)}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      isDark
                        ? 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table Content */}
          {loading && transports.length === 0 ? (
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
          ) : (
            <>
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
                        Manager
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Branch
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Product
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        From
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        To
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Sent Qty
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Received Qty
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
                    {transports.length > 0 ? (
                      transports.map((transport, index) => (
                        <tr 
                          key={transport._id || index}
                          className={`transition-colors ${
                            isDark
                              ? 'hover:bg-slate-700/30'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className={`px-6 py-4 text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            {transport.createdAt ? new Date(transport.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className={`px-6 py-4 text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            <div className="flex items-center gap-2">
                              <User className={`w-4 h-4 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              {transport.stockRequest?.branchOwner?.assignedManager?.name || 'N/A'}
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            {transport.stockRequest?.branchOwner?.name || 'N/A'}
                          </td>
                          <td className={`px-6 py-4 text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Package className={`w-4 h-4 ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`} />
                              {transport.stockRequest?.productName || 'Unknown'}
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            {transport.from || 'N/A'}
                          </td>
                          <td className={`px-6 py-4 text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-900'
                          }`}>
                            {transport.to || 'N/A'}
                          </td>
                          <td className={`px-6 py-4 text-sm font-medium ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {transport.quantity || '0'}
                          </td>
                          <td className={`px-6 py-4 text-sm font-medium ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {transport.receivedQuantity || '0'}
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusStyles(transport)}`}>
                              {getStatusIcon(transport)}
                              {getStatusText(transport)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td 
                          colSpan="9"
                          className={`px-6 py-12 text-center ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Truck className={`w-12 h-12 mb-4 ${
                              isDark ? 'text-gray-600' : 'text-gray-400'
                            }`} />
                            <p className="text-sm font-medium mb-1">No transport records found</p>
                            <p className="text-xs">
                              {Object.values(filters).some(value => value && value !== 'all') 
                                ? 'Try adjusting your filters to see more results'
                                : 'Transport records will appear here once created'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className={`px-6 py-4 border-t ${
                  isDark ? 'border-slate-700/50' : 'border-gray-200'
                }`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Show:
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
                        <option value={100}>100</option>
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
                        className={`p-2 rounded transition-colors ${
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
                        className={`p-2 rounded transition-colors ${
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
                          <React.Fragment key={index}>
                            {page === '...' ? (
                              <span className={`px-3 py-1 text-sm ${
                                isDark ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                ...
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? isDark
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-blue-500 text-white'
                                    : isDark
                                    ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Next Page */}
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded transition-colors ${
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
                        className={`p-2 rounded transition-colors ${
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
            </>
          )}
        </div>
      </div>

      {/* Modal for Add Transport */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border transform transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-gray-200'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              isDark ? 'border-slate-800' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${
                isDark ? 'text-slate-100' : 'text-gray-900'
              }`}>
                Create Transport
              </h2>
              <button
                onClick={handleModalClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-300'
                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <TransportForm
                onSubmit={handleFormSubmit}
                onCancel={handleModalClose}
                loading={loading}
                stockRequests={stockRequests}
                initialStockRequest={initialStockRequest}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportManagement;