import { useEffect, useState } from 'react';
import api from '../../../services/api';
import ShopProfile from '../branch-owner/ShopProfile';
import SalesTable from '../branch-owner/SalesTable';
import ExpensesTable from '../branch-owner/ExpensesTable';
import StockRequestsTable from '../branch-owner/StockRequestsTable';
import TransportTable from '../branch-owner/TransportTable';
import ReportsPanel from '../branch-owner/ReportsPanel';
import DailyStoreImageAdminPage from './DailyStoreImageAdminPage'; // Assuming this can be reused or adapted

const BranchOwnerDetailsView = ({ branchOwnerId, onClose }) => {
  const [branchOwner, setBranchOwner] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [stockRequestsData, setStockRequestsData] = useState([]);
  const [transportData, setTransportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBranchOwnerDetails = async () => {
      try {
        // Fetch Branch Owner Profile
        const userRes = await api.get(`/users/${branchOwnerId}`);
        setBranchOwner(userRes.data);

        // Fetch Sales Data
        const salesRes = await api.get(`/sales/branch/${branchOwnerId}`);
        setSalesData(salesRes.data);

        // Fetch Expenses Data
        const expensesRes = await api.get(`/expenses/branch/${branchOwnerId}`);
        setExpensesData(expensesRes.data);

        // Fetch Stock Requests Data
        const stockRequestsRes = await api.get(`/stockrequests/branch/${branchOwnerId}`);
        setStockRequestsData(stockRequestsRes.data);

        // Fetch Transport Data
        const transportRes = await api.get(`/transport/branch/${branchOwnerId}`);
        setTransportData(transportRes.data);

      } catch (err) {
        console.error('Failed to fetch branch owner details:', err);
        setError('Failed to load branch owner details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBranchOwnerDetails();
  }, [branchOwnerId]);

  if (loading) return <div className="p-8">Loading branch owner details...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!branchOwner) return <div className="p-8">Branch owner not found.</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Branch Owner Details: {branchOwner.name}</h1>
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Back to User Details
        </button>
      </div>

      {/* Shop Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Shop Profile</h2>
        <ShopProfile userId={branchOwnerId} />
      </div>

      {/* Sales Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Sales</h2>
        <SalesTable sales={salesData} />
      </div>

      {/* Expenses Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Expenses</h2>
        <ExpensesTable expenses={expensesData} />
      </div>

      {/* Stock Requests Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Stock Requests</h2>
        <StockRequestsTable stockRequests={stockRequestsData} />
      </div>

      {/* Transport Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Transport</h2>
        <TransportTable transport={transportData} />
      </div>

      {/* Daily Store Images */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Daily Store Images</h2>
        <DailyStoreImageAdminPage branchOwnerId={branchOwnerId} />
      </div>

      {/* Reports Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Reports</h2>
        <ReportsPanel userId={branchOwnerId} />
      </div>
    </div>
  );
};

export default BranchOwnerDetailsView;