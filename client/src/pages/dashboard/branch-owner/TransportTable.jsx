import React from 'react';
// TODO: Fetch transport data from API
const TransportTable = () => {
  // Example static data
  const transports = [
    { date: '2025-09-27', from: 'Warehouse', to: 'My Branch Shop', quantity: 20, received: 20, status: 'Delivered' },
    { date: '2025-09-26', from: 'Warehouse', to: 'My Branch Shop', quantity: 50, received: 48, status: 'Delivered' },
  ];
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Transport Receipts</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>From</th>
            <th>To</th>
            <th>Sent Qty</th>
            <th>Received Qty</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transports.map((t, i) => (
            <tr key={i}>
              <td>{t.date}</td>
              <td>{t.from}</td>
              <td>{t.to}</td>
              <td>{t.quantity}</td>
              <td>{t.received}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TransportTable;
