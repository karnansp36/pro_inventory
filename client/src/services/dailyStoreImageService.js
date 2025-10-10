import api from './api';

const DAILY_STORE_IMAGE_URL = '/daily-store-images';

// Upload daily store image
const uploadDailyStoreImage = async (imageData) => {
  const response = await api.post(DAILY_STORE_IMAGE_URL, imageData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get daily store images for a specific branch
const getDailyStoreImagesByBranch = async (branchId) => {
  const response = await api.get(`${DAILY_STORE_IMAGE_URL}/branch/${branchId}`);
  return response.data;
};

// Get all daily store images (for admin/brand owner)
const getAllDailyStoreImages = async () => {
  const response = await api.get(DAILY_STORE_IMAGE_URL);
  return response.data;
};

const dailyStoreImageService = {
  uploadDailyStoreImage,
  getDailyStoreImagesByBranch,
  getAllDailyStoreImages,
};

export default dailyStoreImageService;