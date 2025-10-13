import React, { useState, useEffect } from 'react';

const TransportForm = ({ initialData = {}, onSubmit, onCancel, loading, stockRequests = [], initialStockRequest = null }) => {
  const [form, setForm] = useState({
    stockRequest: initialStockRequest ? initialStockRequest._id : '',
    bundleSize: '',
    quantity: initialStockRequest ? initialStockRequest.quantity : '',
    from: initialStockRequest ? initialStockRequest.branchOwner?.address || '' : '',
    to: '', // 'to' field is usually the destination, which might not be in stock request
    ...initialData,
    stockRequest: initialData.stockRequest?._id || initialData.stockRequest || (initialStockRequest ? initialStockRequest._id : ''),
    quantity: initialData.quantity || (initialStockRequest ? initialStockRequest.quantity : ''),
    from: initialData.from || (initialStockRequest ? initialStockRequest.branchOwner?.address || '' : ''),
  });

  useEffect(() => {
    setForm({
      stockRequest: initialStockRequest ? initialStockRequest._id : '',
      bundleSize: '',
      quantity: initialStockRequest ? initialStockRequest.quantity : '',
      from: initialStockRequest ? initialStockRequest.branchOwner?.address || '' : '',
      to: '',
      ...initialData,
      stockRequest: initialData.stockRequest?._id || initialData.stockRequest || (initialStockRequest ? initialStockRequest._id : ''),
      quantity: initialData.quantity || (initialStockRequest ? initialStockRequest.quantity : ''),
      from: initialData.from || (initialStockRequest ? initialStockRequest.branchOwner?.address || '' : ''),
    });
  }, [JSON.stringify(initialData), JSON.stringify(initialStockRequest)]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Stock Request</label>
        <select
          name="stockRequest"
          value={form.stockRequest}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Stock Request</option>
          {stockRequests.map((req) => (
            <option key={req._id} value={req._id}>
              {req.productName} (Qty: {req.quantity})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Bundle Size</label>
        <input
          type="number"
          name="bundleSize"
          value={form.bundleSize}
          onChange={handleChange}
          required
          min="1"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
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
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">From</label>
        <input
          type="text"
          name="from"
          value={form.from}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">To</label>
        <input
          type="text"
          name="to"
          value={form.to}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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

export default TransportForm;
