// client/src/routes/ManagerRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import ManagerLayout from '../components/layout/ManagerLayout';
import ManagerDashboard from '../pages/dashboard/manager/ManagerDashboard';
import ManagerSales from '../pages/dashboard/manager/ManagerSales';
import ManagerStock from '../pages/dashboard/manager/ManagerStock';
import ManagerTransport from '../pages/dashboard/manager/ManagerTransport';
import ManagerBranchOwners from '../pages/dashboard/manager/ManagerBranchOwners';
import ManagerDailyStore from '../pages/dashboard/manager/ManagerDailyStore';
import UserProfilePage from '../pages/dashboard/UserProfilePage';
import ManagerBranchDashboard from '../pages/dashboard/manager/ManagerBranchDashboard';
import ManagerProductPaymentsPage from '../pages/dashboard/manager/ManagerProductPaymentsPage';

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ManagerDashboard />} />

      <Route path="/manager-product-payments" element={<ManagerProductPaymentsPage />} />
      {/* Add ManagerLayout as the main layout for branch-specific routes */}
      <Route path="/branch/:branchId" element={<ManagerLayout />}>
        <Route index element={<ManagerBranchDashboard />} />
        <Route path="sales" element={<ManagerSales />} />
        <Route path="stock-requests" element={<ManagerStock />} />
        <Route path="transport" element={<ManagerTransport />} />
        <Route path="branch-owners" element={<ManagerBranchOwners />} />
        <Route path="daily-store-images" element={<ManagerDailyStore />} />
        <Route path="profile" element={<UserProfilePage />} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;