// pages/admin/AdminDashboard.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  Building2, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react';
import { getSales } from '../../../store/slices/salesSlice';
import { getStockRequests } from '../../../store/slices/stockRequestsSlice';
import { getUsers } from '../../../store/slices/usersSlice';
import { getExpenses } from '../../../store/slices/expensesSlice';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { sales } = useSelector((state) => state.sales);
  const { stockRequests } = useSelector((state) => state.stockRequests);
  const { users } = useSelector((state) => state.users);
  const { expenses } = useSelector((state) => state.expenses);

  useEffect(() => {
    dispatch(getSales());
    dispatch(getStockRequests());
    dispatch(getUsers());
    dispatch(getExpenses());
  }, [dispatch]);

  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const totalSales = sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
  const netProfit = totalSales - totalExpenses;

  const stats = [
    {
      title: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Total Branches',
      value: users?.filter(u => u.role === 'BranchOwner').length || 0,
      icon: Building2,
      color: 'green',
      change: '+5%'
    },
    {
      title: 'Pending Approvals',
      value: stockRequests?.filter(sr => !sr.approved).length || 0,
      icon: Clock,
      color: 'orange',
      change: '+3'
    },
    {
      title: 'Total Sales',
      value: `$${totalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: 'purple',
      change: '+8.2%'
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      color: 'red',
      change: '-2.1%'
    },
    {
      title: 'Net Profit',
      value: `$${netProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: netProfit >= 0 ? 'green' : 'red',
      change: netProfit >= 0 ? '+6.1%' : '-6.1%'
    }
  ];
 
  const managers = users?.filter(user => user.role === 'Manager') || [];
  const urgentRequests = stockRequests?.filter(sr =>
    sr.priority === 'Urgent' && !sr.approved
  ) || [];
 
  const recentSales = sales?.slice(0, 5) || [];
  const pendingRequests = stockRequests?.filter(sr => !sr.approved).slice(0, 5) || [];
 
  const handleManagerClick = (managerId) => {
    navigate(`/dashboard/admin/manager/${managerId}`);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50',
        text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
        gradient: 'from-blue-500 to-blue-600',
        ring: theme === 'dark' ? 'ring-blue-500/20' : 'ring-blue-500/10'
      },
      green: {
        bg: theme === 'dark' ? 'bg-green-600/20' : 'bg-green-50',
        text: theme === 'dark' ? 'text-green-400' : 'text-green-600',
        gradient: 'from-green-500 to-emerald-600',
        ring: theme === 'dark' ? 'ring-green-500/20' : 'ring-green-500/10'
      },
      orange: {
        bg: theme === 'dark' ? 'bg-orange-600/20' : 'bg-orange-50',
        text: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
        gradient: 'from-orange-500 to-amber-600',
        ring: theme === 'dark' ? 'ring-orange-500/20' : 'ring-orange-500/10'
      },
      purple: {
        bg: theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-50',
        text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
        gradient: 'from-purple-500 to-violet-600',
        ring: theme === 'dark' ? 'ring-purple-500/20' : 'ring-purple-500/10'
      },
      red: {
        bg: theme === 'dark' ? 'bg-red-600/20' : 'bg-red-50',
        text: theme === 'dark' ? 'text-red-400' : 'text-red-600',
        gradient: 'from-red-500 to-rose-600',
        ring: theme === 'dark' ? 'ring-red-500/20' : 'ring-red-500/10'
      }
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 lg:p-8 rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
          : 'bg-gradient-to-r from-white via-gray-50 to-white border-gray-200 shadow-gray-200/50'
      }`}>
        <div className="space-y-1">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
            theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
          }`}>
            Admin Dashboard
          </h1>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Welcome back! Here's your system overview.
          </p>
        </div>
        <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl w-fit ${
          theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            theme === 'dark' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-green-500'
          }`}></div>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
          }`}>
            System Live
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {stats.map((stat, index) => {
          const colorClass = getColorClasses(stat.color);
          const isPositive = stat.change.startsWith('+');
          
          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl border p-6 lg:p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 hover:border-slate-700 shadow-lg shadow-slate-900/50'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <p className={`text-xs sm:text-sm font-medium uppercase tracking-wide ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {stat.title}
                  </p>
                  <p className={`text-3xl sm:text-4xl font-bold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                  <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    isPositive
                      ? theme === 'dark' 
                        ? 'bg-green-600/20 text-green-400 ring-1 ring-green-500/20' 
                        : 'bg-green-50 text-green-700 ring-1 ring-green-500/10'
                      : theme === 'dark' 
                        ? 'bg-red-600/20 text-red-400 ring-1 ring-red-500/20' 
                        : 'bg-red-50 text-red-700 ring-1 ring-red-500/10'
                  }`}>
                    {isPositive ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ring-2 ${colorClass.bg} ${colorClass.ring} transition-transform group-hover:scale-110`}>
                  <stat.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${colorClass.text}`} />
                </div>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br ${colorClass.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </div>
          );
        })}
      </div>
 
      {/* Managers List */}
      <div className={`rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
          : 'bg-white border-gray-200'
      }`}>
        <div className={`p-6 lg:p-8 border-b ${
          theme === 'dark' ? 'border-slate-800/50' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'
            }`}>
              <Users className={`h-6 w-6 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
            }`}>
              Managers ({managers.length})
            </h2>
          </div>
        </div>
        <div className="p-6">
          {managers.length === 0 ? (
            <div className="text-center py-12">
              <Users className={`h-16 w-16 mx-auto mb-4 ${
                theme === 'dark' ? 'text-slate-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
              }`}>
                No Managers Found
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
              }`}>
                There are no users with the 'Manager' role.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {managers.map((manager) => (
                <div
                  key={manager._id}
                  onClick={() => handleManagerClick(manager._id)}
                  className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer block ${
                    theme === 'dark'
                      ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                    }`}>
                      {manager.name ? manager.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'MN'}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                      }`}>
                        {manager.name}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        {manager.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4" />
                      <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                        {manager.email}
                      </span>
                    </div>
                    {manager.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4" />
                        <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                          {manager.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
 
      {/* Urgent Alerts */}
      {urgentRequests.length > 0 && (
        <div className={`rounded-2xl border overflow-hidden shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
            : 'bg-white border-gray-200 shadow-md'
        }`}>
          <div className={`p-6 lg:p-8 border-b ${
            theme === 'dark'
              ? 'border-slate-800/50 bg-gradient-to-r from-orange-600/5 to-red-600/5'
              : 'bg-gray-200 bg-gradient-to-r from-orange-50 to-red-50'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ring-2 ${
                theme === 'dark'
                  ? 'bg-orange-600/20 ring-orange-500/20'
                  : 'bg-orange-100 ring-orange-500/10'
              }`}>
                <AlertTriangle className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl font-semibold ${
                  theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  Urgent Stock Requests
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  {urgentRequests.length} items need immediate attention
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
            {urgentRequests.slice(0, 5).map((request) => (
              <div
                key={request._id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-xl transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-slate-800/30 hover:bg-slate-800/50'
                    : 'bg-orange-50 hover:bg-orange-100'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`p-2.5 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800/50' : 'bg-white shadow-sm'
                  }`}>
                    <Package className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${
                      theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                    }`}>
                      {request.productName}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Quantity: {request.quantity}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap w-fit ${
                  theme === 'dark'
                    ? 'bg-orange-600/20 text-orange-400 ring-1 ring-orange-500/20'
                    : 'bg-orange-100 text-orange-800 ring-1 ring-orange-500/10'
                }`}>
                  Urgent Priority
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Sales */}
        <div className={`rounded-2xl border overflow-hidden shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
            : 'bg-white border-gray-200 shadow-md'
        }`}>
          <div className={`p-6 lg:p-8 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-slate-800/50' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-50'
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <h2 className={`text-lg sm:text-xl font-semibold ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                Recent Sales
              </h2>
            </div>
            <ChevronRight className={`h-5 w-5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
            }`} />
          </div>
          <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
            {recentSales.map((sale) => (
              <div
                key={sale._id}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-xl transition-all duration-200 ${
                  theme === 'dark'
                    ? 'hover:bg-slate-800/30'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800/50' : 'bg-purple-50'
                  }`}>
                    <DollarSign className={`h-4 w-4 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium ${
                      theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                    }`}>
                      Branch Sale
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-lg ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>
                  ${sale.total}
                </span>
              </div>
            ))}
          </div>
        </div>
 
        {/* Pending Approvals */}
        <div className={`rounded-2xl border overflow-hidden shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
            : 'bg-white border-gray-200 shadow-md'
        }`}>
          <div className={`p-6 lg:p-8 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-slate-800/50' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'
              }`}>
                <Clock className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <h2 className={`text-lg sm:text-xl font-semibold ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                Pending Approvals
              </h2>
            </div>
            <ChevronRight className={`h-5 w-5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
            }`} />
          </div>
          <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request._id}
                className={`flex items-center justify-between gap-3 p-4 sm:p-5 rounded-xl transition-all duration-200 ${
                  theme === 'dark'
                    ? 'hover:bg-slate-800/30'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-slate-800/50' : 'bg-blue-50'
                  }`}>
                    <Package className={`h-4 w-4 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                    }`}>
                      {request.productName}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Qty: {request.quantity}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
                  request.priority === 'Urgent'
                    ? theme === 'dark'
                      ? 'bg-red-600/20 text-red-400 ring-1 ring-red-500/20'
                      : 'bg-red-100 text-red-800 ring-1 ring-red-500/10'
                    : request.priority === 'Required'
                    ? theme === 'dark'
                      ? 'bg-orange-600/20 text-orange-400 ring-1 ring-orange-500/20'
                      : 'bg-orange-100 text-orange-800 ring-1 ring-orange-500/10'
                    : theme === 'dark'
                      ? 'bg-green-600/20 text-green-400 ring-1 ring-green-500/20'
                      : 'bg-green-100 text-green-800 ring-1 ring-green-500/10'
                }`}>
                  {request.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;