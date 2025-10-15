// services/api.js
import axios from 'axios'

const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If the error is 401 (Unauthorized) and it's not a retry yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried
      try {
        const response = await axios.post(`${API_URL}/users/refresh-token`, {}, { withCredentials: true });
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

export default api