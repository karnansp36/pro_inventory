// pages/admin/SalesManagement.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Edit, Trash2, Calendar } from 'lucide-react';
import { getSales, deleteSale, createSale } from '../../../store/slices/salesSlice';
import { getUsers } from '../../../store/slices/usersSlice';

const SalesManagement = () => {
  const dispatch = useDispatch();
  const { sales, loading } = useSelector((state) => state.sales);
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    cash: '',
    gpay: '',
    creditCard: '',
    date: '',
    branchOwner: '',
  });

  useEffect(() => {
    dispatch(getSales());
    if (user?.role === 'Admin' || user?.role === 'BrandOwner') {
      dispatch(getUsers());
    }
  }, [dispatch, user?.role]);

  const filteredSales = sales?.filter(sale => 
    sale.branchOwner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (dateFilter === '' || sale.date.includes(dateFilter))
  );

  const handleDelete = (saleId) => {
    if (window.confirm('Are you sure you want to delete this sale record?')) {
      dispatch(deleteSale(saleId));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      cash: Number(form.cash) || 0,
      gpay: Number(form.gpay) || 0,
      creditCard: Number(form.creditCard) || 0,
      date: form.date,
    };
    if (user?.role === 'Admin' || user?.role === 'BrandOwner') {
      payload.branchOwner = form.branchOwner;
    }
    dispatch(createSale(payload)).then((res) => {
      if (!res.error) {
        setShowModal(false);
        setForm({ cash: '', gpay: '', creditCard: '', date: '', branchOwner: '' });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Manage all sales records across branches</p>
        </div>
        {(user?.role === 'BranchOwner' || user?.role === 'Admin' || user?.role === 'BrandOwner') && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Add Sale</span>
          </button>
        )}
      </div>

      {/* Add Sale Modal */}
  {(user?.role === 'BranchOwner' || user?.role === 'Admin' || user?.role === 'BrandOwner') && showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Sale</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {(user?.role === 'Admin' || user?.role === 'BrandOwner') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch Owner</label>
                  <select
                    name="branchOwner"
                    value={form.branchOwner}
                    onChange={handleFormChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Branch Owner</option>
                    {users
                      ?.filter(u => u.role === 'BranchOwner')
                      .map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                      ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Cash</label>
                <input type="number" name="cash" value={form.cash} onChange={handleFormChange} className="w-full border rounded px-3 py-2" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GPay</label>
                <input type="number" name="gpay" value={form.gpay} onChange={handleFormChange} className="w-full border rounded px-3 py-2" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Credit Card</label>
                <input type="number" name="creditCard" value={form.creditCard} onChange={handleFormChange} className="w-full border rounded px-3 py-2" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GPay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales?.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sale.branchOwner?.name || 'Unknown Branch'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${sale.cash}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${sale.gpay}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${sale.creditCard}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${sale.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sale._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

export default SalesManagement;