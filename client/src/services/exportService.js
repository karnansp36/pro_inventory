import api from './api';

export const exportSales = (format, params = {}) => {
  let url = `/export/sales/${format.toLowerCase()}`;
  return api.get(url, { params, responseType: 'blob' });
};

export const exportExpenses = (format, params = {}) => {
  let url = `/export/expenses/${format.toLowerCase()}`;
  return api.get(url, { params, responseType: 'blob' });
};

export const exportStockRequests = (format, params = {}) => {
  let url = `/export/stockrequests/${format.toLowerCase()}`;
  return api.get(url, { params, responseType: 'blob' });
};

export const exportTransport = (format, params = {}) => {
  let url = `/export/transport/${format.toLowerCase()}`;
  return api.get(url, { params, responseType: 'blob' });
};
