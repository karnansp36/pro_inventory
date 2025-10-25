import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getSalesByBrandOwner } from '../../../store/slices/salesSlice';
import { useTheme } from '../../../context/ThemeContext';
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
  X,
  Plus,
  Building
} from 'lucide-react';

const BrandOwnerSalesManagement = () => {
  const dispatch = useDispatch();
  const { sales, totalItems, loading, error } = useSelector((state) => state.sales);
  const { user: currentUser } = useSelector((state) => state.auth);
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
  const [branchFilter, setBranchFilter] = useState('');
useEffect(() => {
  if (currentUser?._id) {
    // Create clean filters object
    const cleanFilters = {};
    
    // Add search term if exists
    if (searchTerm) {
      cleanFilters.searchTerm = searchTerm;
    }
    
    // Add branch filter if exists
    if (branchFilter) {
      cleanFilters.branchFilter = branchFilter;
    }
    
    // Add date filter if not 'all'
    if (dateFilter.type !== 'all') {
      cleanFilters.dateFilter = dateFilter;
    }

    dispatch(getSalesByBrandOwner({ 
      brandOwnerId: currentUser._id, 
      page: currentPage, 
      limit: itemsPerPage,
      filters: cleanFilters 
    }));
  }
}, [dispatch, currentUser?._id, currentPage, itemsPerPage, searchTerm, dateFilter, branchFilter]);
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + sales.length, totalItems);

  const getTotalSales = () => {
    return sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
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

  const getPaymentMethodBadge = (method) => {
    const colors = {
      dark: {
        Cash: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        Card: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        UPI: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        Online: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      },
      light: {
        Cash: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Card: 'bg-blue-50 text-blue-700 border-blue-200',
        UPI: 'bg-purple-50 text-purple-700 border-purple-200',
        Online: 'bg-orange-50 text-orange-700 border-orange-200',
      }
    };
    
    return colors[theme][method] || colors[theme].Cash;
  };

  // CSV Export Function
  const downloadCSV = () => {
    if (sales.length === 0) {
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
        'Branch Owner',
        'Product Name',
        'Amount ($)',
        'Payment Method',
        'Transaction ID',
        'Created At'
      ];

      const csvRows = sales.map(sale => [
        escapeCSV(new Date(sale.date).toLocaleDateString('en-US')),
        escapeCSV(sale.branchOwner?.name || 'N/A'),
        escapeCSV(sale.productName || 'N/A'),
        escapeCSV(sale.amount?.toFixed(2) || '0.00'),
        escapeCSV(sale.paymentMethod || 'Unknown'),
        escapeCSV(sale._id || 'N/A'),
        escapeCSV(new Date(sale.createdAt || sale.date).toISOString())
      ]);

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary
      csvContent.push('');
      csvContent.push('Summary');
      csvContent.push(`Total Records (Current Page),${sales.length}`);
      csvContent.push(`Total Amount (Current Page),$${getTotalSales().toFixed(2)}`);
      csvContent.push(`Average Sale,$${sales.length > 0 ? (getTotalSales() / sales.length).toFixed(2) : '0.00'}`);
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
      
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `brand-owner-sales-${currentUser?._id || 'brand'}-page${currentPage}-${date}.csv`;
      
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

  const exportFormats = [
    { 
      key: 'csv', 
      label: 'CSV (Current Page)', 
      color: 'bg-blue-500 hover:bg-blue-600',
      handler: downloadCSV
    }
  ];

  if (loading && sales.length === 0) {
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
                Loading sales data...
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
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Brand Owner Sales Management
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Monitor and analyze sales across all your assigned branches
              </p>
            </div>
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
                  <Receipt className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Branch Sales Overview
                  </h2>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Showing {sales.length} of {totalItems} transaction{totalItems !== 1 ? 's' : ''}
                    {(dateFilter.type !== 'all' || searchTerm || branchFilter) && ' (filtered)'}
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
                    placeholder="Search sales..."
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
                    disabled={sales.length === 0}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    } ${sales.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    <DollarSign className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total Sales (Page)
                    </p>
                    <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      ${getTotalSales().toFixed(2)}
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
                    <TrendingUp className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Transactions (Page)
                    </p>
                    <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {sales.length}
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
                    <CreditCard className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Avg. Sale
                    </p>
                    <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${sales.length > 0 ? (getTotalSales() / sales.length).toFixed(2) : '0.00'}
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
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Branch Owner
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Product Name
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Amount
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment
                    </div>
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' ? 'divide-slate-700/50' : 'divide-gray-200'
              }`}>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Receipt className={`w-12 h-12 mb-3 ${
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          No sales records found
                        </p>
                        <p className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {(dateFilter.type !== 'all' || searchTerm || branchFilter) 
                            ? 'Try adjusting your filters' 
                            : 'Sales transactions from your branches will appear here'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale, i) => (
                    <tr
                      key={sale._id || i}
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
                            {new Date(sale.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <span className="text-sm font-medium">
                          {sale.branchOwner?.name || 'N/A'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <span className="text-sm font-medium">
                          {sale.productName || 'N/A'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <span className="text-sm font-semibold">
                          ${sale.amount?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          getPaymentMethodBadge(sale.paymentMethod)
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-bold ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          ${sale.amount?.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {sales.length > 0 && (
            <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
              theme === 'dark'
                ? 'border-slate-700/50 bg-slate-900/30'
                : 'border-gray-200 bg-gray-50'
            }`}>
              {/* Left side - Rows info and per page selector */}
              <div className="flex items-center gap-4">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{endIndex}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> entries
                </div>
                
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    theme === 'dark'
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
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? theme === 'dark'
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous page button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? theme === 'dark'
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                      : theme === 'dark'
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
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? theme === 'dark'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-blue-500 text-white shadow-sm'
                            : theme === 'dark'
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? theme === 'dark'
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last page button */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${
                    currentPage === totalPages
                      ? theme === 'dark'
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 cursor-not-allowed'
                      : theme === 'dark'
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
      </div>
    </div>
  );
};

export default BrandOwnerSalesManagement;