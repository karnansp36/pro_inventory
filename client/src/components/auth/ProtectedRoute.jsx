// components/auth/ProtectedRoute.jsx
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../../store/slices/authSlice'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    if (!user && localStorage.getItem('token')) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute