import api from './api';

const transportService = {
  getTransports: async () => {
    const response = await api.get('/transport');
    return response.data;
  },

  getTransportsByBranch: async (branchOwnerId, page = 1, limit = 10) => {
    const response = await api.get(`/transport/branch/${branchOwnerId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Updated to support pagination and filters
  getTransportsByManager: async (managerId, page = 1, limit = 10, filters = {}) => {
    let url = `/transport/manager/${managerId}?page=${page}&limit=${limit}`;
    
    // Add filters to query params
    if (filters.status && filters.status !== 'all') {
      url += `&status=${filters.status}`;
    }
    if (filters.searchTerm) {
      url += `&search=${filters.searchTerm}`;
    }
    if (filters.branchId) {
      url += `&branchId=${filters.branchId}`;
    }
    if (filters.dateFilter && filters.dateFilter.type !== 'all') {
      url += `&dateFilter=${filters.dateFilter.type}`;
      if (filters.dateFilter.startDate) {
        url += `&startDate=${filters.dateFilter.startDate}`;
      }
      if (filters.dateFilter.endDate) {
        url += `&endDate=${filters.dateFilter.endDate}`;
      }
    }

    const response = await api.get(url);
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

  updateTransport: async (id, transportData) => {
    const response = await api.put(`/transport/${id}`, transportData);
    return response.data;
  },

  receiveTransport: async (id, receivedQuantity) => {
    const response = await api.put(`/transport/${id}/receive`, { receivedQuantity });
    return response.data;
  }
};

export default transportService;