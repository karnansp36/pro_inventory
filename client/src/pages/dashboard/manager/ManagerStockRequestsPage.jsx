// client/src/pages/dashboard/manager/ManagerStockRequestsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { getStockRequestsByManager } from '../../../store/slices/stockRequestsSlice';
import { getUsers } from '../../../store/slices/usersSlice';
import { Package, Filter, Search } from 'lucide-react';
import StockRequestsTable from '../branch-owner/StockRequestsTable';

const ManagerStockRequestsPage = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const { stockRequests, totalItems, loading, error } = useSelector((state) => state.stockRequests);
  
  const [selectedBranch, setSelectedBranch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    type: 'all',
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  // Combine all filters into one object for the API call
  const filters = useMemo(() => ({
    branchId: selectedBranch,
    searchTerm,
    dateFilter,
    statusFilter,
    priorityFilter
  }), [selectedBranch, searchTerm, dateFilter, statusFilter, priorityFilter]);

  // Fetch stock requests when filters or pagination change
  useEffect(() => {
    if (user?._id) {
      dispatch(getStockRequestsByManager({ 
        managerId: user._id, 
        page: currentPage, 
        limit: itemsPerPage,
        filters 
      }));
    }
  }, [dispatch, user?._id, currentPage, itemsPerPage, filters]);

  // Fetch users to populate branch filter
  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const branchOwners = users.filter(user => user.role === 'BranchOwner');

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedBranch('');
    setSearchTerm('');
    setDateFilter({ type: 'all', startDate: '', endDate: '' });
    setStatusFilter('all');
    setPriorityFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl p-6 ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Stock Requests Overview
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                View and monitor stock requests across all assigned branches
              </p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-white text-sm font-medium">Read Only Access</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Section */}
        <div className={`p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 ${
          theme === 'dark'
            ? 'bg-slate-800/50 border border-slate-700/50'
            : 'bg-white border border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <select
              value={selectedBranch}
              onChange={handleBranchChange}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-gray-300 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            >
              <option value="">All Branches</option>
              {branchOwners.map(branch => (
                <option key={branch._id} value={branch._id}>{branch.username}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            <input
              type="text"
              placeholder="Search stock requests..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-gray-300 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            />
          </div>

          {(selectedBranch || searchTerm || dateFilter.type !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }`}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          {loading && stockRequests.length === 0 ? (
            <div className={`rounded-xl p-8 text-center ${
              theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
            }`}>
              Loading stock requests...
            </div>
          ) : error ? (
            <div className={`rounded-xl p-8 text-center ${
              theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-600'
            }`}>
              Error: {error}
            </div>
          ) : (
            <StockRequestsTable
              requestsData={stockRequests}
              totalItems={totalItems}
              isManagerView={true}
              managerId={user?._id}
              filters={filters}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerStockRequestsPage;