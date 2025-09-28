// components/branch-owner/StockRequestForm.jsx
import React, { useState } from 'react';

const StockRequestForm = ({ onRequestAdded }) => {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    priority: 'Normal'
  });

  const priorities = [
    { value: 'Urgent', label: '🚨 Urgent', color: 'red' },
    { value: 'Required', label: '⚠️ Required', color: 'orange' },
    { value: 'Normal', label: '✅ Normal', color: 'green' }
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
      // TODO: Replace with actual API call
      const response = await fetch('/api/stock-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        // Reset form
        setFormData({
          productName: '',
          quantity: '',
          priority: 'Normal'
        });
        
        // Notify parent component
        onRequestAdded();
        
        alert('Stock request submitted successfully!');
      } else {
        throw new Error('Failed to submit stock request');
      }
    } catch (error) {
      console.error('Error submitting stock request:', error);
      alert('Error submitting stock request. Please try again.');
    }
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : 'gray';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Request Stock</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter quantity..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Priority:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium bg-${getPriorityColor(formData.priority)}-100 text-${getPriorityColor(formData.priority)}-800`}>
              {formData.priority}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default StockRequestForm;