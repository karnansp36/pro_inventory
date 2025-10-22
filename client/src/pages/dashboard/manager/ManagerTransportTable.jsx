// client/src/components/tables/ManagerTransportTable.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getTransportsByManager,
  setFilters,
  clearFilters 
} from '../../../store/slices/transportSlice';
import {
  Search,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Truck,
  Calendar,
  X,
  Package
} from 'lucide-react';

const ManagerTransportTable = ({ 
  transports, 
  loading, 
  error, 
  totalItems, 
  currentPage, 
  totalPages,
  managerId 
}) => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.transport);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: 'all',
    searchTerm: '',
    dateFilter: {
      type: 'all',
      startDate: '',
      endDate: ''
    }
  });

  // Sync local filters with Redux
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (receivedQuantity, quantity) => {
    if (receivedQuantity === quantity) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (receivedQuantity > 0) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Get status text
  const getStatusText = (receivedQuantity, quantity) => {
    if (receivedQuantity === quantity) {
      return 'Completed';
    } else if (receivedQuantity > 0) {
      return 'Partially Received';
    } else {
      return 'Pending';
    }
  };

  // Apply filters
  const applyFilters = () => {
    dispatch(setFilters(localFilters));
    dispatch(getTransportsByManager({ 
      managerId, 
      filters: localFilters,
      page: 1,
      limit: itemsPerPage
    }));
    setShowFilters(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    dispatch(clearFilters());
    setLocalFilters({
      status: 'all',
      searchTerm: '',
      dateFilter: {
        type: 'all',
        startDate: '',
        endDate: ''
      }
    });
    dispatch(getTransportsByManager({ 
      managerId, 
      filters: {},
      page: 1,
      limit: itemsPerPage
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    dispatch(getTransportsByManager({ 
      managerId, 
      filters,
      page,
      limit: itemsPerPage
    }));
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    dispatch(getTransportsByManager({ 
      managerId, 
      filters,
      page: 1,
      limit: newLimit
    }));
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
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      const headers = [
        'Product Name',
        'Branch',
        'Quantity',
        'Received Quantity',
        'Bundle Size',
        'Status',
        'From Location',
        'To Location',
        'Created Date'
      ];

      const csvData = transports.map(transport => [
        escapeCSV(transport.stockRequest?.productName || 'N/A'),
        escapeCSV(transport.stockRequest?.branchOwner?.name || 'N/A'),
        escapeCSV(transport.quantity),
        escapeCSV(transport.receivedQuantity || 0),
        escapeCSV(transport.bundleSize),
        escapeCSV(getStatusText(transport.receivedQuantity, transport.quantity)),
        escapeCSV(transport.from),
        escapeCSV(transport.to),
        escapeCSV(formatDate(transport.createdAt))
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transport-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV exported successfully');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Excel Export Function
  const downloadExcel = () => {
    if (transports.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // For Excel export, we'll create a simple HTML table that can be opened in Excel
      const tableHeaders = [
        'Product Name',
        'Branch',
        'Quantity',
        'Received Quantity',
        'Bundle Size',
        'Status',
        'From Location',
        'To Location',
        'Created Date'
      ];

      const tableRows = transports.map(transport => [
        transport.stockRequest?.productName || 'N/A',
        transport.stockRequest?.branchOwner?.name || 'N/A',
        transport.quantity,
        transport.receivedQuantity || 0,
        transport.bundleSize,
        getStatusText(transport.receivedQuantity, transport.quantity),
        transport.from,
        transport.to,
        formatDate(transport.createdAt)
      ]);

      let htmlContent = `
        <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #f3f4f6; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #d1d5db; }
            td { padding: 8px; border: 1px solid #d1d5db; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows.map(row => 
                `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transport-data-${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Excel file exported successfully');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const newFilters = { ...localFilters, searchTerm: e.target.value };
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
    dispatch(getTransportsByManager({ 
      managerId, 
      filters: newFilters,
      page: 1,
      limit: itemsPerPage
    }));
  };

  // Loading state
  if (loading && transports.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading transport data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-red-600">
          <p>Error loading transport data: {error}</p>
          <button
            onClick={() => dispatch(getTransportsByManager({ managerId, page: 1, limit: itemsPerPage }))}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Search and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={localFilters.searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.status !== 'all' || filters.dateFilter.type !== 'all') && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Export Button */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={downloadCSV}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-200"
                >
                  Export as CSV
                </button>
                <button
                  onClick={downloadExcel}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  Export as Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="partial">Partially Received</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Date Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={localFilters.dateFilter.type}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  dateFilter: { ...localFilters.dateFilter, type: e.target.value }
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {localFilters.dateFilter.type === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={localFilters.dateFilter.startDate}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      dateFilter: { ...localFilters.dateFilter, startDate: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={localFilters.dateFilter.endDate}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      dateFilter: { ...localFilters.dateFilter, endDate: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.status !== 'all' || filters.searchTerm || filters.dateFilter.type !== 'all') && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Status: {filters.status}
              <button
                onClick={() => {
                  const newFilters = { ...localFilters, status: 'all' };
                  setLocalFilters(newFilters);
                  dispatch(setFilters(newFilters));
                }}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Search: {filters.searchTerm}
              <button
                onClick={() => {
                  const newFilters = { ...localFilters, searchTerm: '' };
                  setLocalFilters(newFilters);
                  dispatch(setFilters(newFilters));
                }}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.dateFilter.type !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Date: {filters.dateFilter.type}
              <button
                onClick={() => {
                  const newFilters = {
                    ...localFilters,
                    dateFilter: { type: 'all', startDate: '', endDate: '' }
                  };
                  setLocalFilters(newFilters);
                  dispatch(setFilters(newFilters));
                }}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Received
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bundle Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transports.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300 mb-2" />
                    <p>No transport data found</p>
                    {Object.values(filters).some(filter => 
                      filter !== 'all' && filter !== '' && 
                      !(typeof filter === 'object' && filter.type === 'all')
                    ) && (
                      <button
                        onClick={clearAllFilters}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Clear filters to see all data
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              transports.map((transport) => (
                <tr key={transport._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transport.stockRequest?.productName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transport.stockRequest?.branchOwner?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {transport.stockRequest?.branchOwner?.email || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transport.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transport.receivedQuantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transport.bundleSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(transport.receivedQuantity, transport.quantity)}`}>
                      {getStatusText(transport.receivedQuantity, transport.quantity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-gray-400" />
                        <span>{transport.from}</span>
                      </div>
                      <div className="text-xs text-gray-500">→ {transport.to}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(transport.createdAt)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transports.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span> results
          </div>

          <div className="flex items-center gap-2">
            {/* Items per page selector */}
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

export default ManagerTransportTable;