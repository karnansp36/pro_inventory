// pages/dashboard/ManagerDashboard.jsx
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Eye, TrendingUp, Package, CreditCard } from 'lucide-react'
import { getSales } from '../../store/slices/salesSlice'
import { getExpenses } from '../../store/slices/expensesSlice'
import { getStockRequests } from '../../store/slices/stockRequestsSlice'

const ManagerDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { sales } = useSelector((state) => state.sales)
  const { expenses } = useSelector((state) => state.expenses)
  const { stockRequests } = useSelector((state) => state.stockRequests)

  useEffect(() => {
    dispatch(getSales())
    dispatch(getExpenses())
    dispatch(getStockRequests())
  }, [dispatch])

  // Filter data for assigned branches only (read-only)
  const assignedSales = sales?.filter(sale => 
    sale.branchOwner?.assignedManager === user?._id
  ) || []

  const assignedExpenses = expenses?.filter(expense => 
    expense.branchOwner?.assignedManager === user?._id
  ) || []

  const assignedRequests = stockRequests?.filter(request => 
    request.branchOwner?.assignedManager === user?._id
  ) || []

  const stats = [
    {
      title: 'Total Sales',
      value: `$${assignedSales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'blue',
      description: 'Across all assigned branches'
    },
    {
      title: 'Total Expenses',
      value: `$${assignedExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}`,
      icon: CreditCard,
      color: 'orange',
      description: 'Monthly expenses'
    },
    {
      title: 'Stock Requests',
      value: assignedRequests.length,
      icon: Package,
      color: 'green',
      description: 'Pending & approved'
    },
    {
      title: 'Branch Performance',
      value: 'Good',
      icon: Eye,
      color: 'purple',
      description: 'Overall rating'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-600">Read Only Access</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h2>
          <div className="space-y-3">
            {assignedSales.slice(0, 5).map((sale) => (
              <div key={sale._id} className="flex items-center justify-between p-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{sale.branchOwner?.name}</p>
                  <p className="text-sm text-gray-600">{new Date(sale.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">${sale.total}</span>
                  <p className="text-xs text-gray-500">
                    Cash: ${sale.cash} • GPay: ${sale.gpay}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h2>
          <div className="space-y-3">
            {assignedExpenses.slice(0, 5).map((expense) => (
              <div key={expense._id} className="flex items-center justify-between p-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{expense.category}</p>
                  <p className="text-sm text-gray-600">{expense.branchOwner?.name}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">${expense.amount}</span>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                    {expense.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance Summary</h2>
        <div className="space-y-4">
          {Array.from(new Set(assignedSales.map(s => s.branchOwner?._id))).slice(0, 3).map(branchId => {
            const branchSales = assignedSales.filter(s => s.branchOwner?._id === branchId)
            const branchExpenses = assignedExpenses.filter(e => e.branchOwner?._id === branchId)
            const totalSales = branchSales.reduce((sum, s) => sum + s.total, 0)
            const totalExpenses = branchExpenses.reduce((sum, e) => sum + e.amount, 0)
            const profit = totalSales - totalExpenses
            
            return (
              <div key={branchId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{branchSales[0]?.branchOwner?.name}</p>
                  <p className="text-sm text-gray-600">{branchSales.length} sales transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Profit: ${profit.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    Sales: ${totalSales.toLocaleString()} • Expenses: ${totalExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard