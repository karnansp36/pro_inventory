// pages/admin/ExpensesManagement.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Edit, Trash2, DollarSign, TrendingUp, Tag, X, Filter } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../../../store/slices/expensesSlice';
import { getUsers } from '../../../store/slices/usersSlice';
import { useTheme } from '../../../context/ThemeContext';
import ExpenseForm from '../../../components/forms/ExpenseForm';

const ExpensesManagement = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
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

  // Calculate statistics
  const totalExpenses = filteredExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const expensesByCategory = categories.reduce((acc, cat) => {
    acc[cat] = filteredExpenses?.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0) || 0;
    return acc;
  }, {});
  const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];

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
            Expenses Management
          </h1>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Manage all expense records across branches
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
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
                Total Expenses
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                ${totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
            }`}>
              <DollarSign className={`h-8 w-8 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
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
                Total Records
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {filteredExpenses?.length || 0}
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
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Top Category
              </p>
              <p className={`text-xl font-bold mt-2 truncate ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {topCategory ? topCategory[0] : 'N/A'}
              </p>
              {topCategory && (
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  ${topCategory[1].toFixed(2)}
                </p>
              )}
            </div>
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <Tag className={`h-8 w-8 ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800/50'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
          </div>
          <div className="relative md:w-64">
            <Filter className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 appearance-none ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
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
                  Branch
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Category
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Amount
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Description
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' ? 'divide-slate-800' : 'divide-gray-200'
            }`}>
              {filteredExpenses?.map((expense) => (
                <tr key={expense._id} className={`transition-colors duration-150 ${
                  theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'
                }`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                  }`}>
                    {expense.branchOwner?.name || 'Unknown Branch'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                      theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 text-sm max-w-xs truncate ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {expense.description}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          theme === 'dark'
                            ? 'hover:bg-blue-500/20 text-blue-400 hover:text-blue-300'
                            : 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          theme === 'dark'
                            ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                            : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses?.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <DollarSign className={`h-12 w-12 ${
                        theme === 'dark' ? 'text-slate-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        No expenses found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Expense */}
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
                {editExpense ? 'Edit Expense' : 'Add Expense'}
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
              <ExpenseForm
                initialData={editExpense}
                onSubmit={handleFormSubmit}
                onCancel={handleModalClose}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManagement;