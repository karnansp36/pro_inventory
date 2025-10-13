// pages/admin/StockRequestsManagement.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, CheckCircle, XCircle, Clock, Truck, Package, TrendingUp } from 'lucide-react';
import { getStockRequests, approveStockRequest } from '../../../store/slices/stockRequestsSlice';
import { useTheme } from '../../../context/ThemeContext';

const StockRequestsManagement = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { stockRequests, loading } = useSelector((state) => state.stockRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(getStockRequests());
  }, [dispatch]);

  const filteredRequests = stockRequests?.filter(request => 
    request.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === '' || request.approved === (statusFilter === 'approved'))
  );

  const handleApprove = (requestId) => {
    dispatch(approveStockRequest(requestId));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': 
        return theme === 'dark' 
          ? 'bg-red-900/30 text-red-400 border-red-800/50'
          : 'bg-red-100 text-red-800 border-red-200';
      case 'Required': 
        return theme === 'dark'
          ? 'bg-orange-900/30 text-orange-400 border-orange-800/50'
          : 'bg-orange-100 text-orange-800 border-orange-200';
      default: 
        return theme === 'dark'
          ? 'bg-green-900/30 text-green-400 border-green-800/50'
          : 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (approved) => {
    if (approved) {
      return theme === 'dark'
        ? 'bg-green-900/30 text-green-400 border-green-800/50'
        : 'bg-green-100 text-green-800 border-green-200';
    }
    return theme === 'dark'
      ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  // Calculate stats
  const totalRequests = filteredRequests?.length || 0;
  const pendingRequests = filteredRequests?.filter(r => !r.approved).length || 0;
  const approvedRequests = filteredRequests?.filter(r => r.approved).length || 0;
  const urgentRequests = filteredRequests?.filter(r => r.priority === 'Urgent').length || 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 lg:p-8 rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
          : 'bg-gradient-to-r from-white via-gray-50 to-white border-gray-200 shadow-gray-200/50'
      }`}>
        <div className="space-y-1">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
            theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
          }`}>
            Stock Requests Management
          </h1>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Approve and manage stock requests from branches
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className={`p-6 rounded-2xl border shadow-lg transition-all duration-200 hover:scale-105 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Total Requests
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {totalRequests}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              theme === 'dark'
                ? 'bg-blue-600/20'
                : 'bg-blue-100'
            }`}>
              <Package className={`h-8 w-8 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg transition-all duration-200 hover:scale-105 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Pending
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {pendingRequests}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              theme === 'dark'
                ? 'bg-yellow-600/20'
                : 'bg-yellow-100'
            }`}>
              <Clock className={`h-8 w-8 ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg transition-all duration-200 hover:scale-105 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Approved
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {approvedRequests}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              theme === 'dark'
                ? 'bg-green-600/20'
                : 'bg-green-100'
            }`}>
              <CheckCircle className={`h-8 w-8 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg transition-all duration-200 hover:scale-105 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Urgent
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {urgentRequests}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              theme === 'dark'
                ? 'bg-red-600/20'
                : 'bg-red-100'
            }`}>
              <TrendingUp className={`h-8 w-8 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-2xl border shadow-lg p-4 lg:p-6 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-slate-900'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-white'
              }`}
            />
          </div>
          <div className="relative">
            <Filter className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
            }`} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`pl-12 pr-10 py-3.5 rounded-xl border-2 font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 appearance-none ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-slate-900'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-white'
              }`}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Requests Table */}
      <div className={`rounded-2xl border shadow-lg overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Product
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Branch
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Quantity
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Priority
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' ? 'divide-slate-800' : 'divide-gray-200'
            }`}>
              {filteredRequests?.map((request) => (
                <tr 
                  key={request._id} 
                  className={`transition-colors duration-150 ${
                    theme === 'dark' 
                      ? 'hover:bg-slate-800/30' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                    }`}>
                      {request.productName}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {request.branchOwner?.name || 'Unknown Branch'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    {request.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border ${getStatusColor(request.approved)}`}>
                      {request.approved ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          Pending
                        </>
                      )}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!request.approved && (
                        <>
                          <button 
                            onClick={() => handleApprove(request._id)}
                            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                              theme === 'dark'
                                ? 'text-green-400 hover:bg-green-600/20'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button 
                            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                              theme === 'dark'
                                ? 'text-red-400 hover:bg-red-600/20'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      {request.approved && (
                        <button 
                          className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                            theme === 'dark'
                              ? 'text-blue-400 hover:bg-blue-600/20'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <Truck className="h-4 w-4" />
                          <span>Create Transport</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredRequests?.length === 0 && (
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          }`}>
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">No stock requests found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockRequestsManagement;