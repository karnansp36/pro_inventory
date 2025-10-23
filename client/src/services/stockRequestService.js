import api from './api';

const STOCK_REQUEST_URL = '/stockrequests';

// Get all stock requests with pagination and filters
const getStockRequests = async (page = 1, limit = 10, filters = {}) => {
  let url = `${STOCK_REQUEST_URL}?page=${page}&limit=${limit}`;

  // Add filters to the URL
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        url += `&${key}=${filters[key]}`;
      }
    });
  }

  const response = await api.get(url);
  return response.data;
};
// Create new stock request
const createStockRequest = async (requestData) => {
  const response = await api.post(STOCK_REQUEST_URL, requestData);
  return response.data;
};

// Approve stock request
const approveStockRequest = async (requestId) => {
  const response = await api.put(`${STOCK_REQUEST_URL}/${requestId}/approve`);
  return response.data;
};

// Update stock request
const updateStockRequest = async (id, stockRequestData) => {
  const response = await api.put(`${STOCK_REQUEST_URL}/${id}`, stockRequestData);
  return response.data;
};

// Delete stock request
const deleteStockRequest = async (requestId) => {
  const response = await api.delete(`${STOCK_REQUEST_URL}/${requestId}`);
  return response.data;
};
// Get stock requests by brand owner with pagination and filters
const getStockRequestsByBrandOwner = async (brandOwnerId, page = 1, limit = 10, filters = {}) => {
  let url = `/stockrequests/brandowner/${brandOwnerId}?page=${page}&limit=${limit}`;

  // Add filters to the URL
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key]) { // Only add filter if it has a value
        url += `&${key}=${filters[key]}`;
      }
    });
  }

  const response = await api.get(url);
  return response.data;
};
const stockRequestService = {
  getStockRequests,
  createStockRequest,
  approveStockRequest,
  updateStockRequest,
  deleteStockRequest,
  getStockRequestsByBranch: async (branchOwnerId, page, limit) => {
    const response = await api.get(`/stockrequests/branch/${branchOwnerId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  getStockRequestsByManager: async (managerId, page, limit) => {
    const response = await api.get(`/stockrequests/manager/${managerId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  getStockRequestsByBrandOwner,
};

export default stockRequestService;