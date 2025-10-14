// ============================================
// DailyStoreImagePage.jsx - Redesigned
// ============================================

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDailyStoreImage, getDailyStoreImagesForBranchOwner, reset } from '../../../../src/store/slices/dailyStoreImageSlice';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/ThemeContext';

const DailyStoreImagePage = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const imagesPerPage = 9;

  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useSelector((state) => state.auth);
  const { dailyStoreImages, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.dailyStoreImages
  );

  useEffect(() => {
    if (user && user.role === 'BranchOwner') {
      dispatch(getDailyStoreImagesForBranchOwner());
    }
    return () => {
      dispatch(reset());
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  useEffect(() => {
    console.log('Daily Store Images from Redux:', dailyStoreImages);
  }, [dailyStoreImages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
        dispatch(getDailyStoreImagesForBranchOwner());
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Pagination
  const totalPages = Math.ceil(dailyStoreImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = dailyStoreImages.slice(startIndex, endIndex);

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

  if (isLoading) {
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
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Daily Store Images
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Upload and manage your daily store photos
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-white text-sm font-medium">
                {dailyStoreImages.length} Images
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
                        <svg className={`w-12 h-12 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
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
                  disabled={!image}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    image
                      ? isDark
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                      : isDark
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Image
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
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Uploaded Images
              </h2>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
              }`}>
                {dailyStoreImages.length} Total
              </span>
            </div>
          </div>

          <div className="p-6">
            {currentImages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentImages.map((img) => (
                    <div
                      key={img._id}
                      className={`group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                        isDark ? 'bg-slate-700 shadow-lg shadow-slate-900/50' : 'bg-white shadow-lg'
                      }`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={`http://localhost:5000${img.img.startsWith('/') ? img.img : '/' + img.img}`}
                          alt="Daily Store"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            console.error('Failed to load image:', img.img);
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                      <div className={`p-4 ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                        <div className="flex items-center gap-2 text-sm">
                          <svg className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                            {new Date(img.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={`mt-6 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold">{Math.min(endIndex, dailyStoreImages.length)}</span> of{' '}
                        <span className="font-semibold">{dailyStoreImages.length}</span> images
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
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
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
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
                          onClick={() => setCurrentPage(currentPage + 1)}
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
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
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
                  <svg className={`w-12 h-12 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={`http://localhost:5000${selectedImage.img.startsWith('/') ? selectedImage.img : '/' + selectedImage.img}`}
              alt="Daily Store"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4">
              <p className="text-white text-sm">
                Uploaded: {new Date(selectedImage.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyStoreImagePage;