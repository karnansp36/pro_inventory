
// ============================================
// 2. ManagerStockForm.jsx - Form Component
// ============================================

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';

const ManagerStockForm = ({ onRequestAdded, branchOwnerId, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    priority: 'Normal'
  });

  const priorities = [
    { value: 'Urgent', label: 'Urgent', icon: '🚨', color: 'red' },
    { value: 'Required', label: 'Required', icon: '⚠️', color: 'orange' },
    { value: 'Normal', label: 'Normal', icon: '✅', color: 'green' }
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
    
    const requestData = {
      ...formData,
      quantity: parseInt(formData.quantity)
    };

    try {
      await api.post('/stockrequests', requestData);
      setFormData({
        productName: '',
        quantity: '',
        priority: 'Normal'
      });
      onRequestAdded();
      toast.success('Stock request submitted successfully!');
    } catch (error) {
      console.error('Error submitting stock request:', error);
      toast.error('Error submitting stock request. Please try again.');
    }
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      Urgent: 'bg-red-50 border-red-200 text-red-700',
      Required: 'bg-orange-50 border-orange-200 text-orange-700',
      Normal: 'bg-green-50 border-green-200 text-green-700'
    };
    if (isDark) {
      const darkStyles = {
        Urgent: 'bg-red-900/30 border-red-700 text-red-300',
        Required: 'bg-orange-900/30 border-orange-700 text-orange-300',
        Normal: 'bg-green-900/30 border-green-700 text-green-300'
      };
      return darkStyles[priority] || darkStyles.Normal;
    }
    return styles[priority] || styles.Normal;
  };

  return (
    <div className={`rounded-2xl shadow-lg overflow-hidden ${
      isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
    }`}>
      {/* Form Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isDark ? 'bg-blue-500/20' : 'bg-blue-100'
          }`}>
            <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Request Stock
          </h2>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Product Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Product Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
              placeholder="Enter product name..."
              required
            />
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Quantity
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-200 ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
              placeholder="Enter quantity..."
              required
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Priority Level
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.icon} {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Preview */}
        <div className={`p-4 rounded-lg border-2 ${getPriorityStyles(formData.priority)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Selected Priority:</span>
              <span className="text-lg">
                {priorities.find(p => p.value === formData.priority)?.icon}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold">
              {formData.priority}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Submit Request
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isDark
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
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

export default ManagerStockForm;
