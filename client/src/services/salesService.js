import api from './api';

const salesService = {
  getSales: async () => {
    const response = await api.get('/api/sales');
    return response.data;
  },
  createSales: async (salesData) => {
    const response = await api.post('/api/sales', salesData);
    return response.data;
  },
  deleteSales: async (id) => {
    const response = await api.delete(`/api/sales/${id}`);
    return response.data;
  },
};

export default salesService;