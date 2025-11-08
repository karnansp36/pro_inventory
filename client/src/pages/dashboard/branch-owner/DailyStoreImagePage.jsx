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
  Video,
  VideoOff,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_IMG;

const DailyStoreImagePage = () => {
  const location = useLocation();
  const { branchOwnerId } = location.state || {};
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureTimestamp, setCaptureTimestamp] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
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
    checkCameraPermission();
    
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('denied');
        return;
      }

      const permissionStatus = await navigator.permissions.query({ name: 'camera' });
      setCameraPermission(permissionStatus.state);
      
      permissionStatus.onchange = () => {
        setCameraPermission(permissionStatus.state);
      };
    } catch (error) {
      console.error("Error checking camera permission:", error);
      setCameraPermission('prompt');
    }
  };

  const getCameraConstraints = () => {
    return {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: isFrontCamera ? "user" : "environment"
      },
      audio: false,
    };
  };

  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      setCameraError(null);
      setIsLoadingCamera(true);

      if (!videoRef.current) {
        console.error("Video element reference is null");
        throw new Error("Video element not found");
      }

      if (streamRef.current) {
        stopCamera();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const constraints = getCameraConstraints();
      console.log("Requesting camera with constraints:", constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera stream obtained successfully");
      console.log("Stream tracks:", stream.getTracks().map(t => ({kind: t.kind, enabled: t.enabled, readyState: t.readyState})));

      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error("Video element lost during setup");
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Wait for video metadata to load
      await new Promise((resolve, reject) => {
        const video = videoRef.current;
        if (!video) {
          reject(new Error("Video element not found"));
          return;
        }

        let resolved = false;
        
        const timeoutId = setTimeout(() => {
          if (!resolved) {
            console.warn("Video metadata loading timeout - checking readyState");
            if (video.readyState >= 2) {
              console.log("Video is ready despite timeout");
              resolved = true;
              resolve();
            } else {
              reject(new Error("Video loading timeout after 10 seconds"));
            }
          }
        }, 10000);

        const onLoadedMetadata = () => {
          if (!resolved) {
            clearTimeout(timeoutId);
            resolved = true;
            console.log("Video metadata loaded successfully");
            console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
            console.log("Video readyState:", video.readyState);
            resolve();
          }
        };

        const onLoadedData = () => {
          if (!resolved && video.readyState >= 2) {
            clearTimeout(timeoutId);
            resolved = true;
            console.log("Video data loaded");
            resolve();
          }
        };

        const onCanPlay = () => {
          if (!resolved) {
            clearTimeout(timeoutId);
            resolved = true;
            console.log("Video can play");
            resolve();
          }
        };

        video.onloadedmetadata = onLoadedMetadata;
        video.onloadeddata = onLoadedData;
        video.oncanplay = onCanPlay;

        video.onerror = (e) => {
          if (!resolved) {
            clearTimeout(timeoutId);
            resolved = true;
            reject(new Error("Video element error: " + (e.message || "Unknown error")));
          }
        };

        // Check if already loaded
        if (video.readyState >= 2) {
          clearTimeout(timeoutId);
          resolved = true;
          console.log("Video already ready");
          resolve();
        }
      });

      // Play the video
      try {
        await videoRef.current.play();
        console.log("Video playback started successfully");
      } catch (playError) {
        console.warn("Video play() warning:", playError);
        // Continue anyway - autoplay might be restricted but stream should work
      }

      // Final verification
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        console.warn("Video dimensions are zero, waiting additional time...");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
          throw new Error("Video stream not providing valid dimensions");
        }
      }

      console.log("Camera started successfully!");
      console.log("Final video state:", {
        readyState: videoRef.current.readyState,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        paused: videoRef.current.paused
      });

      setCameraActive(true);
      setIsLoadingCamera(false);
      setCameraPermission("granted");

    } catch (error) {
      console.error("Error starting camera:", error);
      setIsLoadingCamera(false);
      handleCameraError(error);
      // Clean up on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handleCameraError = (error) => {
    let errorMessage = "Unable to access camera. Please check permissions.";
    
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        errorMessage = "Camera access denied. Please allow camera permissions in your browser settings and refresh the page.";
        setCameraPermission('denied');
        break;
      case 'NotFoundError':
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        errorMessage = "No suitable camera found. Please check if your camera is connected and try switching cameras.";
        break;
      case 'NotSupportedError':
        errorMessage = "Camera not supported in this browser. Please try using Chrome, Firefox, or Safari.";
        break;
      case 'NotReadableError':
      case 'TrackStartError':
        errorMessage = "Camera is already in use by another application. Please close other apps using the camera.";
        break;
      default:
        errorMessage = `Unable to access camera: ${error.message || 'Unknown error'}`;
    }
    
    setCameraError(errorMessage);
    toast.error(errorMessage);
    setCameraActive(false);
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onerror = null;
      try {
        videoRef.current.pause();
      } catch (e) {
        console.warn("Error pausing video:", e);
      }
    }
    setCameraActive(false);
    setCameraError(null);
    setIsLoadingCamera(false);
  };

  const switchCamera = async () => {
    console.log("Switching camera...");
    const wasCameraActive = cameraActive;
    
    setIsFrontCamera(prev => !prev);
    
    if (wasCameraActive) {
      stopCamera();
      await new Promise(resolve => setTimeout(resolve, 200));
      await startCamera();
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    console.log("Capture button clicked");
    console.log("Video element:", video);
    console.log("Canvas element:", canvas);
    
    if (!video || !canvas) {
      console.error("Missing video or canvas element");
      toast.error("Camera not ready. Please try again.");
      return;
    }

    console.log("Video state:", {
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      paused: video.paused,
      srcObject: video.srcObject,
      currentTime: video.currentTime
    });

    if (video.readyState < 2) {
      console.error("Video readyState is too low:", video.readyState);
      toast.error("Camera is still loading. Please wait a moment and try again.");
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("Video dimensions are zero");
      toast.error("Camera not ready. Please wait a moment and try again.");
      return;
    }

    console.log("Capturing image with dimensions:", video.videoWidth, "x", video.videoHeight);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      console.log("Image drawn to canvas successfully");
    } catch (drawError) {
      console.error("Error drawing to canvas:", drawError);
      toast.error("Failed to capture image. Please try again.");
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleString();
    
    context.font = "bold 20px Arial";
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(10, canvas.height - 40, context.measureText(timestamp).width + 20, 30);
    
    context.fillStyle = "white";
    context.fillText(timestamp, 20, canvas.height - 15);

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to create blob from canvas");
        toast.error("Failed to capture image. Please try again.");
        return;
      }
      
      console.log("Image blob created successfully, size:", blob.size);
      
      const file = new File([blob], `store-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setImage(file);
      setImagePreview(canvas.toDataURL("image/jpeg"));
      setCaptureTimestamp(now);
      stopCamera();
      toast.success("Image captured successfully!");
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

  const checkCameraAvailability = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log("Available video devices:", videoDevices);
      
      if (videoDevices.length === 0) {
        setCameraError("No camera found on this device.");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Camera availability check failed:", error);
      return false;
    }
  };

  const handleOpenCamera = async () => {
    console.log("Opening camera...");
    const isAvailable = await checkCameraAvailability();
    if (isAvailable) {
      await startCamera();
    } else {
      toast.error("Camera not available on this device.");
    }
  };

  const retryCamera = async () => {
    console.log("Retrying camera...");
    setCameraError(null);
    await handleOpenCamera();
  };

  const renderPermissionDenied = () => (
    <div className="text-center p-8">
      <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold">Camera Access Denied</span>
        </div>
        <p className="text-sm mb-3">
          Camera permissions have been blocked. Please follow these steps to enable camera access:
        </p>
        <ol className="text-sm text-left space-y-2 mb-4">
          <li>1. Click the camera icon in your browser's address bar</li>
          <li>2. Allow camera permissions for this site</li>
          <li>3. Refresh the page and try again</li>
        </ol>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Page
        </button>
      </div>
    </div>
  );

  const renderPermissionPrompt = () => (
    <div className="text-center p-8">
      <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Camera className="w-5 h-5" />
          <span className="font-semibold">Camera Access Required</span>
        </div>
        <p className="text-sm mb-4">
          This feature requires camera access. When prompted, please allow camera permissions to continue.
        </p>
      </div>
      <button
        type="button"
        onClick={handleOpenCamera}
        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 mx-auto ${
          isDark
            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30"
            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
        }`}
      >
        <Camera className="w-5 h-5" />
        Allow Camera Access
      </button>
    </div>
  );

  const renderCameraReady = () => (
    <div className="flex flex-col items-center justify-center p-12">
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
        onClick={handleOpenCamera}
        disabled={isLoadingCamera}
        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
          isLoadingCamera
            ? "bg-gray-400 cursor-not-allowed"
            : isDark
            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30"
            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
        }`}
      >
        {isLoadingCamera ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Starting Camera...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Open Camera
          </>
        )}
      </button>
      
      <div className="mt-6 text-center">
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"} mb-3`}>
          Tips for best results:
        </p>
        <ul className={`text-xs ${isDark ? "text-slate-500" : "text-gray-400"} space-y-1`}>
          <li>• Ensure good lighting in your store</li>
          <li>• Hold the camera steady while capturing</li>
          <li>• Capture the entire store area</li>
          <li>• Make sure the timestamp is visible</li>
        </ul>
      </div>
    </div>
  );

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
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto space-y-6">
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
              <div className="relative rounded-2xl overflow-hidden bg-black min-h-[400px]">
                {/* Always render video element to maintain ref */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    minHeight: '400px', 
                    display: cameraActive ? 'block' : 'none',
                    backgroundColor: '#000',
                    objectFit: 'cover'
                  }}
                />
                
                {cameraActive && (
                  <>
                    {isLoadingCamera && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="text-white text-center">
                          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p>Starting camera...</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4 flex-wrap">
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-lg flex items-center gap-2"
                      >
                        <VideoOff className="w-5 h-5" />
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={switchCamera}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors shadow-lg flex items-center gap-2"
                      >
                        <Video className="w-5 h-5" />
                        Switch
                      </button>
                      <button
                        type="button"
                        onClick={captureImage}
                        disabled={isLoadingCamera}
                        className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-xl font-semibold transition-colors shadow-lg flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Camera className="w-5 h-5" />
                        Capture
                      </button>
                    </div>
                    
                    <div className="absolute top-4 left-4 px-4 py-2 bg-black/70 text-white rounded-lg flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 text-white rounded-lg text-sm">
                      {isFrontCamera ? "Front Camera" : "Rear Camera"}
                    </div>
                  </>
                )}
                
                {!cameraActive && imagePreview ? (
                  <div className="space-y-4 p-4">
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
                ) : !cameraActive && cameraError ? (
                  <div className="text-center p-8">
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-md mx-auto">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Camera Error</span>
                      </div>
                      <p className="text-sm mb-3">{cameraError}</p>
                      <button
                        type="button"
                        onClick={retryCamera}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors mx-auto"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : !cameraActive && cameraPermission === 'denied' ? (
                  renderPermissionDenied()
                ) : !cameraActive && cameraPermission === 'prompt' ? (
                  renderPermissionPrompt()
                ) : !cameraActive ? (
                  renderCameraReady()
                ) : null}

                <canvas ref={canvasRef} className="hidden" />
              </div>

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
                        <Loader2 className="w-5 h-5 animate-spin" />
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