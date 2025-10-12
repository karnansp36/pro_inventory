// pages/dashboard/branch-owner/BranchDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getDailyStoreImagesForBranchOwner, reset } from '../../../../src/store/slices/dailyStoreImageSlice';
import ShopProfile from './ShopProfile';
import SalesTable from './SalesTable';
import ExpensesTable from './ExpensesTable';
import StockRequestsTable from './StockRequestsTable';
import TransportTable from './TransportTable';
import ReportsPanel from './ReportsPanel';
import ExpenseForm from '../../../components/forms/ExpenseForm';
import TransportForm from '../../../components/forms/TransportForm';
import QuickAddForm from '../../../components/forms/QuickAddForm';
import Modal from '../../../components/Modal';
import { createSale } from '../../../store/slices/salesSlice';
import { createExpense } from '../../../store/slices/expensesSlice';
import { createStockRequest } from '../../../store/slices/stockRequestsSlice';
import { createTransport } from '../../../store/slices/transportSlice';

const BranchDashboard = () => {
  const dispatch = useDispatch();
  const { branchOwnerId } = useParams();
  const [modal, setModal] = useState(null); // 'sale' | 'expense' | 'stock' | 'transport' | null
  const [loading, setLoading] = useState(false);

  const { dailyStoreImages, isLoading, isError, message } = useSelector(
    (state) => state.dailyStoreImages
  );

  // Handlers for opening modals
  const openModal = (type) => setModal(type);
  const closeModal = () => setModal(null);

  // Submit handlers
  const handleAddSale = async (form) => {
    setLoading(true);
    await dispatch(createSale(form));
    setLoading(false);
    closeModal();
  };
  const handleAddExpense = async (form) => {
    setLoading(true);
    await dispatch(createExpense(form));
    setLoading(false);
    closeModal();
  };
  const handleAddStockRequest = async (form) => {
    setLoading(true);
    await dispatch(createStockRequest(form));
    setLoading(false);
    closeModal();
  };
  const handleAddTransport = async (form) => {
    setLoading(true);
    await dispatch(createTransport(form));
    setLoading(false);
    closeModal();
  };

  useEffect(() => {
    // Fetch data for the specific branch owner using branchOwnerId
    // Example:
    // dispatch(fetchSalesData(branchOwnerId));
    // dispatch(fetchExpensesData(branchOwnerId));
    // ...
  }, [dispatch, branchOwnerId]);

  useEffect(() => {
    dispatch(getDailyStoreImagesForBranchOwner());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Branch Owner Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back! Ready for today's operations?
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex flex-wrap gap-4">
        <button onClick={() => openModal('sale')} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Add Sale</button>
        <button onClick={() => openModal('expense')} className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">Add Expense</button>
        <button onClick={() => openModal('stock')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Request Stock</button>
        <button onClick={() => openModal('transport')} className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700">Add Transport</button>
      </div>

      {/* Modals for forms */}
      {modal === 'sale' && (
        <Modal onClose={closeModal} title="Add Sale">
          <QuickAddForm onSubmit={handleAddSale} onCancel={closeModal} loading={loading} />
        </Modal>
      )}
      {modal === 'expense' && (
        <Modal onClose={closeModal} title="Add Expense">
          <ExpenseForm onSubmit={handleAddExpense} onCancel={closeModal} loading={loading} />
        </Modal>
      )}
      {modal === 'stock' && (
        <Modal onClose={closeModal} title="Request Stock">
          {/* You can create a StockRequestForm if needed, for now reuse QuickAddForm */}
          <QuickAddForm type="stock" onSubmit={handleAddStockRequest} onCancel={closeModal} loading={loading} />
        </Modal>
      )}
      {modal === 'transport' && (
        <Modal onClose={closeModal} title="Add Transport">
          <TransportForm onSubmit={handleAddTransport} onCancel={closeModal} loading={loading} />
        </Modal>
      )}

      {/* Shop Profile */}
      <ShopProfile />

      {/* Data Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SalesTable branchOwnerId={branchOwnerId} />
          <ExpensesTable branchOwnerId={branchOwnerId} />
        </div>
        <div className="space-y-6">
          <StockRequestsTable branchOwnerId={branchOwnerId} />
          <TransportTable branchOwnerId={branchOwnerId} />
        </div>
      </div>

      {/* Reports */}
      <ReportsPanel branchOwnerId={branchOwnerId} />

      {/* Daily Store Images */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Daily Store Images</h2>
        {isLoading ? (
          <p>Loading images...</p>
        ) : isError ? (
          <p className="text-red-500">Error: {message}</p>
        ) : dailyStoreImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyStoreImages.map((img) => (
              <div key={img._id} className="border rounded-lg overflow-hidden shadow-sm">
                <img
                  src={`http://localhost:5000/${img.img}`} // Adjust path as needed
                  alt="Daily Store"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600">
                    Uploaded At: {new Date(img.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default BranchDashboard;
