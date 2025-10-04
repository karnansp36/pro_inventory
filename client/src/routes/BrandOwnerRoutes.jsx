// client/src/routes/BrandOwnerRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import BrandOwnerLayout from '../components/layout/BrandOwnerLayout';
import BrandOwnerDashboard from '../pages/dashboard/brand-owner/BrandOwnerDashboard.jsx';
import BrandOwnerUserManagement from '../pages/dashboard/brand-owner/BrandOwnerUserManagement';
import BrandOwnerSalesManagement from '../pages/dashboard/brand-owner/BrandOwnerSalesManagement';
import BrandOwnerExpensesManagement from '../pages/dashboard/brand-owner/BrandOwnerExpensesManagement';
import BrandOwnerStockRequestsManagement from '../pages/dashboard/brand-owner/BrandOwnerStockRequestsManagement';
import BrandOwnerTransportManagement from '../pages/dashboard/brand-owner/BrandOwnerTransportManagement';
import BrandOwnerReportsPage from '../pages/dashboard/brand-owner/BrandOwnerReportsPage';
import BrandOwnerExportsPage from '../pages/dashboard/brand-owner/BrandOwnerExportsPage';

const BrandOwnerRoutes = () => {
  return (
    <BrandOwnerLayout>
      <Routes>
        <Route index element={<BrandOwnerDashboard />} />
        <Route path="dashboard" element={<BrandOwnerDashboard />} />
        <Route path="users" element={<BrandOwnerUserManagement />} />
        <Route path="sales" element={<BrandOwnerSalesManagement />} />
        <Route path="expenses" element={<BrandOwnerExpensesManagement />} />
        <Route path="stock-requests" element={<BrandOwnerStockRequestsManagement />} />
        <Route path="transport" element={<BrandOwnerTransportManagement />} />
        <Route path="reports" element={<BrandOwnerReportsPage />} />
        <Route path="exports" element={<BrandOwnerExportsPage />} />
        <Route path="*" element={<BrandOwnerDashboard />} />
      </Routes>
    </BrandOwnerLayout>
  );
};

export default BrandOwnerRoutes;