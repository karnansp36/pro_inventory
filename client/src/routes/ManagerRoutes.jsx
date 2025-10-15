// client/src/routes/ManagerRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import ManagerLayout from '../components/layout/ManagerLayout';
import ManagerDashboard from '../pages/dashboard/manager/ManagerDashboard';
import ManagerSalesPage from '../pages/dashboard/manager/ManagerSalesPage';
import ManagerExpensesPage from '../pages/dashboard/manager/ManagerExpensesPage';
import ManagerStockRequestsPage from '../pages/dashboard/manager/ManagerStockRequestsPage';
import ManagerTransportPage from '../pages/dashboard/manager/ManagerTransportPage';
import ManagerReportsPage from '../pages/dashboard/manager/ManagerReportsPage';
import ManagerBranchOwnersPage from '../pages/dashboard/manager/ManagerBranchOwnersPage';
import ManagerBranchOwnerViewPage from '../pages/dashboard/manager/ManagerBranchOwnerViewPage';
import DailyStoreImageManagerPage from '../pages/dashboard/manager/DailyStoreImageManagerPage';

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route element={<ManagerLayout />}>
        <Route index element={<ManagerDashboard />} />
        <Route path="sales" element={<ManagerSalesPage />} />
        <Route path="expenses" element={<ManagerExpensesPage />} />
        <Route path="stock-requests" element={<ManagerStockRequestsPage />} />
        <Route path="transport" element={<ManagerTransportPage />} />
        <Route path="reports" element={<ManagerReportsPage />} />
        <Route path="branch-owners" element={<ManagerBranchOwnersPage />} />
        <Route path="branch-owners/:id" element={<ManagerBranchOwnerViewPage />} />
        <Route path="daily-store-images" element={<DailyStoreImageManagerPage />} />
        <Route path="*" element={<ManagerDashboard />} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;