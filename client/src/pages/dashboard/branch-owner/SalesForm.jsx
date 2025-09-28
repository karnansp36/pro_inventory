// components/branch-owner/SalesForm.jsx
import React, { useState } from 'react';

const SalesForm = ({ onSaleAdded }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    cash: '',
    gpay: '',
    creditCard: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    const cash = parseFloat(formData.cash) || 0;
    const gpay = parseFloat(formData.gpay) || 0;
    const creditCard = parseFloat(formData.creditCard) || 0;
    return cash + gpay + creditCard;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const saleData = {
      ...formData,
      cash: parseFloat(formData.cash) || 0,
      gpay: parseFloat(formData.gpay) || 0,
      creditCard: parseFloat(formData.creditCard) || 0,
      total: calculateTotal()
    };

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          cash: '',
          gpay: '',
          creditCard: ''
        });
        
        // Notify parent component
        onSaleAdded();
        
        alert('Sale recorded successfully!');
      } else {
        throw new Error('Failed to record sale');
      }
    } catch (error) {
      console.error('Error recording sale:', error);
      alert('Error recording sale. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Record Daily Sales</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cash Amount
          </label>
          <input
            type="number"
            name="cash"
            value={formData.cash}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GPay Amount
          </label>
          <input
            type="number"
            name="gpay"
            value={formData.gpay}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Credit Card Amount
          </label>
          <input
            type="number"
            name="creditCard"
            value={formData.creditCard}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <div className="p-3 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total:</span>
            <span className="text-lg font-bold text-green-600">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Record Sale
        </button>
      </form>
    </div>
  );
};

export default SalesForm;