// ==================== dailyStoreImageService.js ====================
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

// Get all daily store images with pagination (for admin/brand owner)
const getAllDailyStoreImages = async (page = 1, limit = 10) => {
  const response = await api.get(`${DAILY_STORE_IMAGE_URL}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get daily store images for the logged-in branch owner with pagination
const getDailyStoreImagesForBranchOwner = async (page = 1, limit = 10) => {
  const response = await api.get(`${DAILY_STORE_IMAGE_URL}/my-images?page=${page}&limit=${limit}`);
  return response.data;
};

// Get daily store images for a specific branch with pagination
const getDailyStoreImagesByBranch = async (branchId, page = 1, limit = 10) => {
  const response = await api.get(`${DAILY_STORE_IMAGE_URL}/branch/${branchId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get daily store images by manager ID with pagination
const getDailyStoreImagesByManager = async (managerId, page = 1, limit = 10) => {
  const response = await api.get(`${DAILY_STORE_IMAGE_URL}/manager/${managerId}?page=${page}&limit=${limit}`);
  return response.data;
};

const dailyStoreImageService = {
  uploadDailyStoreImage,
  getDailyStoreImagesByBranch,
  getAllDailyStoreImages,
  getDailyStoreImagesForBranchOwner,
  getDailyStoreImagesByManager,
};

export default dailyStoreImageService;