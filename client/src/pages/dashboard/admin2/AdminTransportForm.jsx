// components/forms/TransportForm.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const AdminTransportForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  stockRequests = [],
  initialStockRequest = null,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 🔧 Initialize cleanly with defaults and fallbacks
  const getInitialForm = () => ({
    stockRequest:
      initialData.stockRequest?._id ||
      initialData.stockRequest ||
      initialStockRequest?._id ||
      '',
    bundleSize: initialData.bundleSize || '',
    quantity:
      initialData.quantity ||
      initialStockRequest?.quantity?.requested || // Fixed: access nested quantity
      initialStockRequest?.quantity || // Fallback for direct quantity
      '',
    from:
      initialData.from ||
      initialStockRequest?.branchOwner?.address ||
      '',
    to: initialData.to || '',
  });

  const [form, setForm] = useState(getInitialForm);

  // 🧠 Update form only when editing or switching initial data
  useEffect(() => {
    if (Object.keys(initialData).length > 0 || initialStockRequest) {
      setForm(getInitialForm());
    }
  }, [initialData, initialStockRequest]);

  // 🪶 Handlers
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // 🎨 Theming
  const inputClass = `mt-1 block w-full rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 border ${
    isDark
      ? 'bg-slate-900/50 border-slate-700 text-slate-100 focus:bg-slate-900/80 focus:border-blue-400'
      : 'bg-white border-gray-300 text-gray-900 focus:bg-gray-50 focus:border-blue-500'
  }`;

  const labelClass = `block text-sm font-medium transition-colors duration-300 ${
    isDark ? 'text-slate-300' : 'text-gray-700'
  }`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 transition-colors duration-300 p-6 rounded-lg ${
        isDark ? 'bg-slate-800/50' : 'bg-white'
      }`}
    >
      {/* Stock Request */}
      <div>
        <label className={labelClass}>Stock Request</label>
        <select
          name="stockRequest"
          value={form.stockRequest}
          onChange={handleChange}
          required
          className={inputClass}
        >
          <option value="">Select Stock Request</option>
          {stockRequests.map((req) => (
            <option key={req._id} value={req._id}>
              {req.productName || req._id} (Qty: {req.quantity?.requested || req.quantity})
            </option>
          ))}
        </select>
      </div>

      {/* Bundle Size */}
      <div>
        <label className={labelClass}>Bundle Size</label>
        <input
          type="number"
          name="bundleSize"
          value={form.bundleSize}
          onChange={handleChange}
          required
          min="1"
          className={inputClass}
          placeholder="Enter bundle size"
        />
      </div>

      {/* Quantity */}
      <div>
        <label className={labelClass}>Quantity</label>
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          required
          min="1"
          className={inputClass}
          placeholder="Enter quantity"
        />
      </div>

      {/* From */}
      <div>
        <label className={labelClass}>From</label>
        <input
          type="text"
          name="from"
          value={form.from}
          onChange={handleChange}
          required
          className={inputClass}
          placeholder="Enter source location"
        />
      </div>

      {/* To */}
      <div>
        <label className={labelClass}>To</label>
        <input
          type="text"
          name="to"
          value={form.to}
          onChange={handleChange}
          required
          className={inputClass}
          placeholder="Enter destination location"
        />
      </div>

      {/* Actions */}
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-all duration-300 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Save Transport'
          )}
        </button>
      </div>
    </form>
  );
};

export default AdminTransportForm;