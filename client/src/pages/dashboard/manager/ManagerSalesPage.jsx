// client/src/pages/dashboard/manager/ManagerSalesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import SalesTable from '../branch-owner/SalesTable';
import { useTheme } from '../../../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { getUsers } from '../../../store/slices/usersSlice';
import { Filter, Search } from 'lucide-react';
import { getSalesByManager } from '../../../store/slices/salesSlice';

const ManagerSalesPage = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const { sales, loading, error } = useSelector((state) => state.sales);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const filters = useMemo(() => ({
    branchId: selectedBranch,
  }), [selectedBranch]);

  useEffect(() => {
    const managerId = user._id;
    dispatch(getSalesByManager({ managerId, filters }));
    dispatch(getUsers());
  }, [dispatch, filters, user._id]);


  const branchOwners = users.filter(user => user.role === 'BranchOwner');

  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Sales Overview</h1>
        <div className={`px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          <span className="text-sm font-medium">Read Only Access</span>
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
        {/* Add search input if needed */}
        {/* <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          <input
            type="text"
            placeholder="Search sales..."
            className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-gray-300 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-700 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div> */}
      </div>


      <div className="lg:col-span-2">
        {/* Pass sales data directly to SalesTable */}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <SalesTable
            salesData={sales}
            isManagerView={true}
            filters={filters}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default ManagerSalesPage;