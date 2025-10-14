
// ============================================
// 2. ExpensesForm.jsx - Form Component
// ============================================

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';
import { Wallet, Smartphone, CreditCard, CheckCircle2 } from 'lucide-react';

const ExpensesForm = ({ onExpenseAdded, branchOwnerId, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    paymentMethod: 'cash',
  });

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Wallet },
    { value: 'gpay', label: 'GPay', icon: Smartphone },
    { value: 'card', label: 'Card', icon: CreditCard }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      branchOwner: branchOwnerId,
    };

    try {
      await api.post('/expenses', expenseData);
      setFormData({
        category: '',
        amount: '',
        description: '',
        paymentMethod: 'cash',
      });
      onExpenseAdded();
      toast.success('💸 Expense recorded successfully!');
    } catch (error) {
      console.error('Error recording expense:', error);
      toast.error('Failed to record expense. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
    isDark
      ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
      : 'bg-white border-gray-300 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${
    isDark ? 'text-slate-300' : 'text-gray-700'
  }`;

  return (
    <div className={`rounded-2xl overflow-hidden ${
      isDark
        ? 'bg-slate-800/50 border border-slate-700'
        : 'bg-white border border-gray-200'
    } shadow-xl`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'border-slate-700 bg-slate-800/70' : 'border-gray-200 bg-gray-50'
      }`}>
        <h2 className={`text-lg font-bold flex items-center gap-2 ${
          isDark ? 'text-slate-200' : 'text-gray-900'
        }`}>
          <span className="text-xl">💸</span>
          Record New Expense
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Category */}
        <div>
          <label className={labelClass}>
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className={labelClass}>
            Amount
          </label>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>
              ₹
            </span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={inputClass}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={`${inputClass} resize-none`}
            placeholder="Enter expense details..."
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
              const isSelected = formData.paymentMethod === method.value;
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

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-rose-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/30"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recording...
              </span>
            ) : (
              'Record Expense'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                isDark
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExpensesForm;