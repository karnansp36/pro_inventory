import api from './api';

const PRODUCT_PAYMENT_URL = '/productpayments';

// Get product payments for a specific user by user ID
const getProductPaymentsByUserId = async (userId, page = 1, limit = 10, filters = {}) => {
  let url = `${PRODUCT_PAYMENT_URL}/user/${userId}?page=${page}&limit=${limit}`;

  // Add filters to the URL
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all' && filters[key] !== '') {
        url += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });
  }

  const response = await api.get(url);
  return response.data;
};

// Get product payments for the logged-in user
const getMyProductPayments = async (page = 1, limit = 10, filters = {}) => {
  let url = `${PRODUCT_PAYMENT_URL}/my-payments?page=${page}&limit=${limit}`;

  // Add filters to the URL
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all' && filters[key] !== '') {
        url += `&${key}=${encodeURIComponent(filters[key])}`;
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

const productPaymentService = {
  getProductPaymentsByUserId,
  getMyProductPayments,
  createProductPayment,
  updateProductPayment,
  deleteProductPayment,
};

export default productPaymentService;