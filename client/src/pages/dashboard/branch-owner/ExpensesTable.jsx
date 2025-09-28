import React from 'react';
// TODO: Fetch expenses data from API
const ExpensesTable = () => {
  // Example static data
  const expenses = [
    { date: '2025-09-27', category: 'Supplies', amount: 200, description: 'Paper, pens' },
    { date: '2025-09-26', category: 'Rent', amount: 1000, description: 'Monthly rent' },
  ];
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Expenses</h2>
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
          {expenses.map((e, i) => (
            <tr key={i}>
              <td>{e.date}</td>
              <td>{e.category}</td>
              <td>{e.amount}</td>
              <td>{e.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ExpensesTable;
