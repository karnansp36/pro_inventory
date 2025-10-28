import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Package,
  AlertTriangle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Mail,
  Phone,
  MapPin,
  Award
} from 'lucide-react';
import { getBranchesByManagerId, clearBranchesByManager } from '../../../store/slices/usersSlice';
import { useTheme } from '../../../context/ThemeContext';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { sales } = useSelector((state) => state.sales);
  const { expenses } = useSelector((state) => state.expenses);
  const { stockRequests } = useSelector((state) => state.stockRequests);
  const { branchesByManager, loading: branchesLoading, error: branchesError } = useSelector((state) => state.users);
 
  useEffect(() => {
    if (user?._id) {
      dispatch(getBranchesByManagerId(user._id));
    }
    return () => {
      dispatch(clearBranchesByManager());
    };
  }, [dispatch, user?._id]);
 
  const assignedBranches = branchesByManager || [];
  const assignedBranchIds = assignedBranches.map(branch => branch._id);

  const branchSales = sales?.filter(sale => 
    assignedBranchIds.includes(sale.branchOwner?._id)
  ) || [];

  const branchExpenses = expenses?.filter(expense => 
    assignedBranchIds.includes(expense.branchOwner?._id)
  ) || [];

  const branchStockRequests = stockRequests?.filter(request => 
    assignedBranchIds.includes(request.branchOwner?._id)
  ) || [];

  const totalSales = branchSales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalExpenses = branchExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const pendingRequests = branchStockRequests.filter(req => !req.approved).length;
  const urgentRequests = branchStockRequests.filter(req => req.priority === 'Urgent' && !req.approved).length;

  const stats = [
    {
      title: 'Assigned Branches',
      value: assignedBranches.length,
      icon: Building2,
      color: 'blue',
      change: '+0',
      link: '/dashboard/manager/branch-owners'
    },
    {
      title: 'Total Sales',
      value: `$${totalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: 'green',
      change: '+8.2%',
      link: '/dashboard/manager/sales'
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      color: 'red',
      change: '-2.1%',
      link: '/dashboard/manager/expenses'
    },
    {
      title: 'Net Profit',
      value: `$${netProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: netProfit >= 0 ? 'green' : 'red',
      change: netProfit >= 0 ? '+6.1%' : '-6.1%',
      link: '/dashboard/manager/reports'
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      icon: Package,
      color: 'orange',
      change: `+${pendingRequests}`,
      link: `/dashboard/manager/stock-requests/${user._id}`
    },
    {
      title: 'Urgent Requests',
      value: urgentRequests,
      icon: AlertTriangle,
      color: 'red',
      change: `+${urgentRequests}`,
      link: `/dashboard/manager/stock-requests/${user._id}`
    }
  ];

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
      red: {
        bg: theme === 'dark' ? 'bg-red-600/20' : 'bg-red-50',
        text: theme === 'dark' ? 'text-red-400' : 'text-red-600',
        gradient: 'from-red-500 to-rose-600',
        ring: theme === 'dark' ? 'ring-red-500/20' : 'ring-red-500/10'
      }
    };
    return colors[color];
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'M';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <Navbar/>
      
      {/* YouTube-style Banner */}
      <div className="relative">
        {/* Banner Image */}
        <div className={`h-48 sm:h-64 lg:h-80 relative overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900' 
            : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
        }`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          {/* Gradient overlay */}
          <div className={`absolute inset-0 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-transparent via-transparent to-slate-900'
              : 'bg-gradient-to-b from-transparent via-transparent to-white'
          }`}></div>
        </div>

        {/* Profile Section */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
          <div className="relative -mt-16 sm:-mt-20 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Avatar */}
              <div className={`relative ring-4 rounded-full ${
                theme === 'dark' ? 'ring-slate-900' : 'ring-white'
              }`}>
                <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                    : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                } shadow-2xl`}>
                  {getInitials(user?.name)}
                </div>
                <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-green-500 border-slate-900' 
                    : 'bg-green-500 border-white'
                }`}>
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left pb-2">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    {user?.name || 'Manager'}
                  </h1>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    theme === 'dark'
                      ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30'
                      : 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                  }`}>
                    Manager
                  </div>
                </div>
                
                <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{assignedBranches.length} Branches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
                    } animate-pulse`}></div>
                    <span>Active Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const colorClass = getColorClasses(stat.color);
            const isPositive = stat.change.startsWith('+');
            
            return (
              <Link
                key={index}
                to={stat.link}
                className={`group relative overflow-hidden rounded-2xl border p-6 lg:p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer block ${
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
              </Link>
            );
          })}
        </div>

        {/* Assigned Branches List */}
        <div className={`rounded-2xl border shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-6 lg:p-8 border-b ${
            theme === 'dark' ? 'border-slate-800/50' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
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
                  Assigned Branches ({assignedBranches.length})
                </h2>
              </div>
              <Link
                to="/dashboard/manager/branch-owners"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:bg-blue-600/20'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>View All</span>
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedBranches.slice(0, 6).map((branch) => (
                <Link
                  key={branch._id}
                  to={`/dashboard/manager/branch/${branch._id}`}
                  className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer block ${
                    theme === 'dark'
                      ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-white'
                    }`}>
                      <Building2 className={`h-6 w-6 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                      }`}>
                        {branch.name}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        {branch.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Sales:</span>
                      <span className="font-semibold">
                        ${branchSales.filter(s => s.branchOwner?._id === branch._id).reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Pending Requests:</span>
                      <span className="font-semibold">
                        {branchStockRequests.filter(r => r.branchOwner?._id === branch._id && !r.approved).length}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {assignedBranches.length === 0 && (
              <div className="text-center py-12">
                <Building2 className={`h-16 w-16 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-slate-600' : 'text-gray-400'
                }`} />
                <p className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  No Branches Assigned
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                }`}>
                  You haven't been assigned any branches yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;