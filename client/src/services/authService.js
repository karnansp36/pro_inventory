import api from './api'; // Import the configured axios instance

const API_URL = '/auth/'; // Changed to /auth/ as per backend routes, removing duplicate /api

// Register user
const register = async (userData) => {
  const response = await api.post(API_URL + 'register', userData);
  const data = response.data;

  if (response.status === 201) {
    localStorage.setItem('token', data.token || '');
    localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
  }

  return data;
};

// Login user
const login = async (userData) => {
  const response = await api.post(API_URL + 'login', userData, { withCredentials: true });
  const data = response.data;

  if (response.status === 200) {
    localStorage.setItem('token', data.token || '');
    localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
  }

  return data;
};

// Logout user
const logout = async () => {
  await api.post(API_URL + 'logout'); // Call backend logout endpoint
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const authService = {
  register,
  login,
  logout,
};

export default authService;