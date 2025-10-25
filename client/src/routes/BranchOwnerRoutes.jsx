// routes/BranchOwnerRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import BranchOwnerLayout from '../components/layout/BranchOwnerLayout';
import BranchDashboard from '../pages/dashboard/branch-owner/BranchOwnerDashboard';
import SalesPage from '../pages/dashboard/branch-owner/SalesPage';
import ExpensesPage from '../pages/dashboard/branch-owner/ExpensesPage';
import StockRequestsPage from '../pages/dashboard/branch-owner/StockRequestsPage';
import TransportPage from '../pages/dashboard/branch-owner/TransportPage';
import ReportsPage from '../pages/dashboard/branch-owner/ReportsPage';
import DailyStoreImagePage from '../pages/dashboard/branch-owner/DailyStoreImagePage';
import UserProfilePage from '../pages/dashboard/UserProfilePage';

const BranchOwnerRoutes = () => {
  return (
    <Routes>
      <Route element={<BranchOwnerLayout />}>
        {/* Default index route for /dashboard and /dashboard/ */}
        <Route index element={<BranchDashboard />} />
        {/* Explicit dashboard route for /dashboard/dashboard */}
        <Route path="dashboard" element={<BranchDashboard />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="stock-requests" element={<StockRequestsPage />} />
        <Route path="transport" element={<TransportPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="daily-store-images" element={<DailyStoreImagePage />} />
        <Route path="profile" element={<UserProfilePage />} />
        {/* Catch-all: redirect to dashboard if no match */}
        <Route path="*" element={<BranchDashboard />} />
      </Route>
    </Routes>
  );
};

export default BranchOwnerRoutes;