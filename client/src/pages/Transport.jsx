import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Transport() {
  const { user } = useAuth();
  const [transports, setTransports] = useState([]);
  const [formData, setFormData] = useState({
    stockRequest: '',
    bundleSize: '',
    quantity: '',
    from: '',
    to: '',
    receivedQuantity: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { stockRequest, bundleSize, quantity, from, to, receivedQuantity } = formData;

  const fetchTransports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transport', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTransports(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch transport details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransports();
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
      const response = await fetch('/api/transport', {
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
          stockRequest: '',
          bundleSize: '',
          quantity: '',
          from: '',
          to: '',
          receivedQuantity: '',
        });
        fetchTransports();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to add transport details.');
      console.error(err);
    }
  };

  const handleConfirmReceived = async (id) => {
    const receivedQty = prompt('Enter received quantity:');
    if (receivedQty !== null && !isNaN(receivedQty) && receivedQty !== '') {
      try {
        const response = await fetch(`/api/transport/${id}/receive`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ receivedQuantity: Number(receivedQty) }),
        });
        if (response.ok) {
          fetchTransports();
        } else {
          const data = await response.json();
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to confirm received quantity.');
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transport detail?')) {
      try {
        const response = await fetch(`/api/transport/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (response.ok) {
          fetchTransports(); // Refresh the list
        } else {
          const data = await response.json();
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to delete transport detail.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading transport details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Transport Management</h1>

      {(user.role === 'Admin' || user.role === 'BrandOwner') && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-4">Add New Transport Details</h2>
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stockRequest">
                Stock Request ID
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="stockRequest"
                type="text"
                placeholder="Stock Request ID"
                name="stockRequest"
                value={stockRequest}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bundleSize">
                Bundle Size
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="bundleSize"
                type="number"
                placeholder="Bundle Size"
                name="bundleSize"
                value={bundleSize}
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
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="from">
                From Location
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="from"
                type="text"
                placeholder="From Location"
                name="from"
                value={from}
                onChange={onChange}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="to">
                To Location
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="to"
                type="text"
                placeholder="To Location"
                name="to"
                value={to}
                onChange={onChange}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Add Transport
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Existing Transport Details</h2>
      {transports.length === 0 ? (
        <p>No transport details found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Stock Request ID</th>
                <th className="py-2 px-4 border-b">Bundle Size</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">From</th>
                <th className="py-2 px-4 border-b">To</th>
                <th className="py-2 px-4 border-b">Received Quantity</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transports.map((transport) => (
                <tr key={transport._id}>
                  <td className="py-2 px-4 border-b">{transport.stockRequest.productName}</td>
                  <td className="py-2 px-4 border-b">{transport.bundleSize}</td>
                  <td className="py-2 px-4 border-b">{transport.quantity}</td>
                  <td className="py-2 px-4 border-b">{transport.from}</td>
                  <td className="py-2 px-4 border-b">{transport.to}</td>
                  <td className="py-2 px-4 border-b">
                    {transport.receivedQuantity !== undefined ? transport.receivedQuantity : 'N/A'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {(user.role === 'BranchOwner' && !transport.receivedQuantity) && (
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2"
                        onClick={() => handleConfirmReceived(transport._id)}
                      >
                        Confirm
                      </button>
                    )}
                    {(user.role === 'Admin' || user.role === 'BrandOwner') && (
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        onClick={() => handleDelete(transport._id)}
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

export default Transport;