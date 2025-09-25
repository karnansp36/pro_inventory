import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [salesTotal, setSalesTotal] = useState(0);
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [stockRequestsCount, setStockRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Sales Data
      const salesResponse = await fetch('/api/sales', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const salesData = await salesResponse.json();
      if (salesResponse.ok) {
        const total = salesData.reduce((acc, sale) => acc + sale.total, 0);
        setSalesTotal(total);
      } else {
        setError(salesData.message);
      }

      // Fetch Expenses Data
      const expensesResponse = await fetch('/api/expenses', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const expensesData = await expensesResponse.json();
      if (expensesResponse.ok) {
        const total = expensesData.reduce((acc, expense) => acc + expense.amount, 0);
        setExpensesTotal(total);
      } else {
        setError(expensesData.message);
      }

      // Fetch Stock Requests Data
      const stockRequestsResponse = await fetch('/api/stockrequests', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const stockRequestsData = await stockRequestsResponse.json();
      if (stockRequestsResponse.ok) {
        setStockRequestsCount(stockRequestsData.length);
      } else {
        setError(stockRequestsData.message);
      }

    } catch (err) {
      setError('Failed to fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Welcome, {user.name} ({user.role})!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-bold mb-2">Total Sales</h2>
          <p className="text-3xl font-semibold">${salesTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-bold mb-2">Total Expenses</h2>
          <p className="text-3xl font-semibold">${expensesTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-bold mb-2">Total Stock Requests</h2>
          <p className="text-3xl font-semibold">{stockRequestsCount}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;