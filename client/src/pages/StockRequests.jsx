import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function StockRequests() {
  const { user } = useAuth();
  const [stockRequests, setStockRequests] = useState([]);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    priority: 'Normal',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { productName, quantity, priority } = formData;

  const fetchStockRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stockrequests', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setStockRequests(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch stock requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStockRequests();
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
      const response = await fetch('/api/stockrequests', {
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
          productName: '',
          quantity: '',
          priority: 'Normal',
        });
        fetchStockRequests();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create stock request.');
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`/api/stockrequests/${id}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        fetchStockRequests();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to approve stock request.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this stock request?')) {
      try {
        const response = await fetch(`/api/stockrequests/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          fetchStockRequests();
        } else {
          const data = await response.json();
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to delete stock request.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading stock requests...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Stock Requests</h1>

      {(user.role === 'BranchOwner') && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Create New Stock Request</h2>
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="productName">
                Product Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="productName"
                type="text"
                placeholder="Product Name"
                name="productName"
                value={productName}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                Quantity
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="quantity"
                type="number"
                placeholder="Quantity"
                name="quantity"
                value={quantity}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                Priority
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="priority"
                name="priority"
                value={priority}
                onChange={onChange}
                required
              >
                <option value="Normal">Normal</option>
                <option value="Required">Required</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Existing Stock Requests</h2>
      {stockRequests.length === 0 ? (
        <p>No stock requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Product Name</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Priority</th>
                <th className="py-2 px-4 border-b">Approved</th>
                <th className="py-2 px-4 border-b">Branch Owner</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockRequests.map((request) => (
                <tr key={request._id}>
                  <td className="py-2 px-4 border-b">{request.productName}</td>
                  <td className="py-2 px-4 border-b">{request.quantity}</td>
                  <td className={`py-2 px-4 border-b ${request.priority === 'Urgent' ? 'text-red-500' : request.priority === 'Required' ? 'text-yellow-500' : 'text-green-500'}`}>
                    {request.priority}
                  </td>
                  <td className="py-2 px-4 border-b">{request.approved ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border-b">{request.branchOwner.name}</td>
                  <td className="py-2 px-4 border-b">
                    {(user.role === 'Admin' || user.role === 'BrandOwner') && !request.approved && (
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                        onClick={() => handleApprove(request._id)}
                      >
                        Approve
                      </button>
                    )}
                    {(user.role === 'Admin' || user.role === 'BrandOwner') && (
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        onClick={() => handleDelete(request._id)}
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

export default StockRequests;