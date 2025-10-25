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
  },

 getSalesByBrandOwner: async (brandOwnerId, page = 1, limit = 10, filters = {}) => {
  // Create URLSearchParams to handle proper URL encoding
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  // Add filters to the URLSearchParams
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        // Stringify objects, leave strings/numbers as is
        const value = typeof filters[key] === 'object' 
          ? JSON.stringify(filters[key])
          : filters[key];
        params.append(key, value);
      }
    });
  }

  const response = await api.get(`/sales/brandowner/${brandOwnerId}?${params.toString()}`);
  return response.data;
}
};

export default salesService;