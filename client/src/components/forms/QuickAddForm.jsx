import React, { useState } from 'react';

// type: "sale" (default) or "stock"
const QuickAddForm = ({ type = 'sale', onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(
    type === 'stock'
      ? { productName: '', quantity: '', priority: 'Normal' }
      : { cash: '', gpay: '', creditCard: '', date: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (type === 'stock') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="productName"
            value={form.productName}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
          >
            <option value="Urgent">Urgent</option>
            <option value="Required">Required</option>
            <option value="Normal">Normal</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    );
  }

  // Sale form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Cash</label>
        <input
          type="number"
          name="cash"
          value={form.cash}
          onChange={handleChange}
          min="0"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">GPay</label>
        <input
          type="number"
          name="gpay"
          value={form.gpay}
          onChange={handleChange}
          min="0"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Credit Card</label>
        <input
          type="number"
          name="creditCard"
          value={form.creditCard}
          onChange={handleChange}
          min="0"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
};

export default QuickAddForm;