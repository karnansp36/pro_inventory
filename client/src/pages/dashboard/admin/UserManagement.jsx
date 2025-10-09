// pages/admin/UserManagement.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter, Edit, Trash2, UserPlus, Eye } from 'lucide-react';
import { getUsers, deleteUser, createUser, updateUser, getUsersByRole, assignUser } from '../../../store/slices/usersSlice';
import UserView from './UserView'; // Import UserView

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    profileImage: null, // Add profileImage to form state
    assignedBrandOwner: '', // For assigning Managers/Branch Owners to Brand Owners
    assignedManager: '', // For assigning Branch Owners to Managers
  });
  const [viewUserId, setViewUserId] = useState(null);
  const [availableBrandOwners, setAvailableBrandOwners] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null); // For image preview

  useEffect(() => {
    dispatch(getUsers());
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

  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (roleFilter === '' || user.role === roleFilter)
  );

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId));
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
      profileImage: null, // Don't pre-fill file input
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
    // If editing and no new image is selected, but there was an existing image,
    // and the user explicitly cleared it (e.g., by setting profileImage to empty string)
    if (editUser && !form.profileImage && imagePreview === null && editUser.profileImage) {
      formData.append('profileImage', ''); // Indicate to backend to clear the image
    }

    // Define userData here to ensure it's in scope if the error is truly about a missing variable
    const userData = formData;

    if (editUser) {
      // Edit
      dispatch(updateUser({ id: editUser._id, userData: userData })) // Use the defined userData
        .then((res) => {
          if (!res.error) {
            setShowModal(false);
            setEditUser(null);
            setForm({ name: '', email: '', password: '', role: '', profileImage: null, assignedBrandOwner: '', assignedManager: '' });
            setImagePreview(null);
          }
        });
    } else {
      // Add
      dispatch(createUser(userData)).then((res) => { // Use the defined userData
        if (!res.error) {
          setShowModal(false);
          setForm({ name: '', email: '', password: '', role: '', profileImage: null, assignedBrandOwner: '', assignedManager: '' });
          setImagePreview(null);
        }
      });
    }
  };

  const roles = ['Admin', 'BrandOwner', 'Manager', 'BranchOwner'];

  return (
    <div className="space-y-6">
      {viewUserId ? (
        <UserView userId={viewUserId} onClose={() => setViewUserId(null)} />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage all users in the system</p>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              onClick={handleAddUser}
            >
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers?.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                            {user.profileImage ? (
                              <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-gray-600">{user.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'BrandOwner' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'Manager' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="View User Details"
                            onClick={() => setViewUserId(user._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900"
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
        </>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editUser ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" name="name" value={form.name} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password {editUser && <span className="text-xs text-gray-400">(leave blank to keep unchanged)</span>}</label>
                <input type="password" name="password" value={form.password} onChange={handleFormChange} className="w-full border rounded px-3 py-2" placeholder={editUser ? '••••••••' : ''} required={!editUser} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <input type="file" name="profileImage" accept="image/*" onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                {imagePreview && (
                  <div className="mt-2 flex items-center space-x-2">
                    <img src={imagePreview} alt="Profile Preview" className="w-16 h-16 object-cover rounded-full" />
                    <button type="button" onClick={() => { setForm(prev => ({ ...prev, profileImage: '' })); setImagePreview(null); }} className="text-red-600 text-sm">Remove Image</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select name="role" value={form.role} onChange={handleFormChange} className="w-full border rounded px-3 py-2" required>
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              {/* Conditional rendering for assignedBrandOwner and assignedManager */}
              {(form.role === 'Manager' || form.role === 'BranchOwner') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Brand Owner</label>
                  <select
                    name="assignedBrandOwner"
                    value={form.assignedBrandOwner}
                    onChange={handleFormChange}
                    className="w-full border rounded px-3 py-2"
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
                  <label className="block text-sm font-medium text-gray-700">Assigned Manager</label>
                  <select
                    name="assignedManager"
                    value={form.assignedManager}
                    onChange={handleFormChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Manager</option>
                    {availableManagers.map(manager => (
                      <option key={manager._id} value={manager._id}>{manager.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowModal(false); setEditUser(null); setImagePreview(null); }} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{editUser ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
