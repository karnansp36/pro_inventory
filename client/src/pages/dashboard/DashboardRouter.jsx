// pages/dashboard/DashboardRouter.jsx
import { useSelector } from 'react-redux';
import AdminRoutes from '../../routes/AdminRoutes';
import BrandOwnerDashboard from './BrandOwnerDashboard';
import ManagerDashboard from './ManagerDashboard';
import BranchOwnerDashboard from './branch-owner/BranchDashboard';

const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminRoutes />;
      case 'BrandOwner':
        return <BrandOwnerDashboard />;
      case 'Manager':
        return <ManagerDashboard />;
      case 'BranchOwner':
        return <BranchOwnerDashboard />;
      default:
        return <div>Loading...</div>;
    }
  };

  return renderDashboard();
};

export default DashboardRouter;