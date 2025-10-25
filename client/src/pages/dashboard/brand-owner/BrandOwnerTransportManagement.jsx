// client/src/pages/dashboard/brand-owner/BrandOwnerTransportManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  getTransportsByBrandOwner, 
  deleteTransport, 
  createTransport, 
  updateTransport 
} from '../../../store/slices/transportSlice';
import { useTheme } from '../../../context/ThemeContext';
import {
  Truck,
  Package,
  Building,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Plus,
  Calendar,
  MapPin
} from 'lucide-react';
import TransportForm from '../../../components/forms/TransportForm';

const BrandOwnerTransportManagement = () => {
  const dispatch = useDispatch();
  const { transport, loading, error, totalItems } = useSelector((state) => state.transport);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for pagination and filters
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
  const [branchFilter, setBranchFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTransport, setEditTransport] = useState(null);

  useEffect(() => {
    if (currentUser?._id) {
      // Create clean filters object
      const cleanFilters = {};
      
      // Add search term if exists
      if (searchTerm) {
        cleanFilters.search = searchTerm;
      }
      
      // Add branch filter if exists
      if (branchFilter) {
        cleanFilters.branchId = branchFilter;
      }
      
      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        cleanFilters.status = statusFilter;
      }
      
      // Add date filter if not 'all'
      if (dateFilter.type !== 'all') {
        cleanFilters.dateFilter = dateFilter;
      }

      dispatch(getTransportsByBrandOwner({ 
        brandOwnerId: currentUser._id, 
        page: currentPage, 
        limit: itemsPerPage,
        filters: cleanFilters 
      }));
    }
  }, [dispatch, currentUser?._id, currentPage, itemsPerPage, searchTerm, dateFilter, statusFilter, branchFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + transport.length, totalItems);

  const handleTransportAdded = () => {
    setShowModal(false);
    setEditTransport(null);
    // Refresh the data
    if (currentUser?._id) {
      dispatch(getTransportsByBrandOwner({ 
        brandOwnerId: currentUser._id, 
        page: currentPage, 
        limit: itemsPerPage
      }));
    }
  };

  const handleEdit = (transport) => {
    setEditTransport(transport);
    setShowModal(true);
  };

  const handleDelete = (transportId) => {
    if (window.confirm('Are you sure you want to delete this transport record?')) {
      dispatch(deleteTransport(transportId)).then(() => {
        // Refresh data after deletion
        if (currentUser?._id) {
          dispatch(getTransportsByBrandOwner({ 
            brandOwnerId: currentUser._id, 
            page: currentPage, 
            limit: itemsPerPage
          }));
        }
      });
    }
  };

  const getStatusBadge = (item) => {
    if (item.receivedQuantity === item.quantity) {
      return { 
        text: 'Completed', 
        class: isDark 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
          : 'bg-green-100 text-green-800 border border-green-200' 
      };
    } else if (item.receivedQuantity > 0) {
      return { 
        text: 'Partial', 
        class: isDark 
          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
          : 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
      };
    } else {
      return { 
        text: 'Pending', 
        class: isDark 
          ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' 
          : 'bg-gray-100 text-gray-800 border border-gray-200' 
      };
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

  // CSV Export Function
  const downloadCSV = () => {
    if (transport.length === 0) {
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
        'Product Name',
        'Quantity',
        'Received Quantity',
        'From',
        'To',
        'Branch Owner',
        'Status',
        'Created Date',
        'Updated Date'
      ];

      const csvRows = transport.map(item => {
        const status = getStatusBadge(item);
        return [
          escapeCSV(item.stockRequest?.productName || 'N/A'),
          escapeCSV(item.quantity),
          escapeCSV(item.receivedQuantity || 0),
          escapeCSV(item.from),
          escapeCSV(item.to),
          escapeCSV(item.stockRequest?.branchOwner?.name || 'N/A'),
          escapeCSV(status.text),
          escapeCSV(new Date(item.createdAt).toLocaleDateString()),
          escapeCSV(new Date(item.updatedAt).toLocaleDateString())
        ];
      });

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary
      csvContent.push('');
      csvContent.push('Summary');
      csvContent.push(`Total Records (Current Page),${transport.length}`);
      csvContent.push(`Total Quantity,${transport.reduce((sum, item) => sum + item.quantity, 0)}`);
      csvContent.push(`Total Received,${transport.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0)}`);
      csvContent.push(`Total Records (All Pages),${totalItems}`);
      csvContent.push(`Page,${currentPage} of ${totalPages}`);
      
      if (dateFilter.type !== 'all') {
        csvContent.push(`Date Filter,${dateFilter.type}`);
        if (dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate) {
          csvContent.push(`Start Date,${dateFilter.startDate}`);
          csvContent.push(`End Date,${dateFilter.endDate}`);
        }
      }
      
      if (searchTerm) {
        csvContent.push(`Search Term,${searchTerm}`);
      }
      
      if (branchFilter) {
        csvContent.push(`Branch Filter,${branchFilter}`);
      }
      
      if (statusFilter !== 'all') {
        csvContent.push(`Status Filter,${statusFilter}`);
      }
      
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `brand-owner-transport-${currentUser?._id || 'brand'}-page${currentPage}-${date}.csv`;
      
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
    setBranchFilter('');
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

  const statusOptions = [
    { key: 'all', label: 'All Status' },
    { key: 'pending', label: 'Pending' },
    { key: 'partial', label: 'Partial' },
    { key: 'completed', label: 'Completed' }
  ];

  const exportFormats = [
    { 
      key: 'csv', 
      label: 'CSV (Current Page)', 
      color: 'bg-blue-500 hover:bg-blue-600',
      handler: downloadCSV
    }
  ];

  if (loading && transport.length === 0) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-xl p-8 transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
              : 'bg-white border border-gray-200 shadow-lg'
          }`}>
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className={`w-12 h-12 animate-spin mb-4 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Loading transport data...
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
            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
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
                Manage transport records for your assigned branches
              </p>
            </div>
            <button
              className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-white/90 flex items-center space-x-2 font-medium transition-all"
              onClick={() => { setEditTransport(null); setShowModal(true); }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Transport</span>
            </button>
          </div>
        </div>

        {/* Main Table Container */}
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
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <Package className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Transport Overview
                  </h2>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Showing {transport.length} of {totalItems} transport record{totalItems !== 1 ? 's' : ''}
                    {(dateFilter.type !== 'all' || searchTerm || branchFilter || statusFilter !== 'all') && ' (filtered)'}
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
                    placeholder="Search transports..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={`pl-10 pr-4 py-2 rounded-lg border transition-colors text-sm ${
                      theme === 'dark'
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
                      ? theme === 'dark'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-500 text-white'
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
                    disabled={transport.length === 0}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    } ${transport.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Export Dropdown Menu */}
                  {showExportMenu && (
                    <div className={`absolute right-0 top-full mt-1 w-56 rounded-lg shadow-lg border z-50 ${
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
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-500 text-white'
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

                  <div className="space-y-4">
                    {/* Status Filter */}
                    <div className="space-y-3">
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className={`w-full px-3 py-1.5 rounded border text-sm ${
                          theme === 'dark'
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                      >
                        {statusOptions.map(option => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Branch Filter */}
                    <div className="space-y-3">
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Branch Owner
                      </label>
                      <input
                        type="text"
                        placeholder="Filter by branch owner name..."
                        value={branchFilter}
                        onChange={(e) => {
                          setBranchFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className={`w-full px-3 py-1.5 rounded border text-sm ${
                          theme === 'dark'
                            ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                      />
                    </div>
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
                      ? 'bg-blue-500/20'
                      : 'bg-blue-100'
                  }`}>
                    <Package className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total Transports (Page)
                    </p>
                    <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {transport.length}
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
                      ? 'bg-green-500/20'
                      : 'bg-green-100'
                  }`}>
                    <Truck className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total Quantity
                    </p>
                    <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {transport.reduce((sum, item) => sum + item.quantity, 0)}
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
                    <MapPin className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Completed Transports
                    </p>
                    <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {transport.filter(item => item.receivedQuantity === item.quantity).length}
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
                    Product
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Quantity
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      From
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      To
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Branch Owner
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Received
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' ? 'divide-slate-700/50' : 'divide-gray-200'
              }`}>
                {transport.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Truck className={`w-12 h-12 mb-3 ${
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          No transport records found
                        </p>
                        <p className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {(dateFilter.type !== 'all' || searchTerm || branchFilter || statusFilter !== 'all') 
                            ? 'Try adjusting your filters' 
                            : 'Transport records will appear here'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transport.map((item, i) => {
                    const status = getStatusBadge(item);
                    return (
                      <tr
                        key={item._id || i}
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
                              theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                            }`} />
                            <span className="text-sm font-medium">
                              {item.stockRequest?.productName || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          <span className="text-sm font-semibold">
                            {item.quantity}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          <span className="text-sm">
                            {item.from}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          <span className="text-sm">
                            {item.to}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          <span className="text-sm">
                            {item.stockRequest?.branchOwner?.name || 'N/A'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          <span className="text-sm font-medium">
                            {item.receivedQuantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            status.class
                          }`}>
                            {status.text}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          <span className="text-xs">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-slate-600 text-gray-400 hover:text-white'
                                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                                  : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {transport.length > 0 && (
            <div className={`px-6 py-4 border-t ${
              theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Showing {startIndex + 1} to {endIndex} of {totalItems} entries
                </div>

                <div className="flex items-center gap-2">
                  {/* Items Per Page */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Show:
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-1 rounded border text-sm ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
                    >
                      {[5, 10, 25, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === 1
                          ? theme === 'dark'
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === 1
                          ? theme === 'dark'
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        disabled={page === '...'}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? theme === 'dark'
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-500 text-white'
                            : page === '...'
                            ? theme === 'dark'
                              ? 'text-gray-500 cursor-default'
                              : 'text-gray-500 cursor-default'
                            : theme === 'dark'
                            ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? theme === 'dark'
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? theme === 'dark'
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transport Form Modal */}
      {showModal && (
        <TransportForm
          transport={editTransport}
          onClose={() => {
            setShowModal(false);
            setEditTransport(null);
          }}
          onTransportAdded={handleTransportAdded}
          onTransportUpdated={handleTransportAdded}
        />
      )}
    </div>
  );
};

export default BrandOwnerTransportManagement;