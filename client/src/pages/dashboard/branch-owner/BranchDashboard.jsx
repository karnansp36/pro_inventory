// // pages/dashboard/branch-owner/BranchDashboard.jsx

// import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useParams } from 'react-router-dom';
// import { useTheme } from '../../../context/ThemeContext';
// import ShopProfile from './ShopProfile';
// import SalesTable from './SalesTable';
// import ExpensesTable from './ExpensesTable';
// import StockRequestsTable from './StockRequestsTable';
// import TransportTable from './TransportTable';
// import ReportsPanel from './ReportsPanel';
// import ExpenseForm from '../../../components/forms/ExpenseForm';
// import TransportForm from '../../../components/forms/TransportForm';
// import QuickAddForm from '../../../components/forms/QuickAddForm';
// import Modal from '../../../components/Modal';
// import { createSale } from '../../../store/slices/salesSlice';
// import { createExpense } from '../../../store/slices/expensesSlice';
// import { createStockRequest } from '../../../store/slices/stockRequestsSlice';
// import { createTransport } from '../../../store/slices/transportSlice';

// const BranchDashboard = () => {
//   const { branchOwnerId } = useParams();
//   const dispatch = useDispatch();
//   const { theme } = useTheme();
//   const [modal, setModal] = useState(null); // 'sale' | 'expense' | 'stock' | 'transport' | null
//   const [loading, setLoading] = useState(false);

//   // Handlers for opening modals
//   const openModal = (type) => setModal(type);
//   const closeModal = () => setModal(null);

//   // Submit handlers
//   const handleAddSale = async (form) => {
//     setLoading(true);
//     await dispatch(createSale(form));
//     setLoading(false);
//     closeModal();
//   };
//   const handleAddExpense = async (form) => {
//     setLoading(true);
//     await dispatch(createExpense(form));
//     setLoading(false);
//     closeModal();
//   };
//   const handleAddStockRequest = async (form) => {
//     setLoading(true);
//     await dispatch(createStockRequest(form));
//     setLoading(false);
//     closeModal();
//   };
//   const handleAddTransport = async (form) => {
//     setLoading(true);
//     await dispatch(createTransport(form));
//     setLoading(false);
//     closeModal();
//   };

//   const isDark = theme === 'dark';

//   // Quick action buttons configuration
//   const quickActions = [
//     {
//       id: 'sale',
//       label: 'Add Sale',
//       icon: '💰',
//       gradient: 'from-emerald-500 to-green-600',
//       hoverGradient: 'hover:from-emerald-600 hover:to-green-700',
//       shadow: 'shadow-emerald-500/20',
//     },
//     {
//       id: 'expense',
//       label: 'Add Expense',
//       icon: '💸',
//       gradient: 'from-rose-500 to-red-600',
//       hoverGradient: 'hover:from-rose-600 hover:to-red-700',
//       shadow: 'shadow-rose-500/20',
//     },
//     {
//       id: 'stock',
//       label: 'Request Stock',
//       icon: '📦',
//       gradient: 'from-blue-500 to-indigo-600',
//       hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
//       shadow: 'shadow-blue-500/20',
//     },
//     {
//       id: 'transport',
//       label: 'Add Transport',
//       icon: '🚚',
//       gradient: 'from-purple-500 to-violet-600',
//       hoverGradient: 'hover:from-purple-600 hover:to-violet-700',
//       shadow: 'shadow-purple-500/20',
//     },
//   ];

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header Section */}
//         <div className={`relative overflow-hidden rounded-2xl p-8 ${
//           isDark 
//             ? 'bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 border border-slate-700/50' 
//             : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200/50'
//         } backdrop-blur-xl shadow-2xl transition-all duration-300`}>
//           {/* Decorative Elements */}
//           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
          
//           <div className="relative z-10">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <h1 className={`text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r ${
//                   isDark 
//                     ? 'from-blue-400 via-purple-400 to-pink-400' 
//                     : 'from-blue-600 via-purple-600 to-pink-600'
//                 } bg-clip-text text-transparent`}>
//                   Branch Dashboard
//                 </h1>
//                 <p className={`text-sm sm:text-base ${
//                   isDark ? 'text-slate-400' : 'text-gray-600'
//                 } flex items-center gap-2`}>
//                   <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
//                   Welcome back! Ready for today's operations?
//                 </p>
//               </div>
//               <div className={`px-4 py-2 rounded-xl ${
//                 isDark 
//                   ? 'bg-slate-700/50 border border-slate-600/50' 
//                   : 'bg-white border border-gray-200'
//               } shadow-lg`}>
//                 <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Branch ID</div>
//                 <div className={`text-lg font-semibold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
//                   {branchOwnerId}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Quick Action Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {quickActions.map((action) => (
//             <button
//               key={action.id}
//               onClick={() => openModal(action.id)}
//               className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${action.gradient} p-6 text-white shadow-xl ${action.shadow} hover:shadow-2xl ${action.hoverGradient} transform hover:scale-105 transition-all duration-300`}
//             >
//               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
//               <div className="relative z-10">
//                 <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
//                   {action.icon}
//                 </div>
//                 <div className="text-sm font-medium opacity-90">{action.label}</div>
//                 <div className="mt-2 flex items-center text-xs opacity-75">
//                   <span>Quick add</span>
//                   <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>

//         {/* Modals for forms */}
//         {modal === 'sale' && (
//           <Modal onClose={closeModal} title="Add Sale">
//             <QuickAddForm onSubmit={handleAddSale} onCancel={closeModal} loading={loading} />
//           </Modal>
//         )}
//         {modal === 'expense' && (
//           <Modal onClose={closeModal} title="Add Expense">
//             <ExpenseForm onSubmit={handleAddExpense} onCancel={closeModal} loading={loading} />
//           </Modal>
//         )}
//         {modal === 'stock' && (
//           <Modal onClose={closeModal} title="Request Stock">
//             <QuickAddForm type="stock" onSubmit={handleAddStockRequest} onCancel={closeModal} loading={loading} />
//           </Modal>
//         )}
//         {modal === 'transport' && (
//           <Modal onClose={closeModal} title="Add Transport">
//             <TransportForm onSubmit={handleAddTransport} onCancel={closeModal} loading={loading} />
//           </Modal>
//         )}

//         {/* Shop Profile */}
//         <div className={`rounded-2xl overflow-hidden ${
//           isDark 
//             ? 'bg-slate-800/50 border border-slate-700/50' 
//             : 'bg-white border border-gray-200'
//         } backdrop-blur-xl shadow-xl transition-all duration-300`}>
//           <ShopProfile branchOwnerId={branchOwnerId} />
//         </div>

//         {/* Data Overview Grid */}
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//           {/* Left Column */}
//           <div className="space-y-6">
//             <div className={`rounded-2xl overflow-hidden ${
//               isDark 
//                 ? 'bg-slate-800/50 border border-slate-700/50' 
//                 : 'bg-white border border-gray-200'
//             } backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl`}>
//               <div className={`px-6 py-4 border-b ${
//                 isDark ? 'border-slate-700/50 bg-slate-800/70' : 'border-gray-200 bg-gray-50/50'
//               }`}>
//                 <h2 className={`text-lg font-semibold flex items-center gap-2 ${
//                   isDark ? 'text-slate-200' : 'text-gray-800'
//                 }`}>
//                   <span className="text-xl">📊</span>
//                   Sales Overview
//                 </h2>
//               </div>
//               <SalesTable branchOwnerId={branchOwnerId} />
//             </div>
            
//             <div className={`rounded-2xl overflow-hidden ${
//               isDark 
//                 ? 'bg-slate-800/50 border border-slate-700/50' 
//                 : 'bg-white border border-gray-200'
//             } backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl`}>
//               <div className={`px-6 py-4 border-b ${
//                 isDark ? 'border-slate-700/50 bg-slate-800/70' : 'border-gray-200 bg-gray-50/50'
//               }`}>
//                 <h2 className={`text-lg font-semibold flex items-center gap-2 ${
//                   isDark ? 'text-slate-200' : 'text-gray-800'
//                 }`}>
//                   <span className="text-xl">💳</span>
//                   Expenses
//                 </h2>
//               </div>
//               <ExpensesTable branchOwnerId={branchOwnerId} />
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="space-y-6">
//             <div className={`rounded-2xl overflow-hidden ${
//               isDark 
//                 ? 'bg-slate-800/50 border border-slate-700/50' 
//                 : 'bg-white border border-gray-200'
//             } backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl`}>
//               <div className={`px-6 py-4 border-b ${
//                 isDark ? 'border-slate-700/50 bg-slate-800/70' : 'border-gray-200 bg-gray-50/50'
//               }`}>
//                 <h2 className={`text-lg font-semibold flex items-center gap-2 ${
//                   isDark ? 'text-slate-200' : 'text-gray-800'
//                 }`}>
//                   <span className="text-xl">📋</span>
//                   Stock Requests
//                 </h2>
//               </div>
//               <StockRequestsTable branchOwnerId={branchOwnerId} />
//             </div>
            
//             <div className={`rounded-2xl overflow-hidden ${
//               isDark 
//                 ? 'bg-slate-800/50 border border-slate-700/50' 
//                 : 'bg-white border border-gray-200'
//             } backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl`}>
//               <div className={`px-6 py-4 border-b ${
//                 isDark ? 'border-slate-700/50 bg-slate-800/70' : 'border-gray-200 bg-gray-50/50'
//               }`}>
//                 <h2 className={`text-lg font-semibold flex items-center gap-2 ${
//                   isDark ? 'text-slate-200' : 'text-gray-800'
//                 }`}>
//                   <span className="text-xl">🚛</span>
//                   Transport
//                 </h2>
//               </div>
//               <TransportTable branchOwnerId={branchOwnerId} />
//             </div>
//           </div>
//         </div>

//         {/* Reports Panel */}
//         <div className={`rounded-2xl overflow-hidden ${
//           isDark 
//             ? 'bg-slate-800/50 border border-slate-700/50' 
//             : 'bg-white border border-gray-200'
//         } backdrop-blur-xl shadow-xl transition-all duration-300`}>
//           <div className={`px-6 py-4 border-b ${
//             isDark ? 'border-slate-700/50 bg-slate-800/70' : 'border-gray-200 bg-gray-50/50'
//           }`}>
//             <h2 className={`text-lg font-semibold flex items-center gap-2 ${
//               isDark ? 'text-slate-200' : 'text-gray-800'
//             }`}>
//               <span className="text-xl">📈</span>
//               Reports & Analytics
//             </h2>
//           </div>
//           <ReportsPanel branchOwnerId={branchOwnerId} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BranchDashboard;