// routes/BranchOwnerRoutes.jsx
import { Routes, Route, useParams } from 'react-router-dom';
import BranchOwnerLayout from '../components/layout/BranchOwnerLayout';
import BranchDashboard from '../pages/dashboard/branch-owner/BranchOwnerDashboard';
import SalesPage from '../pages/dashboard/branch-owner/SalesPage';
import ExpensesPage from '../pages/dashboard/branch-owner/ExpensesPage';
import StockRequestsPage from '../pages/dashboard/branch-owner/StockRequestsPage';
import TransportPage from '../pages/dashboard/branch-owner/TransportPage';
import ReportsPage from '../pages/dashboard/branch-owner/ReportsPage';

const BranchOwnerRoutes = () => {
  const { branchOwnerId } = useParams(); // Get branchOwnerId from URL

  return (
    <BranchOwnerLayout branchOwnerId={branchOwnerId}>
      <Routes>
        {/* Default index route for /dashboard and /dashboard/ */}
        <Route index element={<BranchDashboard />} />
        {/* Explicit dashboard route for /dashboard/dashboard */}
        <Route path="dashboard" element={<BranchDashboard />} />
        <Route path=":branchOwnerId/dashboard" element={<BranchDashboard />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path=":branchOwnerId/sales" element={<SalesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path=":branchOwnerId/expenses" element={<ExpensesPage />} />
        <Route path="stock-requests" element={<StockRequestsPage />} />
        <Route path=":branchOwnerId/stock-requests" element={<StockRequestsPage />} />
        <Route path="transport" element={<TransportPage />} />
        <Route path=":branchOwnerId/transport" element={<TransportPage />} />
        <Route path="reports" element={<ReportsPage />} />
         <Route path=":branchOwnerId/reports" element={<ReportsPage />} />
        {/* Catch-all: redirect to dashboard if no match */}
        <Route path="*" element={<BranchDashboard />} />
      </Routes>
    </BranchOwnerLayout>
  );
};

export default BranchOwnerRoutes;
