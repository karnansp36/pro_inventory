import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDailyStoreImages, reset } from '../../../../src/store/slices/dailyStoreImageSlice';
import { toast } from 'react-toastify';
import { Image, Calendar, User, ImageOff } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import Spinner from '../../../../src/components/Spinner';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_IMG;

const DailyStoreImageAdminPage = ({ branchOwnerId }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { dailyStoreImages, isLoading, isError, message } = useSelector(
    (state) => state.dailyStoreImages
  );

  useEffect(() => {
    dispatch(getAllDailyStoreImages());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]); // Added dispatch to dependency array for correctness

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className={`p-6 lg:p-8 rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-slate-800/50 shadow-slate-900/50'
          : 'bg-gradient-to-r from-white via-gray-50 to-white border-gray-200 shadow-gray-200/50'
      }`}>
        <div className="space-y-1">
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
            theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
          }`}>
            Daily Store Images
          </h1>
          <p className={`text-sm sm:text-base ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
          }`}>
            View all uploaded store images from branch owners
          </p>
        </div>
      </div>

      {/* Statistics Card */}
      <div className={`p-6 rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Total Images Uploaded
            </p>
            <p className={`text-3xl font-bold mt-2 ${
              theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
            }`}>
              {dailyStoreImages.length}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
          }`}>
            <Image className={`h-8 w-8 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className={`p-6 lg:p-8 rounded-2xl border shadow-lg ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800/50'
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${
          theme === 'dark' ? 'text-slate-100' : 'text-gray-900'
        }`}>
          All Uploaded Images
        </h2>
        
        {dailyStoreImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dailyStoreImages
              .filter(img => !branchOwnerId || (img.branchOwner && img.branchOwner._id === branchOwnerId))
              .map((img) => (
                <div
                  key={img._id}
                  className={`group rounded-2xl border overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700/50'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                    <img
                      src={`${API_BASE_URL}${img.img.startsWith('/') ? img.img : '/' + img.img}`}
                      alt="Daily Store"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        console.error('Failed to load image:', img.img);
                        e.target.src = '/placeholder-image.jpg'; // Fallback image
                      }}
                    />
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Info Section */}
                  <div className="p-5 space-y-3">
                    {/* Branch Owner */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
                      }`}>
                        <User className={`h-4 w-4 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          Branch Owner
                        </p>
                        <p className={`text-sm font-semibold truncate ${
                          theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                        }`}>
                          {img.branchOwner ? img.branchOwner.name : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Upload Date */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
                      }`}>
                        <Calendar className={`h-4 w-4 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          Uploaded At
                        </p>
                        <p className={`text-sm font-semibold ${
                          theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
                        }`}>
                          {new Date(img.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          {new Date(img.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className={`p-6 rounded-2xl mb-6 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
            }`}>
              <ImageOff className={`h-16 w-16 ${
                theme === 'dark' ? 'text-slate-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
            }`}>
              No Images Uploaded Yet
            </h3>
            <p className={`text-sm text-center max-w-md ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-500'
            }`}>
              Branch owners haven't uploaded any daily store images yet. Check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyStoreImageAdminPage;