
// ============================================
// 2. ExpensesForm.jsx - Form Component
// ============================================

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';

const ExpensesForm = ({ onExpenseAdded, branchOwnerId, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    description: ''
  });

  const categories = [
    { value: 'Rent', icon: '🏠', color: 'blue' },
    { value: 'Utilities', icon: '💡', color: 'yellow' },
    { value: 'Supplies', icon: '📦', color: 'purple' },
    { value: 'Salaries', icon: '💰', color: 'green' },
    { value: 'Maintenance', icon: '🔧', color: 'orange' },
    { value: 'Marketing', icon: '📢', color: 'pink' },
    { value: 'Transportation', icon: '🚗', color: 'indigo' },
    { value: 'Other', icon: '📋', color: 'gray' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      branchOwnerId
    };

    try {
      await api.post('/expenses', expenseData);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        amount: '',
        description: ''
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
        {/* Date */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            }`}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            }`}
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.value}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-slate-300' : 'text-gray-700'
          }`}>
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
              className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              }`}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${
            isDark ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-none ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            }`}
            placeholder="Enter expense details..."
            required
          />
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