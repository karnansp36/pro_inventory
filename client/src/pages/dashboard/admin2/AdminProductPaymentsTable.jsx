import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { 
  getProductPaymentsByUserId, 
  updateProductPayment, 
  deleteProductPayment,
  setFilters,
  setCurrentPage,
  setItemsPerPage,
  clearFilters
} from '../../../store/slices/productPaymentsSlice';
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
  Edit,
  Trash2,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useParams } from 'react-router-dom'; // Add this import

const AdminProductPaymentsTable = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dispatch = useDispatch();
  const { 
    productPayments, 
    totalItems, 
    loading, 
    error,
    currentPage,
    itemsPerPage,
    filters,
    summary
  } = useSelector((state) => state.productPayments);
  const { managerId } = useParams();

  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    dispatch(getProductPaymentsByUserId({ 
      userId: managerId,
      page: currentPage, 
      limit: itemsPerPage,
      filters 
    }));
  }, [dispatch, currentPage, itemsPerPage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + productPayments.length, totalItems);

  const handlePageChange = (pageNumber) => {
    dispatch(setCurrentPage(pageNumber));
  };

  const handleItemsPerPageChange = (value) => {
    dispatch(setItemsPerPage(value));
  };

  const handleFilterChange = (filterUpdates) => {
    dispatch(setFilters(filterUpdates));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setShowFilters(false);
  };

  const getStatusStyles = (status) => {
    const lightStyles = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Partial: 'bg-orange-100 text-orange-800 border-orange-200',
      Completed: 'bg-green-100 text-green-800 border-green-200',
    };
    const darkStyles = {
      Pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      Partial: 'bg-orange-900/30 text-orange-300 border-orange-700',
      Completed: 'bg-green-900/30 text-green-300 border-green-700',
    };
    const styles = isDark ? darkStyles : lightStyles;
    return styles[status] || (isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200');
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: <Clock className="w-3 h-3" />,
      Partial: <AlertCircle className="w-3 h-3" />,
      Completed: <CheckCircle className="w-3 h-3" />,
    };
    return icons[status] || <Clock className="w-3 h-3" />;
  };

  const handleEdit = (payment) => {
    setEditingId(payment._id);
    setEditFormData({
      productName: payment.productName,
      numberOfPieces: payment.numberOfPieces,
      totalAmount: payment.totalAmount,
      paymentDone: payment.paymentDone,
      dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '',
      notes: payment.notes || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (paymentId) => {
    try {
      await dispatch(updateProductPayment({ 
        id: paymentId, 
        paymentData: editFormData 
      })).unwrap();
      setEditingId(null);
      setEditFormData({});
      toast.success('Payment updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update payment');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleDelete = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await dispatch(deleteProductPayment(paymentId)).unwrap();
        toast.success('Payment deleted successfully!');
      } catch (error) {
        toast.error(error.message || 'Failed to delete payment');
      }
    }
  };

  // CSV Export Function
  const downloadCSV = () => {
    if (productPayments.length === 0) {
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
        'Number of Pieces',
        'Total Amount',
        'Payment Done',
        'Remaining Balance',
        'Status',
        'Due Date',
        'Notes',
        'User'
      ];

      const csvRows = productPayments.map(payment => [
        escapeCSV(new Date(payment.createdAt).toLocaleDateString('en-US')),
        escapeCSV(payment.productName),
        escapeCSV(payment.numberOfPieces),
        escapeCSV(payment.totalAmount),
        escapeCSV(payment.paymentDone),
        escapeCSV(payment.remainingBalance),
        escapeCSV(payment.status),
        escapeCSV(payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('en-US') : ''),
        escapeCSV(payment.notes || ''),
        escapeCSV(payment.user?.name || 'N/A')
      ]);

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary
      csvContent.push('');
      csvContent.push('Summary');
      csvContent.push(`Total Records (Current Page),${productPayments.length}`);
      csvContent.push(`Total Amount,${summary.totalAmount}`);
      csvContent.push(`Total Paid,${summary.totalPaid}`);
      csvContent.push(`Total Pending,${summary.totalPending}`);
      csvContent.push(`Page,${currentPage} of ${totalPages}`);
      
      if (filters.search) {
        csvContent.push(`Search,${filters.search}`);
      }
      if (filters.status !== 'all') {
        csvContent.push(`Status Filter,${filters.status}`);
      }
      
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `product-payments-page${currentPage}-${date}.csv`;
      
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

  if (loading && productPayments.length === 0) {
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
            Loading product payments...
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
              <DollarSign className={`w-5 h-5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Payment Records
              </h2>
              <p className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Showing {productPayments.length} of {totalItems} record{totalItems !== 1 ? 's' : ''}
                {(filters.search || filters.status !== 'all') && ' (filtered)'}
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
                placeholder="Search payments..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
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

            {/* Export Button */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={productPayments.length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                } ${productPayments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg border z-50 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="p-2">
                    <button
                      onClick={downloadCSV}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      CSV (Current Page)
                    </button>
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
                onClick={handleClearFilters}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value })}
                  className={`w-full px-3 py-2 rounded border text-sm ${
                    isDark
                      ? 'bg-slate-600 border-slate-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Amount Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange({ minAmount: e.target.value })}
                    className={`px-3 py-2 rounded border text-sm ${
                      isDark
                        ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange({ maxAmount: e.target.value })}
                    className={`px-3 py-2 rounded border text-sm ${
                      isDark
                        ? 'bg-slate-600 border-slate-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
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
                Date
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Product
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Pieces
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Amount
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Paid
              </th>
              <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Balance
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
            {productPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Package className={`w-12 h-12 mb-3 ${
                      isDark ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No payment records found
                    </p>
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {filters.search || filters.status !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Payment records will appear here'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              productPayments.map((payment) => (
                <tr
                  key={payment._id}
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
                      <span className="text-sm">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  
                  <td className={`px-6 py-4 ${
                    isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    {editingId === payment._id ? (
                      <input
                        type="text"
                        name="productName"
                        value={editFormData.productName}
                        onChange={handleEditChange}
                        className={`w-full px-2 py-1 rounded border text-sm ${
                          isDark
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                          <span className="text-sm">📦</span>
                        </div>
                        <span className="font-medium">{payment.productName}</span>
                      </div>
                    )}
                  </td>
                  
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {editingId === payment._id ? (
                      <input
                        type="number"
                        name="numberOfPieces"
                        value={editFormData.numberOfPieces}
                        onChange={handleEditChange}
                        min="1"
                        className={`w-20 px-2 py-1 rounded border text-sm ${
                          isDark
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <span className="font-semibold">{payment.numberOfPieces}</span>
                    )}
                  </td>
                  
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {editingId === payment._id ? (
                      <input
                        type="number"
                        name="totalAmount"
                        value={editFormData.totalAmount}
                        onChange={handleEditChange}
                        min="0"
                        step="0.01"
                        className={`w-24 px-2 py-1 rounded border text-sm ${
                          isDark
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <span className="font-semibold">${payment.totalAmount}</span>
                    )}
                  </td>
                  
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {editingId === payment._id ? (
                      <input
                        type="number"
                        name="paymentDone"
                        value={editFormData.paymentDone}
                        onChange={handleEditChange}
                        min="0"
                        step="0.01"
                        className={`w-24 px-2 py-1 rounded border text-sm ${
                          isDark
                            ? 'bg-slate-600 border-slate-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <span className="font-semibold">${payment.paymentDone}</span>
                    )}
                  </td>
                  
                  <td className={`px-6 py-4 whitespace-nowrap ${
                    payment.remainingBalance > 0 
                      ? isDark ? 'text-yellow-400' : 'text-yellow-600'
                      : isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    <span className="font-semibold">${payment.remainingBalance}</span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                      getStatusStyles(payment.status)
                    }`}>
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === payment._id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(payment._id)}
                          className="p-1 text-green-600 hover:text-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment._id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {productPayments.length > 0 && (
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
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{endIndex}</span> of{' '}
              <span className="font-medium">{totalItems}</span> entries
            </div>
            
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-gray-300 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Right side - Pagination controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 1
                  ? isDark
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDark
                    ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 1
                  ? isDark
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDark
                    ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => {
                  // Add ellipsis for gaps in page numbers
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className={`px-2 ${
                          isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? isDark
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-blue-500 text-white shadow-sm'
                            : isDark
                              ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                              : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all ${
                currentPage === totalPages
                  ? isDark
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDark
                    ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all ${
                currentPage === totalPages
                  ? isDark
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDark
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
  );
};

export default AdminProductPaymentsTable;