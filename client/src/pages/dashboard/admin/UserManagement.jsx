// pages/admin/UserManagement.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserPlus, 
  Eye, 
  X, 
  Upload, 
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from 'lucide-react';
import { getUsers, deleteUser, createUser, updateUser, getUsersByRole, clearUsers } from '../../../store/slices/usersSlice';
import { useTheme } from '../../../context/ThemeContext';
import UserView from './UserView';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { users, loading, totalItems } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    profileImage: null,
    assignedBrandOwner: '',
    assignedManager: '',
  });
  const [availableBrandOwners, setAvailableBrandOwners] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const filters = {
      search: searchTerm,
      role: roleFilter,
      status: statusFilter
    };
    dispatch(getUsers({ page: currentPage, limit: itemsPerPage, filters }));
  }, [dispatch, currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    dispatch(getUsersByRole('BrandOwner')).then((res) => {
      if (!res.error) {
        setAvailableBrandOwners(res.payload);
      }
    });
    dispatch(getUsersByRole('Manager')).then((res) => {
      if (!res.error) {
        setAvailableManagers(res.payload);
      }
    });
  }, [dispatch]);

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + users.length, totalItems);

  // Pagination functions
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // CSV Export Function
  const downloadCSV = () => {
    if (users.length === 0) return;

    try {
      const escapeCSV = (field) => {
        if (field === null || field === undefined) return '""';
        const stringField = String(field);
        if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      const headers = [
        'Name',
        'Email',
        'Role',
        'Status',
        'Assigned Brand Owner',
        'Assigned Manager',
        'Created At'
      ];

      const csvRows = users.map(user => [
        escapeCSV(user.name || 'N/A'),
        escapeCSV(user.email || 'N/A'),
        escapeCSV(user.role || 'Unknown'),
        escapeCSV('Active'), // Assuming all users are active
        escapeCSV(user.assignedBrandOwner?.name || 'N/A'),
        escapeCSV(user.assignedManager?.name || 'N/A'),
        escapeCSV(new Date(user.createdAt).toLocaleDateString('en-US'))
      ]);

      let csvContent = [headers.join(',')];
      csvContent = csvContent.concat(csvRows.map(row => row.join(',')));

      // Add summary
      csvContent.push('');
      csvContent.push('Summary');
      csvContent.push(`Total Records (Current Page),${users.length}`);
      csvContent.push(`Total Records (All Pages),${totalItems}`);
      csvContent.push(`Page,${currentPage} of ${totalPages}`);
      
      if (roleFilter) {
        csvContent.push(`Role Filter,${roleFilter}`);
      }
      
      if (statusFilter) {
        csvContent.push(`Status Filter,${statusFilter}`);
      }
      
      if (searchTerm) {
        csvContent.push(`Search Term,${searchTerm}`);
      }
      
      csvContent.push(`Export Date,${new Date().toLocaleDateString('en-US')}`);

      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `users-management-page${currentPage}-${date}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId)).then(() => {
        // Refresh the data after deletion
        const filters = {
          search: searchTerm,
          role: roleFilter,
          status: statusFilter
        };
        dispatch(getUsers({ page: currentPage, limit: itemsPerPage, filters }));
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage' && files && files[0]) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddUser = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: '', profileImage: null, assignedBrandOwner: '', assignedManager: '' });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      profileImage: null,
      assignedBrandOwner: user.assignedBrandOwner?._id || '',
      assignedManager: user.assignedManager?._id || ''
    });
    setImagePreview(user.profileImage ? `http://localhost:5000${user.profileImage}` : null);
    setShowModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in form) {
      if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
        formData.append(key, form[key]);
      }
    }
    if (editUser && !form.profileImage && imagePreview === null && editUser.profileImage) {
      formData.append('profileImage', '');
    }

    const userData = formData;

    if (editUser) {
      dispatch(updateUser({ id: editUser._id, userData: userData }))
        .then((res) => {
          if (!res.error) {
            setShowModal(false);
            setEditUser(null);
            setForm({ name: '', email: '', password: '', role: '', profileImage: null, assignedBrandOwner: '', assignedManager: '' });
            setImagePreview(null);
            // Refresh the data after update
            const filters = {
              search: searchTerm,
              role: roleFilter,
              status: statusFilter
            };
            dispatch(getUsers({ page: currentPage, limit: itemsPerPage, filters }));
          }
        });
    } else {
      dispatch(createUser(userData)).then((res) => {
        if (!res.error) {
          setShowModal(false);
          setForm({ name: '', email: '', password: '', role: '', profileImage: null, assignedBrandOwner: '', assignedManager: '' });
          setImagePreview(null);
          // Refresh the data after creation
          const filters = {
            search: searchTerm,
            role: roleFilter,
            status: statusFilter
          };
          dispatch(getUsers({ page: currentPage, limit: itemsPerPage, filters }));
        }
      });
    }
  };

  const roles = ['Admin', 'BrandOwner', 'Manager', 'BranchOwner'];
  const statusOptions = ['', 'active', 'inactive'];

  const getRoleBadgeClass = (role) => {
    const classes = {
      Admin: theme === 'dark' ? 'bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/20' : 'bg-purple-100 text-purple-800 ring-1 ring-purple-500/10',
      BrandOwner: theme === 'dark' ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/20' : 'bg-blue-100 text-blue-800 ring-1 ring-blue-500/10',
      Manager: theme === 'dark' ? 'bg-green-600/20 text-green-400 ring-1 ring-green-500/20' : 'bg-green-100 text-green-800 ring-1 ring-green-500/10',
      BranchOwner: theme === 'dark' ? 'bg-orange-600/20 text-orange-400 ring-1 ring-orange-500/20' : 'bg-orange-100 text-orange-800 ring-1 ring-orange-500/10'
    };
    return classes[role] || (theme === 'dark' ? 'bg-gray-600/20 text-gray-400' : 'bg-gray-100 text-gray-800');
  };

  const exportFormats = [
    { 
      key: 'csv', 
      label: 'CSV (Current Page)', 
      color: 'bg-blue-500 hover:bg-blue-600',
      handler: downloadCSV
    }
  ];

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-2xl p-8 transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className={`w-12 h-12 animate-spin mb-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading users data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {viewUserId ? (
        <UserView userId={viewUserId} onClose={() => setViewUserId(null)} />
      ) : (
        <>
          {/* Header */}
          <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-6 lg:p-8 rounded-2xl border shadow-lg ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
              : 'bg-gradient-to-r from-white via-gray-50 to-white border-gray-200 shadow-gray-200/50'
          }`}>
            <div className="space-y-1">
              <h1 className={`text-2xl sm:text-3xl font-bold ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                User Management
              </h1>
              <p className={`text-sm sm:text-base ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Manage all users in the system
              </p>
            </div>
            <button
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-blue-500/50'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-blue-500/30'
              }`}
              onClick={handleAddUser}
            >
              <UserPlus className="h-5 w-5" />
              <span>Add User</span>
            </button>
          </div>

          {/* Filters and Search */}
          <div className={`rounded-2xl border shadow-lg p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
              : 'bg-white border-gray-200 shadow-md'
          }`}>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:bg-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
                  }`}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300 ${
                    showFilters
                      ? theme === 'dark'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-emerald-500 text-white'
                      : theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {(roleFilter || statusFilter) && (
                    <span className={`w-2 h-2 rounded-full ${
                      theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                    }`}></span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={users.length === 0}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>

                  {showExportMenu && (
                    <div className={`absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg border z-50 ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className="p-2">
                        <div className={`px-3 py-2 text-xs font-semibold ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Export As
                        </div>
                        {exportFormats.map((format) => (
                          <button
                            key={format.key}
                            onClick={format.handler}
                            className={`w-full flex items-center justify-center gap-3 px-3 py-2 rounded text-sm text-white font-medium transition-all mb-1 last:mb-0 ${format.color}`}
                          >
                            {format.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className={`mt-4 p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-slate-700/50 border-slate-600'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className={`text-xs flex items-center gap-1 ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-gray-300' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-slate-600 border-slate-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">All Roles</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-slate-600 border-slate-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Users Table - Desktop */}
          <div className={`hidden lg:block rounded-2xl border shadow-lg overflow-hidden ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
              : 'bg-white border-gray-200 shadow-md'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      User
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      Role
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      Email
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800/50' : 'divide-gray-200'}`}>
                  {users?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center">
                          <Users className={`w-12 h-12 mb-3 ${
                            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            No users found
                          </p>
                          <p className={`text-xs mt-1 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {(roleFilter || statusFilter || searchTerm) 
                              ? 'Try adjusting your filters' 
                              : 'Users will appear here'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users?.map((user) => (
                      <tr key={user._id} className={`transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'
                      }`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center ${
                              theme === 'dark' ? 'bg-slate-800 ring-2 ring-slate-700' : 'bg-gray-100 ring-2 ring-gray-200'
                            }`}>
                              {user.profileImage ? (
                                <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <span className={`text-sm font-semibold ${
                                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                                }`}>{user.name ? user.name.charAt(0) : ''}</span>
                              )}
                            </div>
                            <div className={`text-sm font-medium ${
                              theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                            }`}>{user.name || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg ${
                            theme === 'dark' ? 'bg-green-600/20 text-green-400 ring-1 ring-green-500/20' : 'bg-green-100 text-green-800 ring-1 ring-green-500/10'
                          }`}>
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button 
                              className={`p-2 rounded-lg transition-all ${
                                theme === 'dark' ? 'hover:bg-blue-600/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                              }`}
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className={`p-2 rounded-lg transition-all ${
                                theme === 'dark' ? 'hover:bg-green-600/20 text-green-400' : 'hover:bg-green-50 text-green-600'
                              }`}
                              onClick={() => setViewUserId(user._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className={`p-2 rounded-lg transition-all ${
                                theme === 'dark' ? 'hover:bg-red-600/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {users?.length > 0 && (
              <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
                theme === 'dark'
                  ? 'border-slate-700/50 bg-slate-900/30'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                {/* Left side - Rows info and per page selector */}
                <div className="flex items-center gap-4">
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{endIndex}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> entries
                  </div>
                  
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-gray-300 focus:border-emerald-500'
                        : 'bg-white border-gray-300 text-gray-700 focus:border-emerald-500'
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                {/* Right side - Pagination controls */}
                <div className="flex items-center gap-2">
                  {/* First page button */}
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all ${
                      currentPage === 1
                        ? theme === 'dark'
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous page button */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all ${
                      currentPage === 1
                        ? theme === 'dark'
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className={`px-3 py-1.5 text-sm ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? theme === 'dark'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-emerald-500 text-white shadow-sm'
                              : theme === 'dark'
                                ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                                : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Next page button */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all ${
                      currentPage === totalPages
                        ? theme === 'dark'
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last page button */}
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-all ${
                      currentPage === totalPages
                        ? theme === 'dark'
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Users Cards - Mobile/Tablet */}
          <div className="lg:hidden space-y-4">
            {users?.length === 0 ? (
              <div className={`rounded-2xl border p-8 text-center ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
                  : 'bg-white border-gray-200'
              }`}>
                <Users className={`w-12 h-12 mx-auto mb-3 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No users found
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {(roleFilter || statusFilter || searchTerm) 
                    ? 'Try adjusting your filters' 
                    : 'Users will appear here'}
                </p>
              </div>
            ) : (
              users?.map((user) => (
                <div
                  key={user._id}
                  className={`rounded-2xl border p-6 shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ${
                        theme === 'dark' ? 'bg-slate-800 ring-2 ring-slate-700' : 'bg-gray-100 ring-2 ring-gray-200'
                      }`}>
                        {user.profileImage ? (
                          <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                          }`}>{user.name ? user.name.charAt(0) : ''}</span>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                        }`}>{user.name || 'N/A'}</h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                        }`}>{user.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg ${
                      theme === 'dark' ? 'bg-green-600/20 text-green-400 ring-1 ring-green-500/20' : 'bg-green-100 text-green-800 ring-1 ring-green-500/10'
                    }`}>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-lg ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        className={`p-2 rounded-lg transition-all ${
                          theme === 'dark' ? 'hover:bg-blue-600/20 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                        }`}
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-all ${
                          theme === 'dark' ? 'hover:bg-green-600/20 text-green-400' : 'hover:bg-green-50 text-green-600'
                        }`}
                        onClick={() => setViewUserId(user._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className={`p-2 rounded-lg transition-all ${
                          theme === 'dark' ? 'hover:bg-red-600/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/50'
              : 'bg-white'
          }`}>
            <div className={`sticky top-0 z-10 p-6 border-b backdrop-blur-xl ${
              theme === 'dark'
                ? 'border-slate-800/50 bg-slate-900/80'
                : 'border-gray-200 bg-white/80'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                }`}>
                  {editUser ? 'Edit User' : 'Add User'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); setEditUser(null); setImagePreview(null); }}
                  className={`p-2 rounded-lg transition-all ${
                    theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={form.name} 
                    onChange={handleFormChange} 
                    className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:bg-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
                    }`}
                    required 
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleFormChange} 
                    className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:bg-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
                    }`}
                    required 
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Password {editUser && <span className={`text-xs font-normal ${
                    theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                  }`}>(leave blank to keep unchanged)</span>}
                </label>
                <input 
                  type="password" 
                  name="password" 
                  value={form.password} 
                  onChange={handleFormChange} 
                  className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:bg-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
                  }`}
                  placeholder={editUser ? '••••••••' : ''} 
                  required={!editUser} 
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>Profile Image</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${
                  theme === 'dark'
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}>
                  <input 
                    type="file" 
                    name="profileImage" 
                    accept="image/*" 
                    onChange={handleFormChange} 
                    className="hidden" 
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className={`mx-auto h-12 w-12 mb-3 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                    }`}>Click to upload image</p>
                  </label>
                  {imagePreview && (
                    <div className="mt-4 flex items-center justify-center space-x-3">
                      <img src={imagePreview} alt="Profile Preview" className="w-20 h-20 object-cover rounded-xl ring-2 ring-blue-500" />
                      <button 
                        type="button" 
                        onClick={() => { setForm(prev => ({ ...prev, profileImage: '' })); setImagePreview(null); }} 
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                          theme === 'dark' ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>Role</label>
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={handleFormChange} 
                  className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:bg-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
                  }`}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {(form.role === 'Manager' || form.role === 'BranchOwner') && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Assigned Brand Owner</label>
                  <select
                    name="assignedBrandOwner"
                    value={form.assignedBrandOwner}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:bg-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
                    }`}
                  >
                    <option value="">Select Brand Owner</option>
                    {availableBrandOwners.map(bo => (
                      <option key={bo._id} value={bo._id}>{bo.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.role === 'BranchOwner' && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                  }`}>Assigned Manager</label>
                  <select
                    name="assignedManager"
                    value={form.assignedManager}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:bg-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
                    }`}
                  >
                    <option value="">Select Manager</option>
                    {availableManagers.map(manager => (
                      <option key={manager._id} value={manager._id}>{manager.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditUser(null); setImagePreview(null); }} 
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:shadow-blue-500/50'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-blue-500/30'
                  }`}
                >
                  {editUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;