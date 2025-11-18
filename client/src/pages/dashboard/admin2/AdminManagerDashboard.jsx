import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  AlertCircle,
  PlusCircle,
  Filter,
  Calendar,
  Truck,
  CreditCard
} from 'lucide-react';
import { 
  getBranchesByManagerId, 
  clearBranchesByManager, 
  getUserById, 
  createBranchOwner,
  clearCreateBranchOwnerStatus
} from '../../../store/slices/usersSlice';
import {
  updateUserProfile,
  clearError,
  clearSuccess
} from '../../../store/slices/profileSlice';
import { getDailyReportsByBranch } from '../../../store/slices/dailyReportSlice';
import { getStockRequestsByBranch } from '../../../store/slices/stockRequestsSlice';
import { getTransportsByBranch } from '../../../store/slices/transportSlice';
import { useTheme } from '../../../context/ThemeContext';
import Navbar from '../../../components/layout/Navbar';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL_IMG;

const AdminManagerDashboard = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { managerId } = useParams();
  const navigate = useNavigate();

  const { sales } = useSelector((state) => state.sales);
  const { expenses } = useSelector((state) => state.expenses);
  const { stockRequests } = useSelector((state) => state.stockRequests);
  const { 
    branchesByManager, 
    loading: branchesLoading, 
    userDetails: managerDetails,
    createBranchOwnerLoading,
    createBranchOwnerError,
    createBranchOwnerSuccess
  } = useSelector((state) => state.users);
  const { loading: profileLoading, error: profileError, success: profileSuccess } = useSelector((state) => state.profile);

  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [branchData, setBranchData] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [statsData, setStatsData] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalPendingRequests: 0,
    totalUrgentRequests: 0,
    totalTransports: 0,
    pendingTransports: 0
  });

  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchData, setNewBranchData] = useState({
    name: '',
    email: '',
    password: '',
    shopName: '',
    phoneNumbers: '',
    fullAddress: '',
  });

  const bannerFileInputRef = useRef(null);
  const profileFileInputRef = useRef(null);

  useEffect(() => {
    if (managerId) {
      dispatch(getBranchesByManagerId(managerId));
      dispatch(getUserById(managerId));
    }
    return () => {
      dispatch(clearBranchesByManager());
      dispatch(clearCreateBranchOwnerStatus());
    };
  }, [dispatch, managerId]);

  // Set initial images from managerDetails
  useEffect(() => {
    if (managerDetails?.bannerImage) {
      setBannerPreview(`${VITE_API_BASE_URL}${managerDetails.bannerImage}`);
    } else {
      setBannerPreview(null);
    }
    if (managerDetails?.profileImage) {
      setProfilePreview(`${VITE_API_BASE_URL}${managerDetails.profileImage}`);
    } else {
      setProfilePreview(null);
    }
  }, [managerDetails]);

  // Clear success/error messages
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

  useEffect(() => {
    if (createBranchOwnerSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearCreateBranchOwnerStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [createBranchOwnerSuccess, dispatch]);

  useEffect(() => {
    if (createBranchOwnerError) {
      const timer = setTimeout(() => {
        dispatch(clearCreateBranchOwnerStatus());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createBranchOwnerError, dispatch]);

  // Fetch data for all assigned branches when branches or filter changes
  useEffect(() => {
    const fetchBranchData = async () => {
      if (!branchesByManager?.length) return;

      setLoadingData(true);
      try {
        const filters = getFilters();
        
        const branchPromises = branchesByManager.map(async (branch) => {
          try {
            const [dailyReportsResult, stockRequestsResult, transportsResult] = await Promise.all([
              dispatch(getDailyReportsByBranch({ 
                branchId: branch._id, 
                page: 1, 
                limit: 100, 
                filters 
              })).unwrap(),
              dispatch(getStockRequestsByBranch({ 
                branchId: branch._id, 
                page: 1, 
                limit: 100, 
                filters 
              })).unwrap(),
              dispatch(getTransportsByBranch({ 
                branchId: branch._id, 
                page: 1, 
                limit: 100 
              })).unwrap()
            ]);

            return {
              branchId: branch._id,
              dailyReports: dailyReportsResult?.dailyReports || dailyReportsResult?.data || [],
              stockRequests: stockRequestsResult?.stockRequests || stockRequestsResult?.data || [],
              transports: transportsResult?.transports || transportsResult?.data || []
            };
          } catch (error) {
            console.error(`Error fetching data for branch ${branch._id}:`, error);
            return {
              branchId: branch._id,
              dailyReports: [],
              stockRequests: [],
              transports: []
            };
          }
        });

        const results = await Promise.all(branchPromises);
        
        const newBranchData = {};
        results.forEach(result => {
          newBranchData[result.branchId] = {
            dailyReports: result.dailyReports,
            stockRequests: result.stockRequests,
            transports: result.transports
          };
        });

        setBranchData(newBranchData);
        
        // Calculate stats after data is fetched
        calculateStats(newBranchData);
      } catch (error) {
        console.error('Error fetching branch data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchBranchData();
  }, [branchesByManager, timeFilter, customDateRange]);

  // Helper function to get filters based on time selection
  const getFilters = () => {
    const now = new Date();
    let startDate, endDate;

    switch (timeFilter) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          startDate = new Date(customDateRange.startDate);
          endDate = new Date(customDateRange.endDate);
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Calculate stats from assigned branches data with filters
  const assignedBranches = branchesByManager || [];

  // Calculate totals from all branch data for stats
  const calculateStats = (branchDataObj = branchData) => {
    let totalSales = 0;
    let totalExpenses = 0;
    let totalPendingRequests = 0;
    let totalUrgentRequests = 0;
    let totalTransports = 0;
    let pendingTransports = 0;

    console.log('Calculating stats from branch data:', branchDataObj);

    assignedBranches.forEach(branch => {
      const branchDataItem = branchDataObj[branch._id];
      
      if (branchDataItem) {
        // Calculate sales from daily reports - based on your API response structure
        const branchSales = branchDataItem.dailyReports.reduce((sum, report) => {
          const sales = (report.gpay || 0) + (report.card || 0) + (report.cash || 0);
          console.log(`Branch ${branch._id} sales:`, sales, 'from report:', report);
          return sum + sales;
        }, 0);
        totalSales += branchSales;

        // Calculate expenses from daily reports
        const branchExpenses = branchDataItem.dailyReports.reduce((sum, report) => {
          const expenses = report.expenses || 0;
          console.log(`Branch ${branch._id} expenses:`, expenses, 'from report:', report);
          return sum + expenses;
        }, 0);
        totalExpenses += branchExpenses;

        // Count pending and urgent stock requests
        // PENDING REQUESTS: where approved is false
        const pendingRequests = branchDataItem.stockRequests.filter(req => 
          req.approved === false // Only count if approved is false
        ).length;
        totalPendingRequests += pendingRequests;

        // URGENT REQUESTS: where priority is 'Urgent' AND approved is false
        const urgentRequests = branchDataItem.stockRequests.filter(req => 
          req.priority === 'Urgent' && req.approved === false // Both conditions must be true
        ).length;
        totalUrgentRequests += urgentRequests;

        // Count transports
        const branchTransports = branchDataItem.transports.length;
        totalTransports += branchTransports;

        // Count pending transports (assuming status field exists)
        const branchPendingTransports = branchDataItem.transports.filter(transport => 
          transport.status === 'pending' || transport.status === 'in-progress' || !transport.completed
        ).length;
        pendingTransports += branchPendingTransports;

        console.log(`Branch ${branch._id} Stock Requests:`, branchDataItem.stockRequests);
        console.log(`Branch ${branch._id}:`, {
          sales: branchSales,
          expenses: branchExpenses,
          pendingRequests,
          urgentRequests,
          transports: branchTransports,
          pendingTransports: branchPendingTransports,
          stockRequestsCount: branchDataItem.stockRequests.length,
          approvedRequests: branchDataItem.stockRequests.filter(req => req.approved === true).length,
          unapprovedRequests: branchDataItem.stockRequests.filter(req => req.approved === false).length,
          urgentUnapprovedRequests: branchDataItem.stockRequests.filter(req => req.priority === 'Urgent' && req.approved === false).length
        });
      }
    });

    const netProfit = totalSales - totalExpenses;

    console.log('Final stats:', {
      totalSales,
      totalExpenses,
      netProfit,
      totalPendingRequests,
      totalUrgentRequests,
      totalTransports,
      pendingTransports
    });

    setStatsData({
      totalSales,
      totalExpenses,
      netProfit,
      totalPendingRequests,
      totalUrgentRequests,
      totalTransports,
      pendingTransports
    });
  };

  // Handle new branch form changes
  const handleNewBranchChange = (e) => {
    const { name, value } = e.target;
    setNewBranchData((prevData) => ({ ...prevData, [name]: value }));
  };
 // Add this function for product payments navigation
  const handleProductPaymentsClick = () => {
    navigate(`/dashboard/admin/manager/${managerId}/product-payments`);
  };
  // Handle new branch submission using the new backend endpoint
  const handleAddBranchSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const branchOwnerData = {
        name: newBranchData.name,
        email: newBranchData.email,
        password: newBranchData.password,
        shopName: newBranchData.shopName || newBranchData.name,
        fullAddress: newBranchData.fullAddress,
        phoneNumbers: newBranchData.phoneNumbers.split(',').map(p => p.trim()).filter(p => p),
        assignedManager: managerId,
      };

      await dispatch(createBranchOwner(branchOwnerData)).unwrap();
      
      // Reset form and close modal
      setNewBranchData({
        name: '',
        email: '',
        password: '',
        shopName: '',
        phoneNumbers: '',
        fullAddress: '',
      });
      setShowAddBranchModal(false);
      
      // Refresh branches data
      dispatch(getBranchesByManagerId(managerId));
      dispatch(getUserById(managerId));
      
    } catch (err) {
      console.error('Failed to create branch owner:', err);
      // Error is handled by Redux state
    }
  };

  // Stats data using only assigned branches information
  const stats = [
    {
      title: 'Assigned Managers',
      value: assignedBranches.length,
      icon: Building2,
      color: 'blue',
      change: '+0',
      link: '/dashboard/manager/branch-owners'
    },
    {
      title: 'Total Sales',
      value: `$${statsData.totalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: 'green',
      change: '+8.2%',
      link: '/dashboard/manager/sales'
    },
    {
      title: 'Total Expenses',
      value: `$${statsData.totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      color: 'red',
      change: '-2.1%',
      link: '/dashboard/manager/expenses'
    },
    {
      title: 'Net Profit',
      value: `$${statsData.netProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: statsData.netProfit >= 0 ? 'green' : 'red',
      change: statsData.netProfit >= 0 ? '+6.1%' : '-6.1%',
      link: '/dashboard/manager/reports'
    },
    {
      title: 'Pending Requests',
      value: statsData.totalPendingRequests,
      icon: Package,
      color: 'orange',
      change: `+${statsData.totalPendingRequests}`,
      link: `/dashboard/manager/stock-requests/${managerId}`
    },
    {
      title: 'Urgent Requests',
      value: statsData.totalUrgentRequests,
      icon: AlertTriangle,
      color: 'red',
      change: `+${statsData.totalUrgentRequests}`,
      link: `/dashboard/manager/stock-requests/${managerId}`
    },
    {
      title: 'Total Transports',
      value: statsData.totalTransports,
      icon: Truck,
      color: 'purple',
      change: `+${statsData.totalTransports}`,
      link: '/dashboard/manager/transports'
    },
    {
      title: 'Pending Transports',
      value: statsData.pendingTransports,
      icon: Truck,
      color: 'yellow',
      change: `+${statsData.pendingTransports}`,
      link: '/dashboard/manager/transports'
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
      },
      purple: {
        bg: theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-50',
        text: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
        gradient: 'from-purple-500 to-indigo-600',
        ring: theme === 'dark' ? 'ring-purple-500/20' : 'ring-purple-500/10'
      },
      yellow: {
        bg: theme === 'dark' ? 'bg-yellow-600/20' : 'bg-yellow-50',
        text: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
        gradient: 'from-yellow-500 to-amber-600',
        ring: theme === 'dark' ? 'ring-yellow-500/20' : 'ring-yellow-500/10'
      }
    };
    return colors[color];
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'O';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Banner image handlers
  const handleBannerEdit = () => setIsEditingBanner(true);
  const handleBannerCancel = () => {
    setIsEditingBanner(false);
    setBannerImage(null);
    setBannerPreview(managerDetails?.bannerImage ? `${VITE_API_BASE_URL}${managerDetails.bannerImage}` : null);
  };

  const handleBannerFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Banner image must be less than 10MB');
        return;
      }
      setBannerImage(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const triggerBannerFileInput = () => bannerFileInputRef.current?.click();

  // Profile image handlers
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setProfileImage(null);
    setProfilePreview(managerDetails?.profileImage ? `${VITE_API_BASE_URL}${managerDetails.profileImage}` : null);
  };

  const handleProfileFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Profile image must be less than 5MB');
        return;
      }
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const triggerProfileFileInput = () => profileFileInputRef.current?.click();

  // Save images
  const handleSaveImages = async () => {
    if (!bannerImage && !profileImage) {
      setIsEditingBanner(false);
      setIsEditingProfile(false);
      return;
    }

    try {
      const formData = new FormData();
      
      if (bannerImage) formData.append('bannerImage', bannerImage);
      if (profileImage) formData.append('profileImage', profileImage);

      if (managerDetails) {
        Object.keys(managerDetails).forEach(key => {
          if (key !== 'bannerImage' && key !== 'profileImage' && managerDetails[key] !== undefined) {
            formData.append(key, managerDetails[key]);
          }
        });
      }

      await dispatch(updateUserProfile(formData)).unwrap();
      
      setIsEditingBanner(false);
      setIsEditingProfile(false);
      setBannerImage(null);
      setProfileImage(null);
      
    } catch (error) {
      console.error('Failed to update images:', error);
    }
  };

  const hasChanges = bannerImage || profileImage;

  // Get branch-specific data for display in branch cards
  const getBranchStats = (branchId) => {
    const data = branchData[branchId];
    if (!data) return { 
      sales: 0, 
      pendingRequests: 0, 
      urgentRequests: 0, 
      transports: 0,
      pendingTransports: 0 
    };

    const sales = data.dailyReports.reduce((sum, report) => 
      sum + (report.gpay || 0) + (report.card || 0) + (report.cash || 0), 0
    );
    
    // PENDING REQUESTS: where approved is false
    const pendingRequests = data.stockRequests.filter(req => req.approved === false).length;
    
    // URGENT REQUESTS: where priority is 'Urgent' AND approved is false
    const urgentRequests = data.stockRequests.filter(req => 
      req.priority === 'Urgent' && req.approved === false
    ).length;
    
    const transports = data.transports.length;
    const pendingTransports = data.transports.filter(transport => 
      transport.status === 'pending' || transport.status === 'in-progress' || !transport.completed
    ).length;

    return { sales, pendingRequests, urgentRequests, transports, pendingTransports };
  };

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

      {createBranchOwnerSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Branch created successfully!
          </div>
        </div>
      )}

      {createBranchOwnerError && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {createBranchOwnerError}
          </div>
        </div>
      )}

      {/* YouTube-style Banner */}
      <div className="relative">
        <div className={`h-48 sm:h-64 lg:h-80 relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900'
            : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
        }`}>
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
          )}
          
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
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(managerDetails?.name)
                  )}
                   
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
                    {managerDetails?.name || 'Owner'}
                  </h1>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    theme === 'dark'
                      ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30'
                      : 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                  }`}>
                    Owner
                  </div>
                </div>
                 
                <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{managerDetails?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{assignedBranches.length} Managers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
                    } animate-pulse`}></div>
                    <span>Active Now</span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
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
            <span className="text-gray-700 dark:text-white">Updating profile...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Filter Section */}
        <div className={`rounded-2xl border shadow-lg p-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800/50'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className={`w-5 h-5 ${
                theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
              }`} />
              <h3 className={`font-semibold ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
              }`}>
                Data Filter
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className={`text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Time Period:
                </label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              {timeFilter === 'custom' && (
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`} />
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>to</span>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({
                      ...prev,
                      endDate: e.target.value
                    }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              )}
              
              {loadingData && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Loading data...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
               
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Total Owners
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
                  Assigned Managers ({assignedBranches.length})
                </h2>
              </div>
              <div className="flex items-center gap-4">
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
                <button
                  onClick={() => setShowAddBranchModal(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Manager</span>
                </button>
              </div>
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
                  {assignedBranches.slice(0, 6).map((branch) => {
                    const branchStats = getBranchStats(branch._id);
                    return (
                      <Link
                        key={branch._id}
                        to={`/dashboard/admin/branch/${branch._id}`}
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
                              ${branchStats.sales.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Pending Requests:</span>
                            <span className="font-semibold">
                              {branchStats.pendingRequests}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Urgent Requests:</span>
                            <span className="font-semibold">
                              {branchStats.urgentRequests}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Transports:</span>
                            <span className="font-semibold">
                              {branchStats.transports}
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
                    );
                  })}
                </div>
                {assignedBranches.length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className={`h-16 w-16 mx-auto mb-4 ${
                      theme === 'dark' ? 'text-slate-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      No Manager Assigned
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                    }`}>
                      You haven't been assigned any Managers yet.
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
                to="/dashboard/manager/transports"
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
                    <Truck className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
                  }`}>
                    Transports
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
                    theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'
                  }`}>
                    <Award className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
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
       
      {/* Add Branch Modal - Redesigned */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`relative rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
              : 'bg-gradient-to-br from-white via-gray-50 to-white'
          }`}>
            {/* Header with gradient */}
            <div className={`relative p-8 border-b ${
              theme === 'dark' 
                ? 'border-slate-700/50 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10' 
                : 'border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                } shadow-lg`}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Add New Manager
                  </h3>
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Create a new manager  account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBranchModal(false)}
                className={`absolute top-6 right-6 p-2 rounded-xl transition-all ${
                  theme === 'dark'
                    ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                    : 'hover:bg-gray-200 text-gray-400 hover:text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddBranchSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Owner Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className={`block text-sm font-semibold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Manager Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newBranchData.name}
                      onChange={handleNewBranchChange}
                      required
                      placeholder="Enter owner's full name"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all focus:ring-4 ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Shop Name */}
                <div className="space-y-2">
                  <label htmlFor="shopName" className={`block text-sm font-semibold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      id="shopName"
                      name="shopName"
                      value={newBranchData.shopName}
                      onChange={handleNewBranchChange}
                      required
                      placeholder="Enter shop name"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all focus:ring-4 ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className={`block text-sm font-semibold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newBranchData.email}
                      onChange={handleNewBranchChange}
                      required
                      placeholder="owner@example.com"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all focus:ring-4 ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className={`block text-sm font-semibold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Award className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={newBranchData.password}
                      onChange={handleNewBranchChange}
                      required
                      placeholder="Create a secure password"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all focus:ring-4 ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="phoneNumbers" className={`block text-sm font-semibold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Phone Numbers
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      id="phoneNumbers"
                      name="phoneNumbers"
                      value={newBranchData.phoneNumbers}
                      onChange={handleNewBranchChange}
                      placeholder="Enter phone numbers separated by commas"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all focus:ring-4 ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                    Separate multiple numbers with commas (e.g., +1234567890, +0987654321)
                  </p>
                </div>

                {/* Full Address */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="fullAddress" className={`block text-sm font-semibold ${
                    theme === 'dark' ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-3 w-5 h-5 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-400'
                    }`} />
                    <textarea
                      id="fullAddress"
                      name="fullAddress"
                      value={newBranchData.fullAddress}
                      onChange={handleNewBranchChange}
                      rows="3"
                      required
                      placeholder="Enter complete address"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 transition-all focus:ring-4 resize-none ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBranchOwnerLoading}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {createBranchOwnerLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Manager...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Create Manager
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagerDashboard;