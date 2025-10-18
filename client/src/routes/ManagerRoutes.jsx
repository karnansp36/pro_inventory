// client/src/routes/ManagerRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import ManagerLayout from '../components/layout/ManagerLayout';
import ManagerDashboard from '../pages/dashboard/manager/ManagerDashboard';
import ManagerSalesPage from '../pages/dashboard/manager/ManagerSalesPage';
import ManagerExpensesPage from '../pages/dashboard/manager/ManagerExpensesPage';
import ManagerStockRequestsPage from '../pages/dashboard/manager/ManagerStockRequestsPage';
import ManagerTransportPage from '../pages/dashboard/manager/ManagerTransportPage';
import ManagerReportsPage from '../pages/dashboard/manager/ManagerReportsPage';
import ManagerBranchOwners from '../pages/dashboard/manager/ManagerBranchOwners';
import ManagerBranchDetails from '../pages/dashboard/manager/ManagerBranchDetails';
import DailyStoreImageManagerPage from '../pages/dashboard/manager/DailyStoreImageManagerPage';

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route element={<ManagerLayout />}>
        <Route index element={<ManagerDashboard />} />
        <Route path="sales" element={<ManagerSalesPage />} />
        <Route path="expenses" element={<ManagerExpensesPage />} />
        <Route path="stock-requests/:managerId" element={<ManagerStockRequestsPage />} />
        <Route path="transport" element={<ManagerTransportPage />} />
        <Route path="reports" element={<ManagerReportsPage />} />
         <Route path="branch-owners" element={<ManagerBranchOwners />} />
        <Route path="branch-owners/:branchId" element={<ManagerBranchDetails />} />
        <Route path="daily-store-images" element={<DailyStoreImageManagerPage />} />
        <Route path="*" element={<ManagerDashboard />} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;