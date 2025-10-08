import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logout, registerUser } from '../store/slices/authSlice'; // Assuming registerUser exists or will be added

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Navigation will be handled by App.jsx based on Redux state
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await dispatch(registerUser(userData)).unwrap(); // Assuming registerUser thunk exists
      // Navigation will be handled by App.jsx based on Redux state
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};