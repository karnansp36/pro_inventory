// routes/AdminRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import UserManagement from '../pages/dashboard/admin/UserManagement';
import UserView from '../pages/dashboard/admin/UserView';
import SalesManagement from '../pages/dashboard/admin/SalesManagement';
import ExpensesManagement from '../pages/dashboard/admin/ExpensesManagement';
import StockRequestsManagement from '../pages/dashboard/admin/StockRequestsManagement';
import TransportManagement from '../pages/dashboard/admin/TransportManagement';
import Reports from '../pages/dashboard/admin/Reports';
import Exports from '../pages/dashboard/admin/Exports';
import ActivityLogs from '../pages/dashboard/admin/ActivityLogs';
import DailyStoreImageAdminPage from '../pages/dashboard/admin/DailyStoreImageAdminPage';

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="user-view/:id" element={<UserView />} />
        <Route path="sales" element={<SalesManagement />} />
        <Route path="expenses" element={<ExpensesManagement />} />
        <Route path="stock-requests" element={<StockRequestsManagement />} />
        <Route path="transport" element={<TransportManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="exports" element={<Exports />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="daily-store-images" element={<DailyStoreImageAdminPage />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;