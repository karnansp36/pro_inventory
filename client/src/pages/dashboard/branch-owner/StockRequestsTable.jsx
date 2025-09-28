import React from 'react';
// TODO: Fetch stock requests from API
const StockRequestsTable = () => {
  // Example static data
  const requests = [
    { date: '2025-09-27', product: 'Milk', quantity: 20, priority: 'Urgent', status: 'Pending' },
    { date: '2025-09-26', product: 'Bread', quantity: 50, priority: 'Normal', status: 'Approved' },
  ];
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Stock Requests</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td>{r.product}</td>
              <td>{r.quantity}</td>
              <td>{r.priority}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default StockRequestsTable;
