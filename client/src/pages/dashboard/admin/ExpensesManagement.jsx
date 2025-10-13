// pages/admin/ExpensesManagement.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Edit, Trash2, Calendar } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../../../store/slices/expensesSlice';
import ExpenseForm from '../../../components/forms/ExpenseForm';
import { getUsers } from '../../../store/slices/usersSlice';

const ExpensesManagement = () => {
  const dispatch = useDispatch();
  const { expenses, loading } = useSelector((state) => state.expenses);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);


  const { user } = useSelector((state) => state.auth || {});
  const { users } = useSelector((state) => state.users || {});

  useEffect(() => {
    dispatch(getExpenses());
    if (user && (user.role === 'Admin' || user.role === 'BrandOwner')) {
      dispatch(getUsers());
    }
  }, [dispatch, user]);

  const categories = [...new Set(expenses?.map(exp => exp.category))];

  const filteredExpenses = expenses?.filter(expense => 
    expense.branchOwner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === '' || expense.category === categoryFilter)
  );


  const handleDelete = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      dispatch(deleteExpense(expenseId));
    }
  };

  const handleAdd = () => {
    setEditExpense(null);
    setShowModal(true);
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditExpense(null);
  };

  const handleFormSubmit = (formData) => {
    let data = { ...formData };
    if (user && (user.role === 'Admin' || user.role === 'BrandOwner')) {
      data.branchOwner = formData.branchOwner;
    }
    if (editExpense) {
      dispatch(updateExpense({ id: editExpense._id, data })).then(() => handleModalClose());
    } else {
      dispatch(createExpense(data)).then(() => {
        handleModalClose();
        dispatch(getExpenses()); // Refetch expenses after successful creation
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-gray-600">Manage all expense records across branches</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses?.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {expense.branchOwner?.name || 'Unknown Branch'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${expense.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense._id)}
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
      {/* Modal for Add/Edit Expense */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-lg font-semibold mb-4">{editExpense ? 'Edit Expense' : 'Add Expense'}</h2>
            <ExpenseForm
              initialData={editExpense}
              onSubmit={handleFormSubmit}
              onCancel={handleModalClose}
              loading={loading}
            />
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleModalClose}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManagement;