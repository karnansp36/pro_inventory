// utils/api.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // If the error is 401 (Unauthorized) and it's not a retry yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried
      try {
        const response = await axios.post(`${api.defaults.baseURL}/users/refresh-token`, {}, { withCredentials: true });
        const { token } = response.data;
        localStorage.setItem('token', token); // Store new access token
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Update default header
        originalRequest.headers['Authorization'] = `Bearer ${token}`; // Update header for original request
        return api(originalRequest); // Retry original request with new token
      } catch (refreshError) {
        // If refresh token fails, clear all tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Assuming 'user' is also stored in localStorage
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    // For any other error, or if it's a 401 after a retry, reject the promise
    return Promise.reject(error);
  }
);

export default api;