// pages/admin/SalesManagement.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Edit, Trash2, Calendar, DollarSign, CreditCard, Smartphone, X, TrendingUp } from 'lucide-react';
import { getSales, deleteSale } from '../../../store/slices/salesSlice';
import { getUsers } from '../../../store/slices/usersSlice';
import { useTheme } from '../../../context/ThemeContext';
import SalesForm from '../../../components/forms/SalesForm'; // Import the new SalesForm component

const SalesManagement = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { sales, loading } = useSelector((state) => state.sales);
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    dispatch(getSales());
    if (user?.role === 'Admin' || user?.role === 'BrandOwner') {
      dispatch(getUsers());
    }
  }, [dispatch, user?.role]);

  const filteredSales = sales?.filter(sale =>
    sale.branchOwner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (dateFilter === '' || new Date(sale.date).toISOString().split('T')[0].includes(dateFilter))
  );

  const handleDelete = (saleId) => {
    if (window.confirm('Are you sure you want to delete this sale record?')) {
      dispatch(deleteSale(saleId));
    }
  };

  // Calculate totals
  const totalCash = filteredSales?.reduce((sum, sale) => sum + (sale.paymentMethod === 'cash' ? sale.amount : 0), 0) || 0;
  const totalGpay = filteredSales?.reduce((sum, sale) => sum + (sale.paymentMethod === 'gpay' ? sale.amount : 0), 0) || 0;
  const totalCard = filteredSales?.reduce((sum, sale) => sum + (sale.paymentMethod === 'card' ? sale.amount : 0), 0) || 0;
  const grandTotal = filteredSales?.reduce((sum, sale) => sum + sale.amount, 0) || 0;

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
            Sales Management
          </h1>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Manage all sales records across branches
          </p>
        </div>
        {(user?.role === 'BranchOwner' || user?.role === 'Admin' || user?.role === 'BrandOwner') && (
          <button
            onClick={() => setShowAddModal(true)}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            <Plus className="h-5 w-5" />
            <span>Add Sale</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-lg shadow-slate-900/50'
            : 'bg-white border-gray-200 hover:shadow-xl shadow-md'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <p className={`text-xs font-medium uppercase tracking-wide ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Total Cash
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                ${totalCash.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              theme === 'dark' ? 'bg-green-600/20' : 'bg-green-50'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-lg shadow-slate-900/50'
            : 'bg-white border-gray-200 hover:shadow-xl shadow-md'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <p className={`text-xs font-medium uppercase tracking-wide ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Total GPay
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                ${totalGpay.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'
            }`}>
              <Smartphone className={`h-6 w-6 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-lg shadow-slate-900/50'
            : 'bg-white border-gray-200 hover:shadow-xl shadow-md'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <p className={`text-xs font-medium uppercase tracking-wide ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Total Card
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                ${totalCard.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-50'
            }`}>
              <CreditCard className={`h-6 w-6 ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
          </div>
        </div>

        <div className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-lg shadow-slate-900/50'
            : 'bg-white border-gray-200 hover:shadow-xl shadow-md'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <p className={`text-xs font-medium uppercase tracking-wide ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Grand Total
              </p>
              <p className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                ${grandTotal.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              theme === 'dark' ? 'bg-green-600/20' : 'bg-green-50'
            }`}>
              <TrendingUp className={`h-6 w-6 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-2xl border p-6 shadow-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
          : 'bg-white border-gray-200 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder-slate-400'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <div className="relative">
            <Calendar className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark'
                  ? 'bg-slate-800/50 border-slate-700 text-slate-100'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
          : 'bg-white border-gray-200 shadow-md'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Branch
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Date
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Amount
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Payment Method
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Total
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              theme === 'dark' ? 'divide-slate-800/50' : 'divide-gray-200'
            }`}>
              {filteredSales?.map((sale) => (
                <tr key={sale._id} className={`transition-colors duration-150 ${
                  theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                    }`}>
                      {sale.branchOwner?.name || 'Unknown Branch'}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-900'
                  }`}>
                    ${sale.amount}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-900'
                  }`}>
                    {sale.paymentMethod}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    ${sale.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowEditModal(true);
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                          theme === 'dark'
                            ? 'text-blue-400 hover:bg-blue-600/20'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sale._id)}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                          theme === 'dark'
                            ? 'text-red-400 hover:bg-red-600/20'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

     {/* Add Sale Modal */}
     {(user?.role === 'BranchOwner' || user?.role === 'Admin' || user?.role === 'BrandOwner') && showAddModal && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
         <div className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${
           theme === 'dark'
             ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
             : 'bg-white border-gray-200'
         }`}>
           {/* Modal Header */}
           <div className={`flex items-center justify-between p-6 border-b ${
             theme === 'dark' ? 'border-slate-800/50' : 'border-gray-200'
           }`}>
             <div className="flex items-center space-x-3">
               <div className={`p-2 rounded-lg ${
                 theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'
               }`}>
                 <Plus className={`h-6 w-6 ${
                   theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                 }`} />
               </div>
               <h2 className={`text-2xl font-bold ${
                 theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
               }`}>
                 Add New Sale
               </h2>
             </div>
             <button
               onClick={() => setShowAddModal(false)}
               className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                 theme === 'dark'
                   ? 'text-slate-400 hover:bg-slate-800/50'
                   : 'text-gray-400 hover:bg-gray-100'
               }`}
             >
               <X className="h-5 w-5" />
             </button>
           </div>

           {/* Modal Body */}
           <div className="p-6 space-y-5">
             <SalesForm
               onClose={() => setShowAddModal(false)}
               branchOwnerId={user?.role === 'BranchOwner' ? user._id : null}
             />
           </div>
         </div>
       </div>
     )}

     {/* Edit Sale Modal */}
     {showEditModal && selectedSale && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
         <div className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${
           theme === 'dark'
             ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
             : 'bg-white border-gray-200'
         }`}>
           {/* Modal Header */}
           <div className={`flex items-center justify-between p-6 border-b ${
             theme === 'dark' ? 'border-slate-800/50' : 'border-gray-200'
           }`}>
             <div className="flex items-center space-x-3">
               <div className={`p-2 rounded-lg ${
                 theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'
               }`}>
                 <Edit className={`h-6 w-6 ${
                   theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                 }`} />
               </div>
               <h2 className={`text-2xl font-bold ${
                 theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
               }`}>
                 Edit Sale
               </h2>
             </div>
             <button
               onClick={() => {
                 setShowEditModal(false);
                 setSelectedSale(null);
               }}
               className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                 theme === 'dark'
                   ? 'text-slate-400 hover:bg-slate-800/50'
                   : 'text-gray-400 hover:bg-gray-100'
               }`}
             >
               <X className="h-5 w-5" />
             </button>
           </div>

           {/* Modal Body */}
           <div className="p-6 space-y-5">
             <SalesForm
               onClose={() => {
                 setShowEditModal(false);
                 setSelectedSale(null);
               }}
               saleToEdit={selectedSale}
               branchOwnerId={user?.role === 'BranchOwner' ? user._id : null}
             />
           </div>
         </div>
       </div>
     )}
    </div>
  );
};

export default SalesManagement;