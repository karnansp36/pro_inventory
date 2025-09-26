// pages/dashboard/BranchOwnerDashboard.jsx
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, TrendingUp, CreditCard, Package, Truck } from 'lucide-react'
import { getSales, createSale } from '../../store/slices/salesSlice'
import { getExpenses, createExpense } from '../../store/slices/expensesSlice'
import { getStockRequests, createStockRequest } from '../../store/slices/stockRequestsSlice'
import { getTransport, updateTransport } from '../../store/slices/transportSlice'
import QuickAddForm from '../../components/forms/QuickAddForm'

const BranchOwnerDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { sales, loading: salesLoading } = useSelector((state) => state.sales)
  const { expenses, loading: expensesLoading } = useSelector((state) => state.expenses)
  const { stockRequests, loading: requestsLoading } = useSelector((state) => state.stockRequests)
  const { transport, loading: transportLoading } = useSelector((state) => state.transport)

  const [showQuickForm, setShowQuickForm] = useState('')

  useEffect(() => {
    dispatch(getSales())
    dispatch(getExpenses())
    dispatch(getStockRequests())
    dispatch(getTransport())
  }, [dispatch])

  // Filter data for current branch owner only
  const mySales = sales?.filter(sale => sale.branchOwner === user?._id) || []
  const myExpenses = expenses?.filter(expense => expense.branchOwner === user?._id) || []
  const myRequests = stockRequests?.filter(request => request.branchOwner === user?._id) || []
  const myTransport = transport?.filter(t => t.stockRequest?.branchOwner === user?._id) || []

  const stats = [
    {
      title: 'Daily Sales',
      value: `$${mySales
        .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
        .reduce((sum, sale) => sum + sale.total, 0)
        .toLocaleString()}`,
      icon: TrendingUp,
      color: 'blue',
      action: () => setShowQuickForm('sale')
    },
    {
      title: 'Monthly Expenses',
      value: `$${myExpenses
        .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((sum, exp) => sum + exp.amount, 0)
        .toLocaleString()}`,
      icon: CreditCard,
      color: 'orange',
      action: () => setShowQuickForm('expense')
    },
    {
      title: 'Pending Requests',
      value: myRequests.filter(req => req.status === 'Pending').length,
      icon: Package,
      color: 'green',
      action: () => setShowQuickForm('request')
    },
    {
      title: 'Transport Status',
      value: myTransport.filter(t => t.status === 'In Transit').length,
      icon: Truck,
      color: 'purple',
      action: () => setShowQuickForm('transport')
    }
  ]

  const handleQuickAdd = async (formData, type) => {
    try {
      switch (type) {
        case 'sale':
          await dispatch(createSale(formData)).unwrap()
          break
        case 'expense':
          await dispatch(createExpense(formData)).unwrap()
          break
        case 'request':
          await dispatch(createStockRequest(formData)).unwrap()
          break
      }
      setShowQuickForm('')
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Branch Dashboard</h1>
        <div className="bg-green-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-green-800">Operational Access</span>
        </div>
      </div>

      {/* Stats Grid with Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <button
            key={index}
            onClick={stat.action}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <Plus className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Add Forms Modal */}
      {showQuickForm && (
        <QuickAddForm
          type={showQuickForm}
          onClose={() => setShowQuickForm('')}
          onSubmit={(data) => handleQuickAdd(data, showQuickForm)}
        />
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Recent Sales */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
            <button 
              onClick={() => setShowQuickForm('sale')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Add Sale
            </button>
          </div>
          <div className="space-y-3">
            {mySales.slice(0, 5).map((sale) => (
              <div key={sale._id} className="flex items-center justify-between p-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Sale Record</p>
                  <p className="text-sm text-gray-600">{new Date(sale.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">${sale.total}</span>
                  <p className="text-xs text-gray-500">
                    C: ${sale.cash} • G: ${sale.gpay} • CC: ${sale.creditCard}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Stock Requests */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Stock Requests</h2>
            <button 
              onClick={() => setShowQuickForm('request')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              New Request
            </button>
          </div>
          <div className="space-y-3">
            {myRequests.slice(0, 5).map((request) => (
              <div key={request._id} className="flex items-center justify-between p-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{request.productName}</p>
                  <p className="text-sm text-gray-600">Qty: {request.quantity}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === 'Approved'
                      ? 'bg-success-100 text-success-800'
                      : request.status === 'Rejected'
                      ? 'bg-danger-100 text-danger-800'
                      : 'bg-warning-100 text-warning-800'
                  }`}>
                    {request.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{request.priority} Priority</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transport Updates */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transport Updates</h2>
        <div className="space-y-3">
          {myTransport.slice(0, 5).map((item) => (
            <div key={item._id} className="flex items-center justify-between p-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">{item.stockRequest?.productName}</p>
                <p className="text-sm text-gray-600">
                  From: {item.from} → To: {item.to}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.status === 'Delivered'
                    ? 'bg-success-100 text-success-800'
                    : 'bg-warning-100 text-warning-800'
                }`}>
                  {item.status}
                </span>
                {item.status === 'In Transit' && (
                  <button 
                    onClick={() => dispatch(updateTransport({
                      id: item._id,
                      receivedQuantity: item.quantity
                    }))}
                    className="ml-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Confirm Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BranchOwnerDashboard