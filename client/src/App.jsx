// App.jsx
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getCurrentUser } from './store/slices/authSlice'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './components/auth/Login'
import DashboardRouter from './pages/dashboard/DashboardRouter'
import AdminRoutes from './routes/AdminRoutes'
import BranchOwnerRoutes from './routes/BranchOwnerRoutes'
import BrandOwnerRoutes from './routes/BrandOwnerRoutes'
import ManagerRoutes from './routes/ManagerRoutes'


function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser())
    }
  }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const getDashboardRoute = () => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }

    switch (user.role) {
      case 'Admin':
        return <Navigate to="/dashboard/admin" replace />;
      case 'BranchOwner':
        return <Navigate to="/dashboard/branch-owner" replace />;
      case 'BrandOwner':
        return <Navigate to="/dashboard/brand-owner" replace />;
      case 'Manager':
        return <Navigate to="/dashboard/manager" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={getDashboardRoute()} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard/admin/*" element={<ProtectedRoute allowedRoles={['Admin']}><AdminRoutes /></ProtectedRoute>} />
          <Route path="/dashboard/branch-owner/*" element={<ProtectedRoute allowedRoles={['BranchOwner']}><BranchOwnerRoutes /></ProtectedRoute>} />
          <Route path="/dashboard/brand-owner/*" element={<ProtectedRoute allowedRoles={['BrandOwner']}><BrandOwnerRoutes /></ProtectedRoute>} />
          <Route path="/dashboard/manager/*" element={<ProtectedRoute allowedRoles={['Manager']}><ManagerRoutes /></ProtectedRoute>} />
        </Routes>
      </div>
      <ToastContainer />
    </>
  )
}

export default App