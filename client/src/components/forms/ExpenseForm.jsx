import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Wallet, Smartphone, CreditCard, CheckCircle2 } from 'lucide-react';

const ExpenseForm = ({ initialData = {}, onSubmit, onCancel, loading }) => {
  const { user } = useSelector((state) => state.auth || {});
  const { users } = useSelector((state) => state.users || {});
  const isAdminOrBrandOwner = user && (user.role === 'Admin' || user.role === 'BrandOwner');

  // Defensive: ensure initialData is not null
  const safeInitialData = initialData || {};
  const [form, setForm] = useState({
    category: '',
    amount: '',
    description: '',
    paymentMethod: 'cash', // Default payment method
    branchOwner: '',
    ...safeInitialData,
    branchOwner: safeInitialData.branchOwner && typeof safeInitialData.branchOwner === 'object'
      ? safeInitialData.branchOwner._id
      : safeInitialData.branchOwner || '',
    paymentMethod: safeInitialData.paymentMethod || 'cash', // Ensure paymentMethod is set from initialData or defaults
  });

  useEffect(() => {
    const safeInitialData = initialData || {};
    setForm({
      category: '',
      amount: '',
      description: '',
      paymentMethod: 'cash',
      branchOwner: '',
      ...safeInitialData,
      branchOwner: safeInitialData.branchOwner && typeof safeInitialData.branchOwner === 'object'
        ? safeInitialData.branchOwner._id
        : safeInitialData.branchOwner || '',
      paymentMethod: safeInitialData.paymentMethod || 'cash',
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Wallet, color: 'green' },
    { value: 'gpay', label: 'GPay', icon: Smartphone, color: 'blue' },
    { value: 'card', label: 'Card', icon: CreditCard, color: 'purple' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isAdminOrBrandOwner && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Branch Owner</label>
          <select
            name="branchOwner"
            value={form.branchOwner}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100"
          >
            <option value="">Select Branch Owner</option>
            {users?.filter(u => u.role === 'BranchOwner').map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Category</label>
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          required
          min="0"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-100"
        />
      </div>
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = form.paymentMethod === method.value;
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => handlePaymentMethodChange(method.value)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800/30 border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <Icon
                    className={`h-6 w-6 ${
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-slate-500'
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      isSelected
                        ? 'text-gray-900 dark:text-slate-100'
                        : 'text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {method.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
