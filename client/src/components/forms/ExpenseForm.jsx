import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Wallet, Smartphone, CreditCard, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ExpenseForm = ({ initialData = {}, onSubmit, onCancel, loading }) => {
  const { user } = useSelector((state) => state.auth || {});
  const { users } = useSelector((state) => state.users || {});
  const { theme } = useTheme();
  const isAdminOrBrandOwner = user && (user.role === 'Admin' || user.role === 'BrandOwner');

  // Defensive: ensure initialData is not null
  const safeInitialData = initialData || {};
  const [form, setForm] = useState({
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
    { value: 'cash', label: 'Cash', icon: Wallet },
    { value: 'gpay', label: 'GPay', icon: Smartphone },
    { value: 'card', label: 'Card', icon: CreditCard }
  ];

  const isDark = theme === 'dark';

  // Theme-aware className helpers
  const inputClass = `mt-1 block w-full rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 border ${
    isDark
      ? 'bg-slate-900/50 border-slate-700 text-slate-100 focus:bg-slate-900/80'
      : 'bg-white border-gray-300 text-gray-900 focus:bg-gray-50'
  }`;

  const labelClass = `block text-sm font-medium transition-colors duration-300 ${
    isDark ? 'text-slate-300' : 'text-gray-700'
  }`;

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 transition-colors duration-300 p-6 rounded-lg ${
      isDark ? 'bg-slate-800/50' : 'bg-white'
    }`}>
      {isAdminOrBrandOwner && (
        <div>
          <label className={labelClass}>Branch Owner</label>
          <select
            name="branchOwner"
            value={form.branchOwner}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">Select Branch Owner</option>
            {users?.filter(u => u.role === 'BranchOwner').map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label className={labelClass}>Category</label>
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </div>
      
      <div>
        <label className={labelClass}>Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          required
          min="0"
          className={inputClass}
        />
      </div>
      
      <div>
        <label className={labelClass}>Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className={`text-sm font-semibold ${labelClass}`}>
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
                    ? isDark
                      ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-blue-50 border-blue-500 shadow-lg shadow-blue-500/10'
                    : isDark
                      ? 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <Icon
                    className={`h-6 w-6 transition-colors duration-300 ${
                      isSelected
                        ? 'text-blue-600 dark:text-blue-400'
                        : isDark
                          ? 'text-slate-500'
                          : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      isSelected
                        ? isDark
                          ? 'text-slate-100'
                          : 'text-gray-900'
                        : isDark
                          ? 'text-slate-400'
                          : 'text-gray-600'
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

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded transition-colors duration-300 ${
            isDark
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-all duration-300"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;