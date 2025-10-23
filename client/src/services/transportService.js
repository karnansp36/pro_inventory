import api from './api';

const TRANSPORT_URL = '/transport';

// Get all transports
const getTransports = async () => {
  const response = await api.get(TRANSPORT_URL);
  return response.data;
};

// Get transports by branch owner ID with pagination
const getTransportsByBranch = async (branchOwnerId, page = 1, limit = 10) => {
  const response = await api.get(`${TRANSPORT_URL}/branch/${branchOwnerId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get transports by manager ID with pagination (matching stockRequest pattern)
const getTransportsByManager = async (managerId, page = 1, limit = 10) => {
  const response = await api.get(`${TRANSPORT_URL}/manager/${managerId}?page=${page}&limit=${limit}`);
  return response.data;
};

// Create new transport
const createTransport = async (transportData) => {
  const response = await api.post(TRANSPORT_URL, transportData);
  return response.data;
};

// Update transport
const updateTransport = async (id, transportData) => {
  const response = await api.put(`${TRANSPORT_URL}/${id}`, transportData);
  return response.data;
};

// Receive/confirm transport
const receiveTransport = async (id, receivedQuantity) => {
  const response = await api.put(`${TRANSPORT_URL}/${id}/receive`, { receivedQuantity });
  return response.data;
};

// Delete transport
const deleteTransport = async (id) => {
  const response = await api.delete(`${TRANSPORT_URL}/${id}`);
  return response.data;
};


// Get transports by brand owner ID with pagination and filters
const getTransportsByBrandOwner = async (brandOwnerId, page = 1, limit = 10, filters = {}) => {
  let url = `${TRANSPORT_URL}/brandowner/${brandOwnerId}?page=${page}&limit=${limit}`;

  // Add filters to the URL
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') { // Only add filter if it has a value and not 'all'
        url += `&${key}=${filters[key]}`;
      }
    });
  }

  const response = await api.get(url);
  return response.data;
};

const transportService = {
  getTransports,
  getTransportsByBranch,
  getTransportsByManager,
  createTransport,
  updateTransport,
  receiveTransport,
  deleteTransport,
  getTransportsByBrandOwner,
};

export default transportService;