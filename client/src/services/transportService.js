import api from './api';

const transportService = {
  getTransports: async () => {
    const response = await api.get('/transports');
    return response.data;
  },
  getTransportsByBranch: async (branchOwnerId) => {
    const response = await api.get(`/transports/branch/${branchOwnerId}`);
    return response.data;
  },
  createTransport: async (transportData) => {
    const response = await api.post('/transports', transportData);
    return response.data;
  },
  deleteTransport: async (id) => {
    const response = await api.delete(`/transports/${id}`);
    return response.data;
  },
};

export default transportService;