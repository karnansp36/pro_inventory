// routes/BranchOwnerRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import BranchOwnerLayout from '../components/layout/BranchOwnerLayout';
import BranchOwnerDashboard from '../pages/dashboard/branch-owner/BranchOwnerDashboard';
import SalesPage from '../pages/dashboard/branch-owner/SalesPage';
import ExpensesPage from '../pages/dashboard/branch-owner/ExpensesPage';
import StockRequestsPage from '../pages/dashboard/branch-owner/StockRequestsPage';
import TransportPage from '../pages/dashboard/branch-owner/TransportPage';
import ReportsPage from '../pages/dashboard/branch-owner/ReportsPage';

const BranchOwnerRoutes = () => {
  return (
    <BranchOwnerLayout>
      <Routes>
        <Route path="dashboard" element={<BranchOwnerDashboard />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="stock-requests" element={<StockRequestsPage />} />
        <Route path="transport" element={<TransportPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Routes>
    </BranchOwnerLayout>
  );
};

export default BranchOwnerRoutes;