import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExpenses } from '../../../store/slices/expensesSlice';

const ExpensesTable = () => {
  const dispatch = useDispatch();
  const { expenses, loading, error } = useSelector((state) => state.expenses);

  useEffect(() => {
    dispatch(getExpenses());
  }, [dispatch]);

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Expenses</h2>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-600 py-4">{error}</div>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {expenses && expenses.length > 0 ? (
              expenses.map((e, i) => (
                <tr key={e._id || i}>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.category}</td>
                  <td>{e.amount}</td>
                  <td>{e.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-4">No expenses found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default ExpensesTable;
