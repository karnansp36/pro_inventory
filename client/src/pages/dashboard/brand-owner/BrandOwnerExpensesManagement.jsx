// client/src/pages/dashboard/brand-owner/BrandOwnerExpensesManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExpenses, deleteExpense, createExpense, updateExpense } from '../../../store/slices/expensesSlice';
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
    dispatch(getExpenses());
    // Optionally fetch users if needed for filtering/displaying branch owner names
    // dispatch(getUsers()); 
  }, [dispatch]);

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.branchOwner?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expense.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(expense)} className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(expense._id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No expense records found for your assigned branches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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