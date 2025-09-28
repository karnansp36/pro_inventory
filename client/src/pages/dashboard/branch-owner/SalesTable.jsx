// components/branch-owner/SalesTable.jsx
import React, { useState, useEffect } from 'react';

const SalesTable = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales');
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      } else {
        throw new Error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      alert('Error loading sales data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Daily Sales</h2>
        <div className="text-center py-4">Loading sales data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Daily Sales</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Cash</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">GPay</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Credit Card</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sales.map((sale, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2">{new Date(sale.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">${sale.cash?.toFixed(2)}</td>
                <td className="px-4 py-2">${sale.gpay?.toFixed(2)}</td>
                <td className="px-4 py-2">${sale.creditCard?.toFixed(2)}</td>
                <td className="px-4 py-2 font-semibold text-green-600">
                  ${sale.total?.toFixed(2)}
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                  No sales records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;