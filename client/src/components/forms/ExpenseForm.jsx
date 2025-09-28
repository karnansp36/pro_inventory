import React, { useState, useEffect } from 'react';


import { useSelector } from 'react-redux';

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
    date: '',
    branchOwner: '',
    ...safeInitialData,
    branchOwner: safeInitialData.branchOwner && typeof safeInitialData.branchOwner === 'object'
      ? safeInitialData.branchOwner._id
      : safeInitialData.branchOwner || '',
  });


  useEffect(() => {
    const safeInitialData = initialData || {};
    setForm({
      category: '',
      amount: '',
      description: '',
      date: '',
      branchOwner: '',
      ...safeInitialData,
      branchOwner: safeInitialData.branchOwner && typeof safeInitialData.branchOwner === 'object'
        ? safeInitialData.branchOwner._id
        : safeInitialData.branchOwner || '',
    });
  }, [initialData]);

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
      {isAdminOrBrandOwner && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch Owner</label>
          <select
            name="branchOwner"
            value={form.branchOwner}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Branch Owner</option>
            {users?.filter(u => u.role === 'BranchOwner').map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          required
          min="0"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          name="date"
          value={form.date ? form.date.slice(0, 10) : ''}
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

export default ExpenseForm;
