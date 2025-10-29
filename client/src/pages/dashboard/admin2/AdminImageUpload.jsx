// AdminImageUpload.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../store/slices/usersSlice';
import { Camera, Upload, X } from 'lucide-react';

const AdminImageUpload = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (file, imageType) => {
    if (!file) return;

    const formData = new FormData();
    formData.append(imageType, file);

    // Append other user data to maintain existing profile information
    if (currentUser) {
      Object.keys(currentUser).forEach(key => {
        if (key !== 'profileImage' && key !== 'bannerImage' && currentUser[key] !== undefined) {
          formData.append(key, currentUser[key]);
        }
      });
    }

    setLoading(true);
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      // Success handling - you might want to show a toast notification
    } catch (error) {
      console.error(`Failed to upload ${imageType}:`, error);
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file, 'profileImage');
    }
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file, 'bannerImage');
    }
  };

  const removeImage = async (imageType) => {
    const formData = new FormData();
    
    // Append all existing user data
    if (currentUser) {
      Object.keys(currentUser).forEach(key => {
        if (currentUser[key] !== undefined) {
          formData.append(key, currentUser[key]);
        }
      });
    }
    
    // Set the image field to empty string to remove it
    formData.append(imageType, '');

    setLoading(true);
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
    } catch (error) {
      console.error(`Failed to remove ${imageType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Image Upload */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Banner Image</h3>
        <div className="relative">
          {currentUser?.bannerImage ? (
            <div className="relative group">
              <img
                src={currentUser.bannerImage}
                alt="Banner"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  onClick={() => removeImage('bannerImage')}
                  disabled={loading}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, WEBP (MAX. 10MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleBannerImageChange}
                disabled={loading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Profile Image Upload */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Image</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {currentUser?.profileImage ? (
              <div className="relative group">
                <img
                  src={currentUser.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                  <button
                    onClick={() => removeImage('profileImage')}
                    disabled={loading}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="bg-emerald-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-emerald-600 transition-colors text-center">
              {loading ? 'Uploading...' : 'Upload Profile Image'}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleProfileImageChange}
                disabled={loading}
              />
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recommended: 500x500px, max 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImageUpload;