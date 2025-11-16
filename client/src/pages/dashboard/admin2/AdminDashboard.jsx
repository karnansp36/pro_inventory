// pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  Mail,
  Phone,
  ChevronRight,
  Building2,
  PlusCircle,
  CreditCard // Add this import
} from 'lucide-react';
import { getUsers, createUser } from '../../../store/slices/usersSlice';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import Modal from '../../../components/Modal';
import UserForm from '../../../components/forms/UserForm';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.users);
  const [isCreateManagerModalOpen, setIsCreateManagerModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const managers = users?.filter(user => user.role === 'Manager') || [];

  const handleManagerClick = (managerId) => {
    navigate(`/dashboard/admin/manager/${managerId}`);
  };

  // Add this function for product payments navigation
  const handleProductPaymentsClick = () => {
    navigate('/dashboard/admin/product-payments');
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-slate-950' : 'bg-white'
    }`}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className={`p-6 lg:p-8 rounded-2xl border ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700'
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  theme === 'dark' ? 'bg-blue-600/20' : 'bg-white shadow-sm'
                }`}>
                  <Building2 className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Admin Dashboard
                </h1>
              </div>
              <p className={`text-sm sm:text-base ml-14 ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Manage and view all managers in the system
              </p>
            </div>
            <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl ${
              theme === 'dark' ? 'bg-slate-800/80' : 'bg-white shadow-sm'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
              }`}>
                System Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className={`p-6 rounded-xl border ${
          theme === 'dark'
            ? 'bg-slate-900/50 border-slate-800'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}>
                <Users className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Total Owners
                </p>
                <p className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {managers.length}
                </p>
              </div>
            </div>
            {/* Add Product Payments Button here */}
            <button
              onClick={handleProductPaymentsClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Product Payments
            </button>
          </div>
        </div>

        {/* Managers List */}
        <div className={`rounded-2xl border ${
          theme === 'dark'
            ? 'bg-slate-900/30 border-slate-800'
            : 'bg-gray-50/50 border-gray-200'
        }`}>
          <div className={`p-6 lg:p-8 border-b ${
            theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                All Owners
              </h2>
              <button
                onClick={() => setIsCreateManagerModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                Create New Manager
              </button>
            </div>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Click on any Owner to view their details
            </p>
          </div>
          
          <div className="p-6 lg:p-8">
            {managers.length === 0 ? (
              <div className="text-center py-16">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
                }`}>
                  <Users className={`h-10 w-10 ${
                    theme === 'dark' ? 'text-slate-600' : 'text-gray-400'
                  }`} />
                </div>
                <p className={`text-lg font-semibold mb-1 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                }`}>
                  No Managers Found
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                }`}>
                  There are no users with the 'Manager' role
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {managers.map((manager) => (
                  <div
                    key={manager._id}
                    onClick={() => handleManagerClick(manager._id)}
                    className={`group p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/60 hover:border-slate-600 hover:shadow-xl hover:shadow-blue-900/20'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                          theme === 'dark'
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                        }`}>
                          {manager.name ? manager.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'MN'}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-base ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {manager.name}
                          </h3>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                            theme === 'dark'
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            Owner
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${
                        theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Mail className={`w-4 h-4 flex-shrink-0 ${
                          theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                        }`} />
                        <span className={`truncate ${
                          theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                        }`}>
                          {manager.email}
                        </span>
                      </div>
                      {manager.phone && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <Phone className={`w-4 h-4 flex-shrink-0 ${
                            theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                          }`} />
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>
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
      </div>

      <Modal
        isOpen={isCreateManagerModalOpen}
        onClose={() => setIsCreateManagerModalOpen(false)}
        title="Create New Manager"
      >
        <UserForm
          onSubmit={(formData) => {
            dispatch(createUser({ ...formData, role: 'Manager' }));
            setIsCreateManagerModalOpen(false);
          }}
          onCancel={() => setIsCreateManagerModalOpen(false)}
          initialData={{ role: 'Manager' }}
          isSubmitting={loading}
          submitError={error}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;