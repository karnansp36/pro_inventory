import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDailyStoreImages, reset } from '../../../../src/store/slices/dailyStoreImageSlice';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';

const DailyStoreImageManagerPage = () => {
  const dispatch = useDispatch();
  const { dailyStoreImages, isLoading, isError, message } = useSelector(
    (state) => state.dailyStoreImages
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    dispatch(getAllDailyStoreImages());

    return () => {
      dispatch(reset());
    };
  }, [isError, message, dispatch]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daily Store Images (Manager View)</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Uploaded Images</h2>
        {dailyStoreImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyStoreImages.map((img) => (
              <div key={img._id} className="border rounded-lg overflow-hidden shadow-sm">
                <img
                  src={`http://localhost:5000/${img.img}`} // Adjust path as needed
                  alt="Daily Store"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600">Branch: {img.branch ? img.branch.name : 'N/A'}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(img.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Time: {img.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default DailyStoreImageManagerPage;