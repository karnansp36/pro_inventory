import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    cash: '',
    gpay: '',
    creditCard: '',
    date: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { cash, gpay, creditCard, date } = formData;

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sales', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSales(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch sales.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setFormData({
          cash: '',
          gpay: '',
          creditCard: '',
          date: '',
        });
        fetchSales();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to add sale.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        const response = await fetch(`/api/sales/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          fetchSales(); // Refresh the list
        } else {
          const data = await response.json();
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to delete sale.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading sales...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sales</h1>

      {(user.role === 'BranchOwner') && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Add New Sale</h2>
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cash">
                Cash
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="cash"
                type="number"
                placeholder="Cash Amount"
                name="cash"
                value={cash}
                onChange={onChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gpay">
                GPay
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="gpay"
                type="number"
                placeholder="GPay Amount"
                name="gpay"
                value={gpay}
                onChange={onChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="creditCard">
                Credit Card
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="creditCard"
                type="number"
                placeholder="Credit Card Amount"
                name="creditCard"
                value={creditCard}
                onChange={onChange}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                Date
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="date"
                type="date"
                name="date"
                value={date}
                onChange={onChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Add Sale
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Existing Sales</h2>
      {sales.length === 0 ? (
        <p>No sales found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Branch Owner</th>
                <th className="py-2 px-4 border-b">Cash</th>
                <th className="py-2 px-4 border-b">GPay</th>
                <th className="py-2 px-4 border-b">Credit Card</th>
                <th className="py-2 px-4 border-b">Total</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td className="py-2 px-4 border-b">{sale.branchOwner.name}</td>
                  <td className="py-2 px-4 border-b">{sale.cash}</td>
                  <td className="py-2 px-4 border-b">{sale.gpay}</td>
                  <td className="py-2 px-4 border-b">{sale.creditCard}</td>
                  <td className="py-2 px-4 border-b">{sale.total}</td>
                  <td className="py-2 px-4 border-b">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">
                    {(user.role === 'Admin' || user.role === 'BrandOwner') && (
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        onClick={() => handleDelete(sale._id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Sales;