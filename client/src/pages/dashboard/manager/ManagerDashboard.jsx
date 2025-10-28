import { useEffect, useState, useRef } from 'react';
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
  Award,
  Camera,
  Edit3,
  Save,
  X,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getBranchesByManagerId, clearBranchesByManager } from '../../../store/slices/usersSlice';
import { 
  updateUserProfile, 
  clearError, 
  clearSuccess 
} from '../../../store/slices/profileSlice';
import { useTheme } from '../../../context/ThemeContext';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { sales } = useSelector((state) => state.sales);
  const { expenses } = useSelector((state) => state.expenses);
  const { stockRequests } = useSelector((state) => state.stockRequests);
  const { branchesByManager, loading: branchesLoading } = useSelector((state) => state.users);
  const { loading: profileLoading, error: profileError, success: profileSuccess } = useSelector((state) => state.profile);
  
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  
  const bannerFileInputRef = useRef(null);
  const profileFileInputRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(getBranchesByManagerId(user._id));
    }
    return () => {
      dispatch(clearBranchesByManager());
    };
  }, [dispatch, user?._id]);

  // Set initial images from user data
  useEffect(() => {
    if (user?.bannerImage) {
      setBannerPreview(`${VITE_API_BASE_URL}${user.bannerImage}`);
    }
    if (user?.profileImage) {
      setProfilePreview(`${VITE_API_BASE_URL}${user.profileImage}`);
    }
  }, [user]);

  // Clear success/error messages after a delay
  useEffect(() => {
    if (profileSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess, dispatch]);

  useEffect(() => {
    if (profileError) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [profileError, dispatch]);

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
      link: `/dashboard/manager/stock-requests/${user?._id}`
    },
    {
      title: 'Urgent Requests',
      value: urgentRequests,
      icon: AlertTriangle,
      color: 'red',
      change: `+${urgentRequests}`,
      link: `/dashboard/manager/stock-requests/${user?._id}`
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

  // Banner image handlers
  const handleBannerEdit = () => {
    setIsEditingBanner(true);
  };

  const handleBannerCancel = () => {
    setIsEditingBanner(false);
    setBannerImage(null);
    setBannerPreview(user?.bannerImage ? `${VITE_API_BASE_URL}/${user.bannerImage}` : null);
  };

  const handleBannerFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB for banner)
      if (file.size > 10 * 1024 * 1024) {
        alert('Banner image must be less than 10MB');
        return;
      }
      
      setBannerImage(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };

  const triggerBannerFileInput = () => {
    bannerFileInputRef.current?.click();
  };

  // Profile image handlers
  const handleProfileEdit = () => {
    setIsEditingProfile(true);
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setProfileImage(null);
    setProfilePreview(user?.profileImage ? `${VITE_API_BASE_URL}/${user.profileImage}` : null);
  };

  const handleProfileFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB for profile)
      if (file.size > 5 * 1024 * 1024) {
        alert('Profile image must be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePreview(previewUrl);
    }
  };

  const triggerProfileFileInput = () => {
    profileFileInputRef.current?.click();
  };

  // Save images
  // Save images
const handleSaveImages = async () => {
  if (!bannerImage && !profileImage) {
    setIsEditingBanner(false);
    setIsEditingProfile(false);
    return;
  }

  try {
    const formData = new FormData();
    
    if (bannerImage) {
      formData.append('bannerImage', bannerImage);
    }
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    // Include existing user data to maintain profile information
    if (user) {
      Object.keys(user).forEach(key => {
        if (key !== 'bannerImage' && key !== 'profileImage' && user[key] !== undefined) {
          formData.append(key, user[key]);
        }
      });
    }

    await dispatch(updateUserProfile(formData)).unwrap();
    
    // Reset editing states
    setIsEditingBanner(false);
    setIsEditingProfile(false);
    setBannerImage(null);
    setProfileImage(null);
    
  } catch (error) {
    console.error('Failed to update images:', error);
  }
};

  const hasChanges = bannerImage || profileImage;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <Navbar/>
      
      {/* Success/Error Messages */}
      {profileSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Profile updated successfully!
          </div>
        </div>
      )}
      
      {profileError && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {profileError}
          </div>
        </div>
      )}

      {/* YouTube-style Banner */}
      <div className="relative">
        {/* Banner Image */}
        <div className={`h-48 sm:h-64 lg:h-80 relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900'
            : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
        }`}>
          {/* Banner Image or Gradient Background */}
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            // Animated background pattern
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className={`absolute inset-0 ${
            theme === 'dark'
              ? 'bg-gradient-to-b from-transparent via-transparent to-slate-900'
              : 'bg-gradient-to-b from-transparent via-transparent to-white'
          }`}></div>

          {/* Banner Edit Button */}
          <div className="absolute top-4 right-4 z-10">
            {isEditingBanner ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={triggerBannerFileInput}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  Change Banner
                </button>
                <button
                  onClick={handleBannerCancel}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleBannerEdit}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${
                  theme === 'dark'
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 text-white'
                    : 'bg-white/80 hover:bg-white text-gray-700'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Edit Banner
              </button>
            )}
          </div>

          {/* Banner Upload Instructions */}
          {isEditingBanner && !bannerPreview && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-center p-6 rounded-lg backdrop-blur-sm ${
                theme === 'dark' ? 'bg-slate-800/50 text-white' : 'bg-white/80 text-gray-700'
              }`}>
                <Upload className="w-12 h-12 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-semibold mb-2">Upload Banner Image</p>
                <p className="text-sm opacity-80">Recommended: 1920x1080px, max 10MB</p>
              </div>
            </div>
          )}

          {/* Hidden file input for banner */}
          <input
            type="file"
            ref={bannerFileInputRef}
            onChange={handleBannerFileSelect}
            accept="image/*"
            className="hidden"
          />
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
                } shadow-2xl overflow-hidden relative`}>
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(user?.name)
                  )}
                  
                  {/* Profile Upload Overlay */}
                  {isEditingProfile && !profilePreview && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Profile Edit Button */}
                <div className="absolute bottom-2 right-2 z-10">
                  {isEditingProfile ? (
                    <div className="flex gap-1">
                      <button
                        onClick={triggerProfileFileInput}
                        className={`p-2 rounded-full shadow-lg ${
                          theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleProfileCancel}
                        className={`p-2 rounded-full shadow-lg ${
                          theme === 'dark'
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleProfileEdit}
                      className={`p-2 rounded-full shadow-lg transition-all ${
                        theme === 'dark'
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-white hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Indicator */}
                <div className={`absolute bottom-2 left-2 w-8 h-8 rounded-full border-4 flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-green-500 border-slate-900'
                    : 'bg-green-500 border-white'
                }`}>
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-3 mb-2">
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

              {/* Save Button (shown when editing) */}
              {(isEditingBanner || isEditingProfile) && hasChanges && (
                <div className="flex sm:justify-end">
                  <button
                    onClick={handleSaveImages}
                    disabled={profileLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                      theme === 'dark'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {profileLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden file input for profile */}
        <input
          type="file"
          ref={profileFileInputRef}
          onChange={handleProfileFileSelect}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Loading Overlay */}
      {profileLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 flex items-center gap-3 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-gray-700 dark:text-white font-medium">Uploading images...</span>
          </div>
        </div>
      )}

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
            {branchesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
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
                            {branch.shopName || branch.name}
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
                        {branch.fullAddress && (
                          <div className="flex items-start gap-2 text-sm pt-2 border-t border-slate-700/30">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>
                              {branch.fullAddress.split(',').slice(0, 2).join(',')}
                            </span>
                          </div>
                        )}
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
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-2xl border shadow-lg ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-6 lg:p-8">
            <h2 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
            }`}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/dashboard/manager/stock-requests"
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer block ${
                  theme === 'dark'
                    ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-orange-600/20' : 'bg-orange-50'
                  }`}>
                    <Package className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    Stock Requests
                  </span>
                </div>
              </Link>
              <Link
                to="/dashboard/manager/reports"
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer block ${
                  theme === 'dark'
                    ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-green-600/20' : 'bg-green-50'
                  }`}>
                    <TrendingUp className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    Reports
                  </span>
                </div>
              </Link>
              <Link
                to="/dashboard/manager/analytics"
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer block ${
                  theme === 'dark'
                    ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'
                  }`}>
                    <Building2 className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    Analytics
                  </span>
                </div>
              </Link>
              <Link
                to="/dashboard/manager/settings"
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer block ${
                  theme === 'dark'
                    ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-50'
                  }`}>
                    <Award className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    Settings
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;