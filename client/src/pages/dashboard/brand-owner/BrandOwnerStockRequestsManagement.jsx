// client/src/pages/dashboard/brand-owner/BrandOwnerStockRequestsManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStockRequests, updateStockRequest, deleteStockRequest, createStockRequest } from '../../../store/slices/stockRequestsSlice';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import StockRequestForm from '../branch-owner/StockRequestForm'; // Reusing for now
import StockRequestsTable from '../branch-owner/StockRequestsTable'; // Reusing for now

const BrandOwnerStockRequestsManagement = () => {
  const dispatch = useDispatch();
  const { stockRequests, loading } = useSelector((state) => state.stockRequests);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users); // To get branch owner names
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editRequest, setEditRequest] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    dispatch(getStockRequests());
    // Optionally fetch users if needed for filtering/displaying branch owner names
    // dispatch(getUsers()); 
  }, [dispatch]);

  const assignedBranchOwners = users?.filter(user => 
    user.role === 'BranchOwner' && user.assignedBrandOwner === currentUser?._id
  ).map(bo => bo._id) || [];

  const filteredRequests = stockRequests?.filter(request => 
    assignedBranchOwners.includes(request.branchOwner?._id) &&
    (request.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     request.branchOwner?.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || request.status === statusFilter)
  ) || [];

  const handleRequestAdded = () => {
    setRefreshTable(prev => prev + 1);
    setShowModal(false);
    setEditRequest(null);
  };

  const handleEdit = (request) => {
    setEditRequest(request);
    setShowModal(true);
  };

  const handleDelete = (requestId) => {
    if (window.confirm('Are you sure you want to delete this stock request?')) {
      dispatch(deleteStockRequest(requestId));
    }
  };

  const handleApproveReject = (requestId, status) => {
    dispatch(updateStockRequest({ id: requestId, stockRequestData: { status, approved: status === 'Approved' } }));
  };

  const statuses = ['Pending', 'Approved', 'Rejected'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Requests Management</h1>
          <p className="text-gray-600">Manage stock requests from your assigned branches</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={() => { setEditRequest(null); setShowModal(true); }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Request</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests by product or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.productName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.branchOwner?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.priority}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {request.status === 'Pending' && (
                          <>
                            <button onClick={() => handleApproveReject(request._id, 'Approved')} className="text-green-600 hover:text-green-900">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleApproveReject(request._id, 'Rejected')} className="text-red-600 hover:text-red-900">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleEdit(request)} className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(request._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No stock requests found for your assigned branches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Stock Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editRequest ? 'Edit Stock Request' : 'Add New Stock Request'}</h2>
            <StockRequestForm 
              onStockRequestAdded={handleRequestAdded} 
              initialData={editRequest} 
              onCancel={() => setShowModal(false)} 
              isBrandOwner={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandOwnerStockRequestsManagement;