// client/src/pages/dashboard/brand-owner/BrandOwnerSalesManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSales, deleteSale, createSale, updateSale } from '../../../store/slices/salesSlice';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import SalesForm from '../../../components/forms/SalesForm'; // Import the new SalesForm component
// import SalesTable from '../../branch-owner/SalesTable'; // Reusing for now

const BrandOwnerSalesManagement = () => {
  const dispatch = useDispatch();
  const { sales, loading } = useSelector((state) => state.sales);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users); // To get branch owner names
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSale, setEditSale] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    dispatch(getSales());
    // Optionally fetch users if needed for filtering/displaying branch owner names
    // dispatch(getUsers()); 
  }, [dispatch]);

  const assignedBranchOwners = users?.filter(user => 
    user.role === 'BranchOwner' && user.assignedBrandOwner === currentUser?._id
  ).map(bo => bo._id) || [];

  const filteredSales = sales?.filter(sale => 
    assignedBranchOwners.includes(sale.branchOwner?._id) &&
    (sale.branchOwner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     sale.date.includes(searchTerm)) // Simple date search for now
  ) || [];

  const handleSaleAdded = () => {
    setRefreshTable(prev => prev + 1);
    setShowModal(false);
    setEditSale(null);
  };

  const handleEdit = (sale) => {
    setEditSale(sale);
    setShowModal(true);
  };

  const handleDelete = (saleId) => {
    if (window.confirm('Are you sure you want to delete this sales record?')) {
      dispatch(deleteSale(saleId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Manage sales records for your assigned branches</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={() => { setEditSale(null); setShowModal(true); }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Sale</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales by branch or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.branchOwner?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(sale)} className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(sale._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No sales records found for your assigned branches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editSale ? 'Edit Sale' : 'Add New Sale'}</h2>
            <SalesForm 
              onClose={handleSaleAdded}
              initialData={editSale}
              branchOwnerId={editSale?.branchOwner?._id || ''}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandOwnerSalesManagement;