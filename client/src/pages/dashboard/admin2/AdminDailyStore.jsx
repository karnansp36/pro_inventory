import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  uploadDailyStoreImage,
  getDailyStoreImagesByBranch,
  reset
} from '../../../store/slices/dailyStoreImageSlice';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/ThemeContext';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  Image as ImageIcon,
  Calendar,
  Search,
  X
} from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_IMG;

const AdminDailyStore = () => {
  const { branchId } = useParams(); // Get branchId from URL params
  const branchOwnerId = branchId; // Use branchId from URL params
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Utility function to normalize image paths
  const normalizeImagePath = (path) => {
    if (!path) return '';
    // Ensure path starts with a '/'
    return path.startsWith('/') ? path : `/${path}`;
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useSelector((state) => state.auth);
  const { dailyStoreImages, totalItems, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.dailyStoreImages
  );

  // Fetch images based on branchOwnerId if available, otherwise for the logged-in branch owner
  useEffect(() => {
    if (branchOwnerId) {
      dispatch(getDailyStoreImagesByBranch({
        branchId: branchOwnerId,
        page: currentPage,
        limit: itemsPerPage
      }));
    } else if (user && user.role === 'BranchOwner') {
      dispatch(getDailyStoreImagesByBranch({
        page: currentPage,
        limit: itemsPerPage
      }));
    }
    return () => {
      dispatch(reset());
    };
  }, [dispatch, user, branchOwnerId, currentPage, itemsPerPage]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!image) {
      toast.error('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    dispatch(uploadDailyStoreImage(formData))
      .unwrap()
      .then(() => {
        toast.success('Image uploaded successfully');
        setImage(null);
        setImagePreview(null);
        // Refresh the first page to show the newly uploaded image
        setCurrentPage(1);
        dispatch(getDailyStoreImagesByBranch({ branchId: branchOwnerId, page: 1, limit: itemsPerPage }));
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Server-side pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

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

  // Fixed image error handler
  const handleImageError = (e) => {
    console.error('Failed to load image');
    // Remove the onerror handler to prevent infinite loop
    e.target.onerror = null;
    // Set a simple placeholder without trying to load another image
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTBiMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
  };

  // Filter images based on search term
  const filteredImages = dailyStoreImages.filter(img =>
    img.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(img.createdAt).toLocaleDateString().includes(searchTerm)
  );

  if (isLoading && dailyStoreImages.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl p-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-purple-600 to-pink-600'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  My Daily Store Images
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Upload and manage your daily store photos
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <ImageIcon className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">
                {totalItems} My Images
              </span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className={`rounded-2xl overflow-hidden ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        } shadow-xl`}>
          <div className={`px-6 py-4 border-b ${
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <Upload className="w-5 h-5" />
              Upload New Image
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag & Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                  dragActive
                    ? isDark
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-purple-500 bg-purple-50'
                    : isDark
                    ? 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="image"
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/*"
                />

                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden max-w-md mx-auto">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className={`text-center text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                      {image?.name}
                    </p>
                  </div>
                ) : (
                  <label htmlFor="image" className="cursor-pointer block">
                    <div className="flex flex-col items-center">
                      <div className={`p-4 rounded-full mb-4 ${
                        isDark ? 'bg-slate-600' : 'bg-gray-200'
                      }`}>
                        <Upload className={`w-12 h-12 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                      </div>
                      <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Drop your image here, or click to browse
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        Supports: JPG, PNG, GIF (Max 10MB)
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!image || isLoading}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    image && !isLoading
                      ? isDark
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                      : isDark
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Image
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Gallery Section */}
        <div className={`rounded-2xl overflow-hidden ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        } shadow-xl`}>
          <div className={`px-6 py-4 border-b ${
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <ImageIcon className="w-5 h-5" />
                My Uploaded Images
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-slate-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search my images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border transition-all ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                    }`}
                  />
                </div>

                {/* Items Per Page */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-purple-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                  }`}
                >
                  <option value={6}>6 per page</option>
                  <option value={9}>9 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={18}>18 per page</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {dailyStoreImages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(searchTerm ? filteredImages : dailyStoreImages).map((img) => (
                    <div
                      key={img._id}
                      className={`group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                        isDark ? 'bg-slate-700 shadow-lg shadow-slate-900/50' : 'bg-white shadow-lg'
                      }`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={`${API_BASE_URL}${normalizeImagePath(img.img)}`}
                          alt="Daily Store"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={handleImageError}
                        />
                      </div>
                      <div className={`p-4 ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                            {new Date(img.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {img.originalName}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <Search className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination - Only show if not searching */}
                {totalPages > 1 && !searchTerm && (
                  <div className={`mt-6 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> of{' '}
                        <span className="font-semibold">{totalItems}</span> images
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg transition-all ${
                            currentPage === 1
                              ? isDark
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isDark
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          <ChevronsLeft className="w-5 h-5" />
                        </button>

                        <button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg transition-all ${
                            currentPage === 1
                              ? isDark
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isDark
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((page, idx) => (
                            page === '...' ? (
                              <span key={`ellipsis-${idx}`} className={`px-3 py-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  currentPage === page
                                    ? isDark
                                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                      : 'bg-purple-600 text-white shadow-lg'
                                    : isDark
                                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          ))}
                        </div>

                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg transition-all ${
                            currentPage === totalPages
                              ? isDark
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isDark
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        <button
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg transition-all ${
                            currentPage === totalPages
                              ? isDark
                                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isDark
                              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          <ChevronsRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className={`p-4 rounded-full mb-4 ${
                  isDark ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <ImageIcon className={`w-12 h-12 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                  No Images Yet
                </h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Upload your first store image to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={`${API_BASE_URL}${normalizeImagePath(selectedImage.img)}`}
              alt="Daily Store"
              className="w-full h-auto rounded-2xl shadow-2xl"
              onError={handleImageError}
            />
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4">
              <p className="text-white text-sm">
                Uploaded: {new Date(selectedImage.createdAt).toLocaleString()}
              </p>
              <p className="text-white text-sm">
                File: {selectedImage.originalName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDailyStore;