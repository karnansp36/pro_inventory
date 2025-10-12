import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDailyStoreImage, getDailyStoreImagesForBranchOwner, reset } from '../../../../src/store/slices/dailyStoreImageSlice';
import { toast } from 'react-toastify';
import Spinner from '../../../../src/components/Spinner';

const DailyStoreImagePage = () => {
  const [image, setImage] = useState(null);

  const dispatch = useDispatch();
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

  // Debugging log for dailyStoreImages
  useEffect(() => {
    console.log('Daily Store Images from Redux:', dailyStoreImages);
  }, [dailyStoreImages]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
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
        dispatch(getDailyStoreImagesForBranchOwner()); // Refresh images
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daily Store Images</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
              Image
            </label>
            <input
              type="file"
              id="image"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Upload Image
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Uploaded Images</h2>
        {dailyStoreImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyStoreImages.map((img) => (
              <div key={img._id} className="border rounded-lg overflow-hidden shadow-sm">
                <img
                  src={`http://localhost:5000${img.img.startsWith('/') ? img.img : '/' + img.img}`}
                  alt="Daily Store"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.error('Failed to load image:', img.img);
                    e.target.src = '/placeholder-image.jpg'; // Fallback image
                  }}
                />
                <div className="p-4">
                  <p className="text-sm text-gray-600">
                    Uploaded At: {new Date(img.createdAt).toLocaleString()}
                  </p>
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

export default DailyStoreImagePage;