import api from './api';

const transportService = {
  getTransports: async () => {
    const response = await api.get('/transport');
    return response.data;
  },

  // Updated to support pagination parameters and handle paginated response
  getTransportsByBranch: async (branchOwnerId, page = 1, limit = 10) => {
    const response = await api.get(`/transport/branch/${branchOwnerId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  createTransport: async (transportData) => {
    const response = await api.post('/transport', transportData);
    return response.data;
  },

  deleteTransport: async (id) => {
    const response = await api.delete(`/transport/${id}`);
    return response.data;
  },

  // Add update transport method
  updateTransport: async (id, transportData) => {
    const response = await api.put(`/transport/${id}`, transportData);
    return response.data;
  },

  // Add receive transport method
  receiveTransport: async (id, receivedQuantity) => {
    const response = await api.put(`/transport/${id}/receive`, { receivedQuantity });
    return response.data;
  }
};

export default transportService;