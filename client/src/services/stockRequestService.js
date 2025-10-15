import api from './api';

const STOCK_REQUEST_URL = '/stockrequests';

// Get all stock requests
const getStockRequests = async () => {
  const response = await api.get(STOCK_REQUEST_URL);
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

const stockRequestService = {
  getStockRequests,
  createStockRequest,
  approveStockRequest,
  updateStockRequest,
  deleteStockRequest,
  getStockRequestsByBranch: async (branchOwnerId) => {
    const response = await api.get(`/stockrequests/branch/${branchOwnerId}`);
    return response.data;
  },
};

export default stockRequestService;