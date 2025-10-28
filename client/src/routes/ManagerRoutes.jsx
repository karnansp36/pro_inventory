// client/src/routes/ManagerRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import ManagerLayout from '../components/layout/ManagerLayout';
import ManagerDashboard from '../pages/dashboard/manager/ManagerDashboard';
import ManagerSales from '../pages/dashboard/manager/ManagerSales';
import ManagerStock from '../pages/dashboard/manager/ManagerStock';
import ManagerTransport from '../pages/dashboard/manager/ManagerTransport';
import ManagerBranchOwners from '../pages/dashboard/manager/ManagerBranchOwners';
import ManagerBranchDetails from '../pages/dashboard/manager/ManagerBranchDetails';
import ManagerDailyStore from '../pages/dashboard/manager/ManagerDailyStore';
import UserProfilePage from '../pages/dashboard/UserProfilePage';

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route element={<ManagerLayout />}>
        <Route index element={<ManagerDashboard />} />
        <Route path="sales" element={<ManagerSales />} />
        <Route path="stock-requests/:managerId" element={<ManagerStock />} />
        <Route path="transport" element={<ManagerTransport />} />
         <Route path="branch-owners" element={<ManagerBranchOwners />} />
        <Route path="branch-owners/:branchId" element={<ManagerBranchDetails />} />
        <Route path="daily-store-images" element={<ManagerDailyStore />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="*" element={<ManagerDashboard />} />
      </Route>
    </Routes>
  );
};

export default ManagerRoutes;