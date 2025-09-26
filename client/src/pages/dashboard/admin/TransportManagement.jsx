// pages/admin/TransportManagement.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, Truck, Package, CheckCircle, MapPin } from 'lucide-react';
import { getTransports } from '../../../store/slices/transportSlice';

const TransportManagement = () => {
  const dispatch = useDispatch();
  const { transports, loading } = useSelector((state) => state.transport);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getTransports());
  }, [dispatch]);

  const filteredTransports = transports?.filter(transport => 
    transport.stockRequest?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (transport) => {
    if (transport.receivedQuantity === transport.quantity) return 'bg-green-100 text-green-800';
    if (transport.receivedQuantity > 0) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (transport) => {
    if (transport.receivedQuantity === transport.quantity) return 'Delivered';
    if (transport.receivedQuantity > 0) return 'Partially Received';
    return 'In Transit';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport Management</h1>
          <p className="text-gray-600">Monitor and manage stock transportation</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Truck className="h-4 w-4" />
          <span>Create Transport</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, from, or to..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Transport Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bundle Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransports?.map((transport) => (
                <tr key={transport._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {transport.stockRequest?.productName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div className="text-sm text-gray-900">
                        {transport.from} → {transport.to}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transport.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transport.bundleSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transport.receivedQuantity || 0} / {transport.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transport)}`}>
                      {getStatusText(transport)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transport.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransportManagement;