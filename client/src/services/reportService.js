import api from './api';

export const fetchSalesReport = async (params) => {
  const response = await api.get('/reports/sales', { params });
  return response.data;
};

export const fetchExpenseReport = async (params) => {
  const response = await api.get('/reports/expenses', { params });
  return response.data;
};

export const fetchProfitLossReport = async (params) => {
  const response = await api.get('/reports/profit-loss', { params });
  return response.data;
};
