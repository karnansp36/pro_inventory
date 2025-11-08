import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadDailyStoreImage,
  getDailyStoreImagesByBranch,
  reset,
} from "../../../../src/store/slices/dailyStoreImageSlice";
import { toast } from "react-toastify";
import { useTheme } from "../../../context/ThemeContext";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Camera,
  Image as ImageIcon,
  Calendar,
  Search,
  X,
  RotateCcw,
  Check,
  Clock,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_IMG;

const DailyStoreImagePage = () => {
  const location = useLocation();
  const { branchOwnerId } = location.state || {};
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureTimestamp, setCaptureTimestamp] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const normalizeImagePath = (path) => {
    if (!path) return "";
    return path.startsWith("/") ? path : `/${path}`;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useSelector((state) => state.auth);
  const {
    dailyStoreImages,
    totalItems,
    isLoading,
    isSuccess,
    isError,
    message,
  } = useSelector((state) => state.dailyStoreImages);

  useEffect(() => {
    if (branchOwnerId) {
      dispatch(
        getDailyStoreImagesByBranch({
          branchId: branchOwnerId,
          page: currentPage,
          limit: itemsPerPage,
        })
      );
    } else if (user && user.role === "BranchOwner") {
      dispatch(
        getDailyStoreImagesByBranch({
          page: currentPage,
          limit: itemsPerPage,
        })
      );
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

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add timestamp overlay
    const now = new Date();
    const timestamp = now.toLocaleString();
    
    // Configure text style
    context.font = "bold 24px Arial";
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(10, canvas.height - 50, 400, 40);
    
    context.fillStyle = "white";
    context.fillText(timestamp, 20, canvas.height - 20);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      const file = new File([blob], `store-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setImage(file);
      setImagePreview(canvas.toDataURL("image/jpeg"));
      setCaptureTimestamp(now);
      stopCamera();
    }, "image/jpeg", 0.9);
  };

  const retakePhoto = () => {
    setImage(null);
    setImagePreview(null);
    setCaptureTimestamp(null);
    startCamera();
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setCaptureTimestamp(null);
    stopCamera();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please capture an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    dispatch(uploadDailyStoreImage(formData))
      .unwrap()
      .then(() => {
        toast.success("Image uploaded successfully");
        setImage(null);
        setImagePreview(null);
        setCaptureTimestamp(null);
        setCurrentPage(1);
        dispatch(
          getDailyStoreImagesByBranch({ page: 1, limit: itemsPerPage })
        );
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));

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
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleImageError = (e) => {
    console.error("Failed to load image");
    e.target.onerror = null;
    e.target.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTBiMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
  };

  const filteredImages = dailyStoreImages.filter(
    (img) =>
      img.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(img.createdAt).toLocaleDateString().includes(searchTerm)
  );

  if (isLoading && dailyStoreImages.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-slate-900" : "bg-gray-50"
        }`}
      >
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
        <div
          className={`rounded-2xl p-6 ${
            isDark
              ? "bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600"
              : "bg-gradient-to-r from-purple-600 to-pink-600"
          } shadow-xl`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Daily Store Camera
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Capture and manage your daily store photos
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <ImageIcon className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">
                {totalItems} Images
              </span>
            </div>
          </div>
        </div>

        {/* Camera Section */}
        <div
          className={`rounded-2xl overflow-hidden ${
            isDark ? "bg-slate-800 border border-slate-700" : "bg-white"
          } shadow-xl`}
        >
          <div
            className={`px-6 py-4 border-b ${
              isDark
                ? "border-slate-700 bg-slate-800/50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <h2
              className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              <Camera className="w-5 h-5" />
              Capture New Image
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Camera/Preview Area */}
              <div className="relative rounded-2xl overflow-hidden">
                {!cameraActive && !imagePreview && (
                  <div
                    className={`flex flex-col items-center justify-center p-12 ${
                      isDark ? "bg-slate-700/30" : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-6 rounded-full mb-4 ${
                        isDark ? "bg-slate-600" : "bg-gray-200"
                      }`}
                    >
                      <Camera
                        className={`w-16 h-16 ${
                          isDark ? "text-slate-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={startCamera}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        isDark
                          ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                      }`}
                    >
                      <Camera className="w-5 h-5" />
                      Open Camera
                    </button>
                  </div>
                )}

                {cameraActive && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-auto rounded-xl"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={captureImage}
                        className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-xl font-semibold transition-colors shadow-lg flex items-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Capture
                      </button>
                    </div>
                    {/* Current time display */}
                    <div className="absolute top-4 left-4 px-4 py-2 bg-black/70 text-white rounded-lg flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-auto"
                      />
                    </div>
                    {captureTimestamp && (
                      <div
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                          isDark ? "bg-slate-700" : "bg-gray-100"
                        }`}
                      >
                        <Clock
                          className={`w-4 h-4 ${
                            isDark ? "text-slate-400" : "text-gray-600"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isDark ? "text-slate-300" : "text-gray-700"
                          }`}
                        >
                          Captured: {captureTimestamp.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          isDark
                            ? "bg-slate-700 hover:bg-slate-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        }`}
                      >
                        <RotateCcw className="w-5 h-5" />
                        Retake
                      </button>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Submit Button */}
              {imagePreview && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!image || isLoading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      image && !isLoading
                        ? isDark
                          ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                        : isDark
                        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Gallery Section */}
        <div
          className={`rounded-2xl overflow-hidden ${
            isDark ? "bg-slate-800 border border-slate-700" : "bg-white"
          } shadow-xl`}
        >
          <div
            className={`px-6 py-4 border-b ${
              isDark
                ? "border-slate-700 bg-slate-800/50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2
                className={`text-lg font-semibold flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                Captured Images
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDark ? "text-slate-400" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border transition-all ${
                      isDark
                        ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-purple-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                    }`}
                  />
                </div>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg border transition-all ${
                    isDark
                      ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-purple-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
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
                  {(searchTerm ? filteredImages : dailyStoreImages).map(
                    (img) => (
                      <div
                        key={img._id}
                        className={`group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                          isDark
                            ? "bg-slate-700 shadow-lg shadow-slate-900/50"
                            : "bg-white shadow-lg"
                        }`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={`${API_BASE_URL}${normalizeImagePath(
                              img.img
                            )}`}
                            alt="Daily Store"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={handleImageError}
                          />
                        </div>
                        <div
                          className={`p-4 ${
                            isDark ? "bg-slate-700" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <Calendar
                              className={`w-4 h-4 ${
                                isDark ? "text-slate-400" : "text-gray-400"
                              }`}
                            />
                            <span
                              className={
                                isDark ? "text-slate-300" : "text-gray-600"
                              }
                            >
                              {new Date(img.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p
                            className={`text-xs truncate ${
                              isDark ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            {img.originalName}
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <Search className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    )
                  )}
                </div>

                {totalPages > 1 && !searchTerm && (
                  <div
                    className={`mt-6 pt-6 border-t ${
                      isDark ? "border-slate-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div
                        className={`text-sm ${
                          isDark ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        Showing{" "}
                        <span className="font-semibold">{startIndex + 1}</span>{" "}
                        to{" "}
                        <span className="font-semibold">
                          {Math.min(endIndex, totalItems)}
                        </span>{" "}
                        of <span className="font-semibold">{totalItems}</span>{" "}
                        images
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-lg transition-all ${
                            currentPage === 1
                              ? isDark
                                ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : isDark
                              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
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
                                ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : isDark
                              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((page, idx) =>
                            page === "..." ? (
                              <span
                                key={`ellipsis-${idx}`}
                                className={`px-3 py-2 ${
                                  isDark ? "text-slate-400" : "text-gray-400"
                                }`}
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  currentPage === page
                                    ? isDark
                                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                                      : "bg-purple-600 text-white shadow-lg"
                                    : isDark
                                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                }`}
                              >
                                {page}
                              </button>
                            )
                          )}
                        </div>

                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-lg transition-all ${
                            currentPage === totalPages
                              ? isDark
                                ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : isDark
                              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
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
                                ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : isDark
                              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
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
                <div
                  className={`p-4 rounded-full mb-4 ${
                    isDark ? "bg-slate-700" : "bg-gray-100"
                  }`}
                >
                  <Camera
                    className={`w-12 h-12 ${
                      isDark ? "text-slate-400" : "text-gray-400"
                    }`}
                  />
                </div>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDark ? "text-slate-200" : "text-gray-800"
                  }`}
                >
                  No Images Yet
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  Capture your first store image to get started
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
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
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
              <div className="flex items-center gap-2 text-white text-sm mb-2">
                <Clock className="w-4 h-4" />
                <span>
                  Captured: {new Date(selectedImage.createdAt).toLocaleString()}
                </span>
              </div>
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

export default DailyStoreImagePage;