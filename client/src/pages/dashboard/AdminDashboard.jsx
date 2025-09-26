// // pages/dashboard/AdminDashboard.jsx
// import { useEffect } from 'react'
// import { useSelector, useDispatch } from 'react-redux'
// import { 
//   Users, 
//   Building2, 
//   Clock, 
//   TrendingUp,
//   AlertTriangle
// } from 'lucide-react'
// import { getSales } from '../../store/slices/salesSlice'
// import { getStockRequests } from '../../store/slices/stockRequestsSlice'
// import { getUsers } from '../../store/slices/usersSlice'

// const AdminDashboard = () => {
//   const dispatch = useDispatch()
//   const { sales } = useSelector((state) => state.sales)
//   const { stockRequests } = useSelector((state) => state.stockRequests)
//   const { users } = useSelector((state) => state.users)

//   useEffect(() => {
//     dispatch(getSales())
//     dispatch(getStockRequests())
//     dispatch(getUsers())
//   }, [dispatch])

//   const stats = [
//     {
//       title: 'Total Users',
//       value: users?.length || 0,
//       icon: Users,
//       color: 'blue',
//       change: '+12%'
//     },
//     {
//       title: 'Total Branches',
//       value: users?.filter(u => u.role === 'BranchOwner').length || 0,
//       icon: Building2,
//       color: 'green',
//       change: '+5%'
//     },
//     {
//       title: 'Pending Approvals',
//       value: stockRequests?.filter(sr => sr.status === 'Pending').length || 0,
//       icon: Clock,
//       color: 'orange',
//       change: '+3'
//     },
//     {
//       title: 'Total Sales',
//       value: `$${sales?.reduce((sum, sale) => sum + sale.total, 0)?.toLocaleString() || 0}`,
//       icon: TrendingUp,
//       color: 'purple',
//       change: '+8.2%'
//     }
//   ]

//   const urgentRequests = stockRequests?.filter(sr => 
//     sr.priority === 'High' && sr.status === 'Pending'
//   ) || []

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <div key={index} className="bg-white rounded-2xl shadow-md p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
//                 <p className="text-xs text-green-600 mt-1">{stat.change}</p>
//               </div>
//               <div className={`p-3 rounded-full bg-${stat.color}-100`}>
//                 <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Urgent Alerts */}
//       {urgentRequests.length > 0 && (
//         <div className="bg-white rounded-2xl shadow-md p-6">
//           <div className="flex items-center space-x-2 mb-4">
//             <AlertTriangle className="h-5 w-5 text-warning-600" />
//             <h2 className="text-lg font-semibold text-gray-900">Urgent Stock Requests</h2>
//           </div>
//           <div className="space-y-3">
//             {urgentRequests.slice(0, 5).map((request) => (
//               <div key={request._id} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
//                 <div>
//                   <p className="font-medium text-gray-900">{request.productName}</p>
//                   <p className="text-sm text-gray-600">Quantity: {request.quantity}</p>
//                 </div>
//                 <span className="px-2 py-1 bg-warning-100 text-warning-800 text-xs font-medium rounded-full">
//                   High Priority
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Recent Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Recent Sales */}
//         <div className="bg-white rounded-2xl shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h2>
//           <div className="space-y-3">
//             {sales?.slice(0, 5).map((sale) => (
//               <div key={sale._id} className="flex items-center justify-between p-3 border-b border-gray-100">
//                 <div>
//                   <p className="font-medium text-gray-900">Branch Sale</p>
//                   <p className="text-sm text-gray-600">{new Date(sale.date).toLocaleDateString()}</p>
//                 </div>
//                 <span className="font-semibold text-gray-900">${sale.total}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Pending Approvals */}
//         <div className="bg-white rounded-2xl shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h2>
//           <div className="space-y-3">
//             {stockRequests?.filter(sr => sr.status === 'Pending').slice(0, 5).map((request) => (
//               <div key={request._id} className="flex items-center justify-between p-3 border-b border-gray-100">
//                 <div>
//                   <p className="font-medium text-gray-900">{request.productName}</p>
//                   <p className="text-sm text-gray-600">Qty: {request.quantity}</p>
//                 </div>
//                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                   request.priority === 'High' 
//                     ? 'bg-danger-100 text-danger-800'
//                     : request.priority === 'Medium'
//                     ? 'bg-warning-100 text-warning-800'
//                     : 'bg-success-100 text-success-800'
//                 }`}>
//                   {request.priority}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AdminDashboard