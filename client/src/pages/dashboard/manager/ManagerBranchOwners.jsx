// client/src/pages/manager/ManagerBranchOwners.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Building2, Mail, Phone, MapPin, Eye, Filter } from 'lucide-react';
import { getUsers } from '../../../store/slices/usersSlice';
import { useTheme } from '../../../context/ThemeContext';

const ManagerBranchOwners = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  // Get assigned branches
  const assignedBranches = users || [];

  const filteredBranches = assignedBranches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Assigned Branches
          </h1>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Manage and view your assigned branches
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl ${
          theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'
        }`}>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
          }`}>
            {assignedBranches.length} Branches
          </span>
        </div>
      </div>

      {/* Search */}
      <div className={`p-6 rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800/50'
          : 'bg-white border-gray-200'
      }`}>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search branches by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          />
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <div
            key={branch._id}
            className={`group rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50 hover:border-slate-700'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
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
              <Link
                to={`/dashboard/manager/branch-owners/${branch._id}`}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  theme === 'dark'
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                <Eye className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                }`} />
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                  {branch.phone || 'No phone'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                }`} />
                <span className={`truncate ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  {branch.address || 'No address'}
                </span>
              </div>
            </div>
            
            <div className={`mt-4 pt-4 border-t ${
              theme === 'dark' ? 'border-slate-800' : 'border-gray-200'
            }`}>
              <div className="flex justify-between text-sm">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                  Status
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-green-600/20 text-green-400' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  Active
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBranches.length === 0 && (
        <div className={`text-center py-16 rounded-2xl border ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800/50'
            : 'bg-white border-gray-200'
        }`}>
          <Building2 className={`h-16 w-16 mx-auto mb-4 ${
            theme === 'dark' ? 'text-slate-600' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
          }`}>
            {searchTerm ? 'No branches found' : 'No branches assigned'}
          </h3>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
          }`}>
            {searchTerm ? 'Try adjusting your search terms' : 'You will see branches here once they are assigned to you'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagerBranchOwners;