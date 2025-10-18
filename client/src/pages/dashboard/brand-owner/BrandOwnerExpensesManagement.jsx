// client/src/pages/dashboard/brand-owner/BrandOwnerExpensesManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExpenses, deleteExpense, createExpense, updateExpense, getExpensesByBranchOwners } from '../../../store/slices/expensesSlice';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import ExpenseForm from '../branch-owner/ExpensesForm'; // Reusing for now
import ExpensesTable from '../branch-owner/ExpensesTable'; // Reusing for now

const BrandOwnerExpensesManagement = () => {
  const dispatch = useDispatch();
  const { expenses, loading } = useSelector((state) => state.expenses);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users); // To get branch owner names
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);

  useEffect(() => {
    if (assignedBranchOwners.length > 0) {
      dispatch(getExpensesByBranchOwners(assignedBranchOwners));
    } else {
      // If no assigned branch owners, clear expenses or fetch all if that's the desired fallback
      // For now, we'll assume no expenses should be shown if no branch owners are assigned.
      // You might want to dispatch getExpenses() here if you want to show all expenses for the brand owner.
    }
    // Optionally fetch users if needed for filtering/displaying branch owner names
    // dispatch(getUsers());
  }, [dispatch, currentUser, users]); // Added currentUser and users to dependencies

  const assignedBranchOwners = users?.filter(user => 
    user.role === 'BranchOwner' && user.assignedBrandOwner === currentUser?._id
  ).map(bo => bo._id) || [];

  const filteredExpenses = expenses?.filter(expense => 
    assignedBranchOwners.includes(expense.branchOwner?._id) &&
    (expense.branchOwner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
     expense.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleExpenseAdded = () => {
    setRefreshTable(prev => prev + 1);
    setShowModal(false);
    setEditExpense(null);
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setShowModal(true);
  };

  const handleDelete = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      dispatch(deleteExpense(expenseId));
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
          <div className="flex-1 relative">
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
      </div>

      {/* Expenses Table */}
      <ExpensesTable
        expensesData={filteredExpenses}
        loading={loading}
        error={null} // Assuming error is handled by BrandOwnerExpensesManagement
        isBrandOwnerView={true} // New prop to indicate BrandOwner view
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