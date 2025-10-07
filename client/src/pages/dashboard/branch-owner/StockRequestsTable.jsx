import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStockRequests } from '../../../store/slices/stockRequestsSlice';

const StockRequestsTable = ({ branchOwnerId }) => {
  const dispatch = useDispatch();
  const { stockRequests, loading, error } = useSelector((state) => state.stockRequests);

  useEffect(() => {
    dispatch(getStockRequests({ branchOwnerId }));
  }, [dispatch, branchOwnerId]);

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Stock Requests</h2>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-600 py-4">{error}</div>
      ) : (
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
            {stockRequests && stockRequests.length > 0 ? (
              stockRequests.map((r, i) => (
                <tr key={r._id || i}>
                  <td>{new Date(r.createdAt || r.date).toLocaleDateString()}</td>
                  <td>{r.productName}</td>
                  <td>{r.quantity}</td>
                  <td>{r.priority}</td>
                  <td>{r.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-4">No stock requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default StockRequestsTable;
