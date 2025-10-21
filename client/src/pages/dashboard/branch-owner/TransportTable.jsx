// TransportTable.jsx - Fixed complete component
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { getTransportsByBranch } from '../../../store/slices/transportSlice';
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
  Clock
} from 'lucide-react';

const TransportTable = ({ branchOwnerId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dispatch = useDispatch();
  const { transport: transports, totalItems, loading, error } = useSelector((state) => state.transport);
  
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

  // Filter transports based on search and filters
  const filteredTransports = transports.filter(transport => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        transport.stockRequest?.productName?.toLowerCase().includes(searchLower) ||
        transport.from?.toLowerCase().includes(searchLower) ||
        transport.to?.toLowerCase().includes(searchLower) ||
        transport.quantity?.toString().includes(searchTerm) ||
        transport.receivedQuantity?.toString().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isDelivered = transport.receivedQuantity !== undefined && transport.receivedQuantity !== null;
      if (statusFilter === 'delivered' && !isDelivered) return false;
      if (statusFilter === 'in-transit' && isDelivered) return false;
    }

    // Location filter
    if (locationFilter !== 'all') {
      if (locationFilter === 'from' && !transport.from?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (locationFilter === 'to' && !transport.to?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    }

    // Date filter
    if (dateFilter.type !== 'all') {
      const transportDate = new Date(transport.createdAt);
      const today = new Date();
      
      switch (dateFilter.type) {
        case 'today':
          return transportDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return transportDate >= weekAgo && transportDate <= today;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return transportDate >= monthAgo && transportDate <= today;
        case 'custom':
          if (dateFilter.startDate && dateFilter.endDate) {
            const start = new Date(dateFilter.startDate);
            const end = new Date(dateFilter.endDate);
            end.setHours(23, 59, 59, 999);
            return transportDate >= start && transportDate <= end;
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
      dispatch(getTransportsByBranch({ branchId: branchOwnerId, page: currentPage, limit: itemsPerPage }));
    }
  }, [dispatch, branchOwnerId, currentPage, itemsPerPage]);

  // CSV Export Function
  const downloadCSV = () => {
    if (filteredTransports.length === 0) {
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
        'From Location',
        'To Location',
        'Sent Quantity',
        'Received Quantity',
        'Status',
        'Transport ID',
        'Branch ID',
        'Created At'
      ];

      // Convert transports data to CSV rows
      const csvRows = filteredTransports.map(transport => [
        escapeCSV(new Date(transport.createdAt).toLocaleDateString('en-US')),
        escapeCSV(transport.stockRequest?.productName || 'Unknown'),
        escapeCSV(transport.from || 'N/A'),
        escapeCSV(transport.to || 'N/A'),
        escapeCSV(transport.quantity || '0'),
        escapeCSV(transport.receivedQuantity || '0'),
        escapeCSV(getStatusText(transport)),
        escapeCSV(transport._id || 'N/A'),
        escapeCSV(transport.branchId || branchOwnerId || 'N/A'),
        escapeCSV(new Date(transport.createdAt).toISOString())
      ]);

      // Build CSV content
      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary section if there are filters applied
      if (dateFilter.type !== 'all' || searchTerm || statusFilter !== 'all' || locationFilter !== 'all') {
        csvContent.push('');
        csvContent.push('Summary');
        csvContent.push(`Total Records,${filteredTransports.length}`);
        csvContent.push(`Delivered,${filteredTransports.filter(t => t.receivedQuantity !== undefined && t.receivedQuantity !== null).length}`);
        csvContent.push(`In Transit,${filteredTransports.filter(t => t.receivedQuantity === undefined || t.receivedQuantity === null).length}`);
        csvContent.push(`Total Sent Quantity,${filteredTransports.reduce((sum, t) => sum + (t.quantity || 0), 0)}`);
        csvContent.push(`Total Received Quantity,${filteredTransports.reduce((sum, t) => sum + (t.receivedQuantity || 0), 0)}`);
        
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
        
        if (locationFilter !== 'all') {
          csvContent.push(`Location Filter,${locationFilter}`);
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
      const filename = `transport-records-${branchOwnerId || 'branch'}-${date}.csv`;
      
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
    setLocationFilter('all');
    setShowFilters(false);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransports.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const getStatusColor = (transport) => {
    if (transport.receivedQuantity !== undefined && transport.receivedQuantity !== null) {
      return isDark 
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    return isDark
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      : 'bg-amber-100 text-amber-700 border-amber-200';
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

  if (loading) {
    return (
      <div className={`rounded-2xl p-8 ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      } shadow-xl`}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className={`mt-4 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Loading transport records...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-6 ${
        isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
      } shadow-xl`}>
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden ${
      isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
    } shadow-xl`}>
      {/* Table Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Truck className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Transport Receipts
              </h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {filteredTransports.length} of {totalItems} record{totalItems !== 1 ? 's' : ''}
                {(dateFilter.type !== 'all' || statusFilter !== 'all' || locationFilter !== 'all' || searchTerm) && ' (filtered)'}
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
                disabled={filteredTransports.length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                } ${filteredTransports.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="space-y-3">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Location Type
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
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
        {filteredTransports.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'bg-slate-700/50' : 'bg-gray-100'}>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </div>
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Product
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  From
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  To
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Sent Qty
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Received Qty
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {currentItems.map((transport, i) => (
                <tr 
                  key={transport._id || i}
                  className={`transition-colors duration-150 ${
                    isDark 
                      ? 'hover:bg-slate-700/50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                      {new Date(transport.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <Package className="w-4 h-4" />
                      </div>
                      {transport.stockRequest?.productName || 'N/A'}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {transport.from}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {transport.to}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {transport.quantity}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    {transport.receivedQuantity ? (
                      <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {transport.receivedQuantity}
                      </span>
                    ) : (
                      <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                      getStatusColor(transport)
                    }`}>
                      {getStatusIcon(transport)}
                      {getStatusText(transport)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className={`p-4 rounded-full mb-4 ${
              isDark ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <Truck className={`w-12 h-12 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
              {transports.length === 0 ? 'No Transport Records' : 'No Matching Transports Found'}
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {transports.length === 0 ? 'There are no transport records to display at this time.' : 'Try adjusting your filters to find transport records.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {filteredTransports.length > 0 && (
        <div className={`px-6 py-4 border-t ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results info */}
            <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(indexOfLastItem, filteredTransports.length)}</span> of{' '}
              <span className="font-semibold">{filteredTransports.length}</span> results
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              {/* First page button */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === 1
                    ? isDark
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>

              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === 1
                    ? isDark
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
                      <span key={`ellipsis-${pageNum}`} className={`px-3 py-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? isDark
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-emerald-600 text-white shadow-lg'
                          : isDark
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
                className={`p-2 rounded-lg transition-all ${
                  currentPage === totalPages
                    ? isDark
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Last page button */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all ${
                  currentPage === totalPages
                    ? isDark
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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

export default TransportTable;