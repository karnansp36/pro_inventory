// pages/admin/TransportManagement.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Search, Truck, Package, MapPin, TrendingUp, Activity, X } from 'lucide-react';
import { getTransports, createTransport } from '../../../store/slices/transportSlice';
import { getStockRequests } from '../../../store/slices/stockRequestsSlice';
import { useTheme } from '../../../context/ThemeContext';
import TransportForm from '../../../components/forms/TransportForm';

const TransportManagement = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme } = useTheme();
  const { transport: transports, loading } = useSelector((state) => state.transport);
  const { stockRequests } = useSelector((state) => state.stockRequests || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [initialStockRequest, setInitialStockRequest] = useState(null);

  useEffect(() => {
    dispatch(getTransports());
    dispatch(getStockRequests());

    if (location.state && location.state.stockRequest) {
      setInitialStockRequest(location.state.stockRequest);
      setShowModal(true);
    }
  }, [dispatch, location.state]);
 
  const handleAdd = () => {
    setInitialStockRequest(null); // Clear any previous initial stock request
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleFormSubmit = (formData) => {
    dispatch(createTransport(formData)).then((res) => {
      if (!res.error) setShowModal(false);
    });
  };

  const filteredTransports = transports?.filter(transport => 
    transport.stockRequest?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (transport) => {
    if (transport.receivedQuantity === transport.quantity) {
      return theme === 'dark' 
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (transport.receivedQuantity > 0) {
      return theme === 'dark' 
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
        : 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return theme === 'dark' 
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
      : 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getStatusText = (transport) => {
    if (transport.receivedQuantity === transport.quantity) return 'Delivered';
    if (transport.receivedQuantity > 0) return 'Partially Received';
    return 'In Transit';
  };

  // Calculate statistics
  const totalTransports = filteredTransports?.length || 0;
  const inTransit = filteredTransports?.filter(t => t.receivedQuantity === 0).length || 0;
  const delivered = filteredTransports?.filter(t => t.receivedQuantity === t.quantity).length || 0;
  const partiallyReceived = filteredTransports?.filter(t => t.receivedQuantity > 0 && t.receivedQuantity < t.quantity).length || 0;

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
            Transport Management
          </h1>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Monitor and manage stock transportation
          </p>
        </div>
        <button
          onClick={handleAdd}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-900/30'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/30'
          }`}
        >
          <Truck className="h-5 w-5" />
          <span className="hidden sm:inline">Create Transport</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className={`p-6 rounded-2xl border shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Total Transports
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {totalTransports}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Activity className={`h-8 w-8 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                In Transit
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {inTransit}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}>
              <Truck className={`h-8 w-8 ${
                theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Partially Received
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {partiallyReceived}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <TrendingUp className={`h-8 w-8 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Delivered
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {delivered}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'
            }`}>
              <Package className={`h-8 w-8 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className={`p-6 rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800/50'
          : 'bg-white border-gray-200'
      }`}>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search by product, from, or to location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          />
        </div>
      </div>

      {/* Transport Table */}
      <div className={`rounded-2xl border shadow-lg overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800/50'
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${
              theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Product
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Route
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Quantity
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Bundle Size
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Received
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Created
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' ? 'divide-slate-800' : 'divide-gray-200'
            }`}>
              {filteredTransports?.map((transport) => (
                <tr key={transport._id} className={`transition-colors duration-150 ${
                  theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
                      }`}>
                        <Package className={`h-5 w-5 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                      }`}>
                        {transport.stockRequest?.productName || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className={`h-4 w-4 ${
                        theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                      }`} />
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        {transport.from} → {transport.to}
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-900'
                  }`}>
                    {transport.quantity}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {transport.bundleSize}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-900'
                  }`}>
                    {transport.receivedQuantity || 0} / {transport.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(transport)}`}>
                      {getStatusText(transport)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {new Date(transport.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filteredTransports?.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Truck className={`h-12 w-12 ${
                        theme === 'dark' ? 'text-slate-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        No transports found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add Transport */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border transform transition-all ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-gray-200'
          }`}>
            <div className={`flex items-center justify-between p-6 border-b ${
              theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                Create Transport
              </h2>
              <button
                onClick={handleModalClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
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