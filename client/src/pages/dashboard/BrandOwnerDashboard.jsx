// pages/dashboard/BrandOwnerDashboard.jsx
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { TrendingUp, Clock, Building2, CheckCircle, XCircle } from 'lucide-react'
import { getSales } from '../../store/slices/salesSlice'
import { getStockRequests } from '../../store/slices/stockRequestsSlice'

const BrandOwnerDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { sales } = useSelector((state) => state.sales)
  const { stockRequests } = useSelector((state) => state.stockRequests)

  useEffect(() => {
    dispatch(getSales())
    dispatch(getStockRequests())
  }, [dispatch])

  // Filter data for assigned branches only
  const assignedSales = sales?.filter(sale => 
    sale.branchOwner?.assignedManager === user?._id
  ) || []

  const assignedRequests = stockRequests?.filter(request => 
    request.branchOwner?.assignedManager === user?._id
  ) || []

  const stats = [
    {
      title: 'Total Sales',
      value: `$${assignedSales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Pending Approvals',
      value: assignedRequests.filter(req => req.status === 'Pending').length,
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Active Branches',
      value: new Set(assignedSales.map(sale => sale.branchOwner?._id)).size,
      icon: Building2,
      color: 'green'
    },
    {
      title: 'Approval Rate',
      value: `${((assignedRequests.filter(req => req.status === 'Approved').length / assignedRequests.length) * 100 || 0).toFixed(1)}%`,
      icon: CheckCircle,
      color: 'purple'
    }
  ]

  const recentRequests = assignedRequests.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Brand Owner Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-success-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Approve Requests</span>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">View Reports</span>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors">
            <div className="text-center">
              <Building2 className="h-8 w-8 text-warning-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-700">Manage Branches</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Stock Requests */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Stock Requests</h2>
        <div className="space-y-3">
          {recentRequests.map((request) => (
            <div key={request._id} className="flex items-center justify-between p-3 border-b border-gray-100">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{request.productName}</p>
                <p className="text-sm text-gray-600">
                  {request.branchOwner?.name} • Qty: {request.quantity}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  request.priority === 'High' 
                    ? 'bg-danger-100 text-danger-800'
                    : request.priority === 'Medium'
                    ? 'bg-warning-100 text-warning-800'
                    : 'bg-success-100 text-success-800'
                }`}>
                  {request.priority}
                </span>
                {request.status === 'Pending' ? (
                  <div className="flex space-x-1">
                    <button className="p-1 text-success-600 hover:bg-success-50 rounded">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-danger-600 hover:bg-danger-50 rounded">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === 'Approved'
                      ? 'bg-success-100 text-success-800'
                      : 'bg-danger-100 text-danger-800'
                  }`}>
                    {request.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BrandOwnerDashboard