// client/src/pages/dashboard/brand-owner/BrandOwnerTransportManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTransports, deleteTransport, createTransport, updateTransport } from '../../../store/slices/transportSlice';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import TransportForm from '../../../components/forms/TransportForm'; // Reusing for now
import TransportTable from '../branch-owner/TransportTable'; // Reusing for now

const BrandOwnerTransportManagement = () => {
  const dispatch = useDispatch();
  const { transports, loading } = useSelector((state) => state.transports);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users); // To get branch owner names
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTransport, setEditTransport] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    dispatch(getTransports());
    // Optionally fetch users if needed for filtering/displaying branch owner names
    // dispatch(getUsers()); 
  }, [dispatch]);

  const assignedBranchOwners = users?.filter(user => 
    user.role === 'BranchOwner' && user.assignedBrandOwner === currentUser?._id
  ).map(bo => bo._id) || [];

  const filteredTransports = transports?.filter(transport => 
    assignedBranchOwners.includes(transport.to?.branchOwner?._id) && // Assuming 'to' has branchOwner ref
    (transport.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
     transport.to.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleTransportAdded = () => {
    setRefreshTable(prev => prev + 1);
    setShowModal(false);
    setEditTransport(null);
  };

  const handleEdit = (transport) => {
    setEditTransport(transport);
    setShowModal(true);
  };

  const handleDelete = (transportId) => {
    if (window.confirm('Are you sure you want to delete this transport record?')) {
      dispatch(deleteTransport(transportId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport Management</h1>
          <p className="text-gray-600">Manage transport records for your assigned branches</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={() => { setEditTransport(null); setShowModal(true); }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Transport</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transports by origin or destination..."
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Request</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransports.length > 0 ? (
                filteredTransports.map((transport) => (
                  <tr key={transport._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transport.stockRequest?.productName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transport.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transport.from}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transport.to}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transport.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transport.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(transport)} className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(transport._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No transport records found for your assigned branches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Transport Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editTransport ? 'Edit Transport' : 'Add New Transport'}</h2>
            <TransportForm 
              onTransportAdded={handleTransportAdded} 
              initialData={editTransport} 
              onCancel={() => setShowModal(false)} 
              isBrandOwner={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandOwnerTransportManagement;