// routes/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/dashboard/admin2/AdminDashboard";
import UserProfilePage from "../pages/dashboard/UserProfilePage";
import AdminManagerDashboard from "../pages/dashboard/admin2/AdminManagerDashboard";
import AdminBranchDashboard from "../pages/dashboard/admin2/AdminBranchDashboard";
import AdminSales from "../pages/dashboard/admin2/AdminSales";
import AdminStock from "../pages/dashboard/admin2/AdminStock";
import AdminTransport from "../pages/dashboard/admin2/AdminTransport";
import AdminBranchOwners from "../pages/dashboard/admin2/AdminBranchOwners";
import AdminDailyStore from "../pages/dashboard/admin2/AdminDailyStore";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />

      <Route path="/manager/:managerId" element={<AdminManagerDashboard />} />

      <Route path="/branch/:branchId" element={<AdminLayout />}>
        <Route index element={<AdminBranchDashboard />} />
        <Route path="sales" element={<AdminSales />} />
        <Route path="stock-requests" element={<AdminStock />} />
        <Route path="transport" element={<AdminTransport />} />
        <Route path="branch-owners" element={<AdminBranchOwners />} />
        <Route path="daily-store-images" element={<AdminDailyStore />} />
        <Route path="profile" element={<UserProfilePage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
