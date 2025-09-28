import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTransport } from '../../../store/slices/transportSlice';

const TransportTable = () => {
  const dispatch = useDispatch();
  const { transport, loading, error } = useSelector((state) => state.transport);

  useEffect(() => {
    dispatch(getTransport());
  }, [dispatch]);

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Transport Receipts</h2>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-600 py-4">{error}</div>
      ) : (
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
            {transport && transport.length > 0 ? (
              transport.map((t, i) => (
                <tr key={t._id || i}>
                  <td>{new Date(t.createdAt || t.date).toLocaleDateString()}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td>{t.quantity}</td>
                  <td>{t.receivedQuantity ?? '-'}</td>
                  <td>{t.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">No transport records found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default TransportTable;
