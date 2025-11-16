import api from './api';

const PRODUCT_PAYMENT_URL = '/productpayments';

// Get all product payments with pagination and filters
const getProductPayments = async (page = 1, limit = 10, filters = {}) => {
  let url = `${PRODUCT_PAYMENT_URL}?page=${page}&limit=${limit}`;

  // Add filters to the URL
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all' && filters[key] !== '') {
        if (key === 'dateFilter') {
          // Handle date filter object separately
          const dateFilter = filters[key];
          if (dateFilter.type && dateFilter.type !== 'all') {
            url += `&dateFilterType=${encodeURIComponent(dateFilter.type)}`;
            if (dateFilter.startDate) {
              url += `&startDate=${encodeURIComponent(dateFilter.startDate)}`;
            }
            if (dateFilter.endDate) {
              url += `&endDate=${encodeURIComponent(dateFilter.endDate)}`;
            }
          }
        } else {
          // Handle other filters
          url += `&${key}=${encodeURIComponent(filters[key])}`;
        }
      }
    });
  }

  const response = await api.get(url);
  return response.data;
};

// Create new product payment
const createProductPayment = async (paymentData) => {
  const response = await api.post(PRODUCT_PAYMENT_URL, paymentData);
  return response.data;
};

// Update product payment
const updateProductPayment = async (id, paymentData) => {
  const response = await api.put(`${PRODUCT_PAYMENT_URL}/${id}`, paymentData);
  return response.data;
};

// Delete product payment
const deleteProductPayment = async (paymentId) => {
  const response = await api.delete(`${PRODUCT_PAYMENT_URL}/${paymentId}`);
  return response.data;
};

// Get product payments by user ID
const getProductPaymentsByUserId = async (userId, page = 1, limit = 10) => {
  const response = await api.get(`${PRODUCT_PAYMENT_URL}/user/${userId}?page=${page}&limit=${limit}`);
  return response.data;
};

const productPaymentService = {
  getProductPayments,
  createProductPayment,
  updateProductPayment,
  deleteProductPayment,
  getProductPaymentsByUserId,
};

export default productPaymentService;