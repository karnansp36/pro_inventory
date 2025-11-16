import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/ThemeContext';
import { useDispatch } from 'react-redux';
import { createProductPayment } from '../../../store/slices/productPaymentsSlice';

const ProductPaymentForm = ({ onPaymentAdded, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    userId: '',
    productName: '',
    numberOfPieces: '',
    totalAmount: '',
    paymentDone: '',
    dueDate: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(createProductPayment(formData)).unwrap();
      setFormData({
        userId: '',
        productName: '',
        numberOfPieces: '',
        totalAmount: '',
        paymentDone: '',
        dueDate: '',
        notes: ''
      });
      onPaymentAdded();
      toast.success('Product payment created successfully!');
    } catch (error) {
      console.error('Error creating product payment:', error);
      toast.error(error.message || 'Error creating product payment. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Add Product Payment
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
            Product Name *
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
            placeholder="Enter product name..."
            required
          />
        </div>

        {/* Number of Pieces */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Number of Pieces *
          </label>
          <input
            type="number"
            name="numberOfPieces"
            value={formData.numberOfPieces}
            onChange={handleChange}
            min="1"
            className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
            placeholder="Enter number of pieces..."
            required
          />
        </div>

        {/* Total Amount */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Total Amount ($) *
          </label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
            placeholder="Enter total amount..."
            required
          />
        </div>

        {/* Payment Done */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Payment Done ($)
          </label>
          <input
            type="number"
            name="paymentDone"
            value={formData.paymentDone}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
            placeholder="Enter payment done..."
          />
        </div>

        {/* Due Date */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
          />
        </div>

        {/* Notes */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
              isDark 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
            placeholder="Additional notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Payment'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isDark
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductPaymentForm;