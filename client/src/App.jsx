import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StockRequests from './pages/StockRequests';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Transport from './pages/Transport';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import Navbar from './components/Navbar'; // Assuming a Navbar component will be created

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stockrequests" element={<StockRequests />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/" element={<Dashboard />} /> {/* Default route */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
