// client/src/pages/dashboard/brand-owner/BrandOwnerExpensesManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExpensesByBrandOwner, deleteExpense, createExpense, updateExpense } from '../../../store/slices/expensesSlice';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import ExpenseForm from '../branch-owner/ExpensesForm';
import ExpensesTable from '../branch-owner/ExpensesTable';

const BrandOwnerExpensesManagement = () => {
  const dispatch = useDispatch();
  const { expenses, loading, error } = useSelector((state) => state.expenses);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getExpensesByBrandOwner({ 
        brandOwnerId: currentUser._id, 
        filters 
      }));
    }
  }, [dispatch, currentUser?._id, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const filteredExpenses = expenses?.filter(expense => 
    expense.branchOwner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleExpenseAdded = () => {
    setShowModal(false);
    setEditExpense(null);
    // Refresh the data
    if (currentUser?._id) {
      dispatch(getExpensesByBrandOwner({ brandOwnerId: currentUser._id, filters }));
    }
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setShowModal(true);
  };

  const handleDelete = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      dispatch(deleteExpense(expenseId)).then(() => {
        // Refresh the data after deletion
        if (currentUser?._id) {
          dispatch(getExpensesByBrandOwner({ brandOwnerId: currentUser._id, filters }));
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses Management</h1>
          <p className="text-gray-600">Manage expense records for your assigned branches</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={() => { setEditExpense(null); setShowModal(true); }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search by Branch Owner Name */}
          <div className="flex-1">
            <label htmlFor="branchOwnerName" className="block text-sm font-medium text-gray-700">Branch Owner Name:</label>
            <input
              type="text"
              id="branchOwnerName"
              name="branchOwnerName"
              placeholder="Enter branch owner name"
              onChange={handleFilterChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Search by Manager Name */}
          <div className="flex-1">
            <label htmlFor="managerName" className="block text-sm font-medium text-gray-700">Manager Name:</label>
            <input
              type="text"
              id="managerName"
              name="managerName"
              placeholder="Enter manager name"
              onChange={handleFilterChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Search by Category */}
          <div className="flex-1">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category:</label>
            <input
              type="text"
              id="category"
              name="category"
              placeholder="Enter category"
              onChange={handleFilterChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-4 flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses by branch, category or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <ExpensesTable
        expensesData={filteredExpenses}
        loading={loading}
        error={error}
        isBrandOwnerView={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
            <ExpenseForm 
              onExpenseAdded={handleExpenseAdded} 
              initialData={editExpense} 
              onCancel={() => setShowModal(false)} 
              isBrandOwner={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandOwnerExpensesManagement;