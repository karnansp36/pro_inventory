// client/src/pages/dashboard/manager/ManagerBranchOwnerViewPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSales } from '../../../store/slices/salesSlice';
import { getExpenses } from '../../../store/slices/expensesSlice';
import { getStockRequests } from '../../../store/slices/stockRequestsSlice';
import { getUsers } from '../../../store/slices/usersSlice';

const ManagerBranchOwnerViewPage = () => {
  const { id } = useParams(); // This 'id' is the BranchOwner's ID
  const dispatch = useDispatch();
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { sales, loading: salesLoading } = useSelector((state) => state.sales);
  const { expenses, loading: expensesLoading } = useSelector((state) => state.expenses);
  const { stockRequests, loading: stockRequestsLoading } = useSelector((state) => state.stockRequests);

  const [branchOwner, setBranchOwner] = useState(null);

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getSales());
    dispatch(getExpenses());
    dispatch(getStockRequests());
  }, [dispatch]);

  useEffect(() => {
    if (users.length > 0) {
      const foundBranchOwner = users.find(user => user._id === id && user.role === 'BranchOwner');
      setBranchOwner(foundBranchOwner);
    }
  }, [users, id]);

  const loading = usersLoading || salesLoading || expensesLoading || stockRequestsLoading;

  if (loading) return <div className="p-8">Loading...</div>;
  if (!branchOwner) return <div className="p-8 text-red-600">Branch Owner not found or not assigned to you.</div>;

  const branchOwnerSales = sales.filter(sale => sale.branchOwner?._id === id);
  const branchOwnerExpenses = expenses.filter(expense => expense.branchOwner?._id === id);
  const branchOwnerStockRequests = stockRequests.filter(request => request.branchOwner?._id === id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Owner Details: {branchOwner.name}</h1>
          <p className="text-gray-600">Email: {branchOwner.email}</p>
        </div>
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-600">Read Only Access</span>
        </div>
      </div>

      {/* Sales Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h2>
        {branchOwnerSales.length > 0 ? (
          <ul className="space-y-2">
            {branchOwnerSales.map(sale => (
              <li key={sale._id} className="flex justify-between items-center border-b pb-2">
                <span>{new Date(sale.date).toLocaleDateString()} - Total: ${sale.total}</span>
                <span className="text-sm text-gray-500">Cash: ${sale.cash}, GPay: ${sale.gpay}, Card: ${sale.creditCard}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No sales recorded for this branch owner.</p>
        )}
      </div>

      {/* Expenses Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses Overview</h2>
        {branchOwnerExpenses.length > 0 ? (
          <ul className="space-y-2">
            {branchOwnerExpenses.map(expense => (
              <li key={expense._id} className="flex justify-between items-center border-b pb-2">
                <span>{new Date(expense.date).toLocaleDateString()} - {expense.category}: ${expense.amount}</span>
                <span className="text-sm text-gray-500">{expense.description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No expenses recorded for this branch owner.</p>
        )}
      </div>

      {/* Stock Requests Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Requests Overview</h2>
        {branchOwnerStockRequests.length > 0 ? (
          <ul className="space-y-2">
            {branchOwnerStockRequests.map(request => (
              <li key={request._id} className="flex justify-between items-center border-b pb-2">
                <span>{request.productName} - {request.quantity} ({request.priority})</span>
                <span className={`text-sm font-semibold ${
                  request.status === 'Approved' ? 'text-green-600' :
                  request.status === 'Rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>Status: {request.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No stock requests from this branch owner.</p>
        )}
      </div>
    </div>
  );
};

export default ManagerBranchOwnerViewPage;