// pages/dashboard/DashboardRouter.jsx
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import BrandOwnerDashboard from './brand-owner/BrandOwnerDashboard';
import ManagerDashboard from './manager/ManagerDashboard';
import BranchOwnerRoutes from '../../routes/BranchOwnerRoutes'; // Import the BranchOwnerRoutes component

const DashboardRouter = () => {
  return (
    <Routes>
      <Route path="admin/*" element={<AdminDashboard />} />
      <Route path="brand-owner/*" element={<BrandOwnerDashboard />} />
      <Route path="manager/*" element={<ManagerDashboard />} />
      <Route path="branch-owner/*" element={<BranchOwnerRoutes />} />
      {/* Default or fallback route if no specific role path matches */}
      <Route path="*" element={<div>Select a dashboard</div>} />
    </Routes>
  );
};

export default DashboardRouter;