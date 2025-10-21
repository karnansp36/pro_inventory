import api from './api';

const salesService = {
  getSales: async (page = 1, limit = 10) => {
    const response = await api.get(`/sales?page=${page}&limit=${limit}`);
    return response.data;
  },

  createSale: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  deleteSale: async (id) => {
    const response = await api.delete(`/sales/${id}`);
    return response.data;
  },

  updateSale: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },

  getSalesByBranch: async (branchOwnerId, page = 1, limit = 10) => {
    const response = await api.get(`/sales/branch/${branchOwnerId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getSalesByManager: async (managerId, page = 1, limit = 10) => {
    const response = await api.get(`/sales/manager/${managerId}?page=${page}&limit=${limit}`);
    return response.data;
  }
};

export default salesService;