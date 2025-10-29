import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { createUser, updateUser, getUsersByRole } from '../../store/slices/usersSlice';
import { X, Save, Loader2 } from 'lucide-react';

const UserForm = ({ user, onClose, onSubmit, initialData = {}, isSubmitting, submitError }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user: currentUser } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    password: '',
    role: initialData.role || '',
    assignedManager: initialData.assignedManager || '',
    assignedBrandOwner: initialData.assignedBrandOwner || '',
    isActive: initialData.isActive !== undefined ? initialData.isActive : true
  });

  const [managers, setManagers] = useState([]);
  const [brandOwners, setBrandOwners] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || prev.role, // Prioritize initialData.role if set
        assignedManager: user.assignedManager?._id || '',
        assignedBrandOwner: user.assignedBrandOwner?._id || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      }));
    }
  }, [user, initialData]);

  useEffect(() => {
    // Load managers and brand owners for dropdowns
    if (currentUser?.role === 'Admin') {
      dispatch(getUsersByRole({ role: 'Manager' })).then((action) => {
        if (action.payload?.users) {
          setManagers(action.payload.users);
        }
      });
      dispatch(getUsersByRole({ role: 'BrandOwner' })).then((action) => {
        if (action.payload?.users) {
          setBrandOwners(action.payload.users);
        }
      });
    }
  }, [dispatch, currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    } else {
      try {
        if (user) {
          await dispatch(updateUser({ id: user._id, userData: formData })).unwrap();
        } else {
          await dispatch(createUser(formData)).unwrap();
        }
        onClose();
      } catch (error) {
        console.error('Error saving user:', error);
      }
    }
  };

  const roles = ['Admin', 'BrandOwner', 'Manager', 'BranchOwner'];

  return (
    <div className={`p-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {user ? 'Edit User' : initialData.role === 'Manager' ? 'Add New Manager' : 'Add New User'}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDark
                ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              }`}
            />
          </div>

          {/* Email */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              }`}
            />
          </div>

          {/* Password */}
          {!user && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!user}
                className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={!!initialData.role} // Disable if initialData.role is provided
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              } ${!!initialData.role ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Brand Owner */}
          {formData.role === 'BranchOwner' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Assigned Brand Owner
              </label>
              <select
                name="assignedBrandOwner"
                value={formData.assignedBrandOwner}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              >
                <option value="">Select Brand Owner</option>
                {brandOwners.map((owner) => (
                  <option key={owner._id} value={owner._id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Assigned Manager */}
          {formData.role === 'BranchOwner' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Assigned Manager
              </label>
              <select
                name="assignedManager"
                value={formData.assignedManager}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              >
                <option value="">Select Manager</option>
                {managers.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name} ({manager.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status */}
          {user && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Active User
              </label>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              isDark
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-500/50'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-500/50'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {user ? 'Update User' : initialData.role === 'Manager' ? 'Create Manager' : 'Create User'}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isDark
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm;