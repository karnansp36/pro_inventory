// App.jsx
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getCurrentUser } from './store/slices/authSlice'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './components/auth/Login';
import DashboardRouter from './pages/dashboard/DashboardRouter'
import BranchOwnerRoutes from './routes/BranchOwnerRoutes'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  useEffect(() => {
    // Check if user is logged in on app start
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser())
    }
  }, [dispatch])

  const isBranchOwner = user?.role === 'BranchOwner'

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Main Dashboard Route */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                {isBranchOwner ? (
                  <Layout>
                    <BranchOwnerRoutes />
                  </Layout>
                ) : (
                  <DashboardRouter />
                )}
              </ProtectedRoute>
            }
          />
          
          {/* Direct routes for backward compatibility */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'BrandOwner']}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <ToastContainer />
    </Router>
  )
}

export default App