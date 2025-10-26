// components/branch-owner/SalesTable.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
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
  Calendar as CalendarIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  FileText,
  BarChart3,
  RefreshCw,
  Copy,
  CheckCircle2
} from 'lucide-react';

const SalesTable = ({ 
  branchOwnerId, 
  salesData = null,
  totalItems: propTotalItems = 0,
  isManagerView = false,
  filters: propFilters = {},
  currentPage: propCurrentPage = 1,
  itemsPerPage: propItemsPerPage = 10,
  onPageChange = null,
  onItemsPerPageChange = null,
  loading: propLoading = false,
  onRefresh = null
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [copiedRow, setCopiedRow] = useState(null);
  const { theme } = useTheme();

  const dailyReports = Array.isArray(salesData) ? salesData : [];
  const totalItems = dailyReports.length;
  const loading = propLoading;

  useEffect(() => {
    if (isManagerView) {
      setCurrentPage(propCurrentPage);
      setItemsPerPage(propItemsPerPage);
    }
  }, [propCurrentPage, propItemsPerPage, isManagerView]);

  // Enhanced filtering with date range
  const filteredReports = useMemo(() => {
    return dailyReports.filter(report => {
      const matchesSearch = !searchTerm || 
        report.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.gpay?.toString().includes(searchTerm) ||
        report.card?.toString().includes(searchTerm) ||
        report.cash?.toString().includes(searchTerm) ||
        report.expenses?.toString().includes(searchTerm);
      
      const matchesDate = !dateFilter || report.date === dateFilter;
      
      // Date range filtering
      let matchesDateRange = true;
      if (dateRangeStart || dateRangeEnd) {
        const reportDate = new Date(report.date);
        if (dateRangeStart) {
          matchesDateRange = matchesDateRange && reportDate >= new Date(dateRangeStart);
        }
        if (dateRangeEnd) {
          matchesDateRange = matchesDateRange && reportDate <= new Date(dateRangeEnd);
        }
      }
      
      return matchesSearch && matchesDate && matchesDateRange;
    });
  }, [dailyReports, searchTerm, dateFilter, dateRangeStart, dateRangeEnd]);

  // Sorting functionality
  const sortedReports = useMemo(() => {
    const sorted = [...filteredReports];
    sorted.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'gpay':
        case 'card':
        case 'cash':
        case 'expenses':
          aValue = Number(a[sortField]) || 0;
          bValue = Number(b[sortField]) || 0;
          break;
        case 'total':
          aValue = (Number(a.gpay) || 0) + (Number(a.card) || 0) + (Number(a.cash) || 0);
          bValue = (Number(b.gpay) || 0) + (Number(b.card) || 0) + (Number(b.cash) || 0);
          break;
        case 'netIncome':
          aValue = ((Number(a.gpay) || 0) + (Number(a.card) || 0) + (Number(a.cash) || 0)) - (Number(a.expenses) || 0);
          bValue = ((Number(b.gpay) || 0) + (Number(b.card) || 0) + (Number(b.cash) || 0)) - (Number(b.expenses) || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredReports, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedReports.length);
  const currentReports = sortedReports.slice(startIndex, endIndex);

  // Calculate totals
  const getTotalCollection = () => {
    return sortedReports.reduce((sum, report) => {
      return sum + (Number(report.gpay) || 0) + (Number(report.card) || 0) + (Number(report.cash) || 0);
    }, 0);
  };

  const getTotalExpenses = () => {
    return sortedReports.reduce((sum, report) => sum + (Number(report.expenses) || 0), 0);
  };

  const getAverageCollection = () => {
    return sortedReports.length > 0 ? getTotalCollection() / sortedReports.length : 0;
  };

  const getAverageExpenses = () => {
    return sortedReports.length > 0 ? getTotalExpenses() / sortedReports.length : 0;
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Row selection
  const toggleRowSelection = (reportId) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(reportId)) {
      newSelection.delete(reportId);
    } else {
      newSelection.add(reportId);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === currentReports.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(currentReports.map(r => r._id || r.id)));
    }
  };

  // Copy row data
  const copyRowData = (report) => {
    const totalCollection = (Number(report.gpay) || 0) + (Number(report.card) || 0) + (Number(report.cash) || 0);
    const netIncome = totalCollection - (Number(report.expenses) || 0);
    
    const text = `Date: ${report.date}
GPay: ₹${(Number(report.gpay) || 0).toFixed(2)}
Card: ₹${(Number(report.card) || 0).toFixed(2)}
Cash: ₹${(Number(report.cash) || 0).toFixed(2)}
Expenses: ₹${(Number(report.expenses) || 0).toFixed(2)}
Total Collection: ₹${totalCollection.toFixed(2)}
Net Income: ₹${netIncome.toFixed(2)}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedRow(report._id || report.id);
      toast.success('Data copied to clipboard!');
      setTimeout(() => setCopiedRow(null), 2000);
    }).catch(() => {
      toast.error('Failed to copy data');
    });
  };

  // Pagination handlers
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

  const handlePageChange = (page) => {
    if (isManagerView && onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (isManagerView && onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    } else {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);
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

  // Enhanced CSV Export
  const downloadCSV = () => {
    if (sortedReports.length === 0) {
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
        'GPay',
        'Card',
        'Cash',
        'Expenses',
        'Total Collection',
        'Net Income'
      ];

      const csvRows = sortedReports.map(report => {
        const totalCollection = (Number(report.gpay) || 0) + (Number(report.card) || 0) + (Number(report.cash) || 0);
        const netIncome = totalCollection - (Number(report.expenses) || 0);
        
        return [
          escapeCSV(report.date),
          escapeCSV((Number(report.gpay) || 0).toFixed(2)),
          escapeCSV((Number(report.card) || 0).toFixed(2)),
          escapeCSV((Number(report.cash) || 0).toFixed(2)),
          escapeCSV((Number(report.expenses) || 0).toFixed(2)),
          escapeCSV(totalCollection.toFixed(2)),
          escapeCSV(netIncome.toFixed(2))
        ];
      });

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Enhanced summary
      csvContent.push('');
      csvContent.push('SUMMARY STATISTICS');
      csvContent.push(`Total Records,${sortedReports.length}`);
      csvContent.push(`Total Collection,₹${getTotalCollection().toFixed(2)}`);
      csvContent.push(`Average Collection,₹${getAverageCollection().toFixed(2)}`);
      csvContent.push(`Total Expenses,₹${getTotalExpenses().toFixed(2)}`);
      csvContent.push(`Average Expenses,₹${getAverageExpenses().toFixed(2)}`);
      csvContent.push(`Net Income,₹${(getTotalCollection() - getTotalExpenses()).toFixed(2)}`);
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);
      csvContent.push(`Export Time,${new Date().toLocaleTimeString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `daily-reports-${branchOwnerId || 'branch'}-${date}.csv`;
      
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

  // Export selected rows
  const exportSelectedRows = () => {
    if (selectedRows.size === 0) {
      toast.error('No rows selected');
      return;
    }

    const selectedData = sortedReports.filter(r => selectedRows.has(r._id || r.id));
    const originalData = sortedReports;
    
    // Temporarily set filtered data for export
    downloadCSV();
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setDateRangeStart('');
    setDateRangeEnd('');
    setCurrentPage(1);
    setSelectedRows(new Set());
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  // Loading state
  if (loading && dailyReports.length === 0) {
    return (
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
            Loading daily reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm'
        : 'bg-white border border-gray-200 shadow-lg'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <Receipt className={`w-5 h-5 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {isManagerView ? 'Daily Reports Overview' : 'Daily Reports'}
              </h2>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Showing {currentReports.length} of {sortedReports.length} report{sortedReports.length !== 1 ? 's' : ''}
                {sortedReports.length !== dailyReports.length && ` (filtered from ${dailyReports.length})`}
                {selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-emerald-100 text-emerald-700'
                  : theme === 'dark'
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={sortedReports.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                } ${sortedReports.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className={`absolute right-0 top-full mt-1 w-64 rounded-lg shadow-lg border z-50 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="p-2">
                      <div className={`px-3 py-2 text-xs font-semibold ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Export Options
                      </div>
                      <button
                        onClick={downloadCSV}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-white font-medium transition-all bg-blue-500 hover:bg-blue-600 mb-1"
                      >
                        <FileText className="w-4 h-4" />
                        Export All to CSV
                      </button>
                      {selectedRows.size > 0 && (
                        <button
                          onClick={exportSelectedRows}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-white font-medium transition-all bg-emerald-500 hover:bg-emerald-600"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Export Selected ({selectedRows.size})
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? 'border-slate-700/50 bg-slate-900/30' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Search
              </label>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search by date, amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* Single Date Filter */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Specific Date
              </label>
              <div className="relative">
                <CalendarIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Date Range Start */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Date From
              </label>
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Date To
              </label>
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || dateFilter || dateRangeStart || dateRangeEnd) && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'border-slate-600 text-gray-400 hover:text-white hover:bg-slate-700'
                      : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className={`px-6 py-4 border-b ${
        theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30'
              : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-emerald-500/30' : 'bg-emerald-200'
              }`}>
                <DollarSign className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'
                }`}>
                  Total Collection
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  ₹{getTotalCollection().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30'
              : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-blue-500/30' : 'bg-blue-200'
              }`}>
                <TrendingUp className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Average Collection
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  ₹{getAverageCollection().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30'
              : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-200'
              }`}>
                <CreditCard className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  Total Expenses
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  ₹{getTotalExpenses().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30'
              : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-orange-500/30' : 'bg-orange-200'
              }`}>
                <BarChart3 className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                }`}>
                  Average Expenses
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                }`}>
                  ₹{getAverageExpenses().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30'
              : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-green-500/30' : 'bg-green-200'
              }`}>
                <DollarSign className={`w-4 h-4 ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-700'
                }`} />
              </div>
              <div>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-700'
                }`}>
                  Net Income
                </p>
                <p className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>
                  ₹{(getTotalCollection() - getTotalExpenses()).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table with sorting */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${
              theme === 'dark'
                ? 'bg-slate-900/50 border-b border-slate-700/50'
                : 'bg-gray-50 border-b border-gray-200'
            }`}>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === currentReports.length && currentReports.length > 0}
                  onChange={toggleAllRows}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  <SortIcon field="date" />
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => handleSort('gpay')}
              >
                <div className="flex items-center gap-2">
                  GPay
                  <SortIcon field="gpay" />
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => handleSort('card')}
              >
                <div className="flex items-center gap-2">
                  Card
                  <SortIcon field="card" />
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => handleSort('cash')}
              >
                <div className="flex items-center gap-2">
                  Cash
                  <SortIcon field="cash" />
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => handleSort('expenses')}
              >
                <div className="flex items-center gap-2">
                  Expenses
                  <SortIcon field="expenses" />
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center gap-2">
                  Total Collection
                  <SortIcon field="total" />
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => handleSort('netIncome')}
              >
                <div className="flex items-center gap-2">
                  Net Income
                  <SortIcon field="netIncome" />
                </div>
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700/50' : 'divide-gray-200'}`}>
            {currentReports.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Receipt className={`w-12 h-12 mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {sortedReports.length === 0 && dailyReports.length > 0 
                        ? 'No reports match your filters' 
                        : 'No daily reports found'
                      }
                    </p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                      {sortedReports.length === 0 && dailyReports.length > 0 
                        ? 'Try adjusting your search or date filters'
                        : 'Daily reports will appear here once created'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentReports.map((report, index) => {
                const reportId = report._id || report.id || `report-${index}`;
                const totalCollection = (Number(report.gpay) || 0) + (Number(report.card) || 0) + (Number(report.cash) || 0);
                const netIncome = totalCollection - (Number(report.expenses) || 0);
                const isSelected = selectedRows.has(reportId);
                const isCopied = copiedRow === reportId;
                
                return (
                  <tr 
                    key={reportId}
                    className={`transition-colors ${
                      isSelected 
                        ? theme === 'dark' 
                          ? 'bg-emerald-500/10' 
                          : 'bg-emerald-50'
                        : theme === 'dark' 
                        ? 'hover:bg-slate-700/30' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRowSelection(reportId)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {report.date ? new Date(report.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      ₹{(Number(report.gpay) || 0).toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      ₹{(Number(report.card) || 0).toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      ₹{(Number(report.cash) || 0).toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      ₹{(Number(report.expenses) || 0).toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      ₹{totalCollection.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-bold ${
                      netIncome >= 0 
                        ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`}>
                      ₹{netIncome.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => copyRowData(report)}
                        className={`p-2 rounded-lg transition-colors ${
                          isCopied
                            ? theme === 'dark'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-green-100 text-green-600'
                            : theme === 'dark'
                            ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                        title="Copy row data"
                      >
                        {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination Footer */}
      {sortedReports.length > 0 && (
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
              <span className="font-medium">{sortedReports.length}</span> entries
            </div>
            
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Rows:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className={`px-3 py-1 rounded-lg border text-sm ${
                  theme === 'dark'
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
            </div>
          </div>

          {/* Right side - Pagination controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white disabled:text-gray-600'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 disabled:text-gray-400'
              } disabled:cursor-not-allowed`}
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white disabled:text-gray-600'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 disabled:text-gray-400'
              } disabled:cursor-not-allowed`}
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className={`min-w-[2.5rem] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? theme === 'dark'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${page === '...' ? 'cursor-default hover:bg-transparent' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white disabled:text-gray-600'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 disabled:text-gray-400'
              } disabled:cursor-not-allowed`}
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white disabled:text-gray-600'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 disabled:text-gray-400'
              } disabled:cursor-not-allowed`}
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTable;