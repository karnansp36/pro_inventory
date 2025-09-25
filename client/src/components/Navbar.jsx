import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Shop Management</Link>
        <div>
          {user ? (
            <ul className="flex space-x-4">
              <li>
                <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              </li>
              {(user.role === 'Admin' || user.role === 'BrandOwner' || user.role === 'Manager' || user.role === 'BranchOwner') && (
                <li>
                  <Link to="/stockrequests" className="hover:text-gray-300">Stock Requests</Link>
                </li>
              )}
              {(user.role === 'Admin' || user.role === 'BrandOwner' || user.role === 'Manager' || user.role === 'BranchOwner') && (
                <li>
                  <Link to="/sales" className="hover:text-gray-300">Sales</Link>
                </li>
              )}
              {(user.role === 'Admin' || user.role === 'BrandOwner' || user.role === 'Manager' || user.role === 'BranchOwner') && (
                <li>
                  <Link to="/expenses" className="hover:text-gray-300">Expenses</Link>
                </li>
              )}
              {(user.role === 'Admin' || user.role === 'BrandOwner' || user.role === 'Manager' || user.role === 'BranchOwner') && (
                <li>
                  <Link to="/transport" className="hover:text-gray-300">Transport</Link>
                </li>
              )}
              {(user.role === 'Admin' || user.role === 'BrandOwner' || user.role === 'Manager') && (
                <li>
                  <Link to="/reports" className="hover:text-gray-300">Reports</Link>
                </li>
              )}
              <li>
                <button onClick={onLogout} className="hover:text-gray-300">Logout ({user.name})</button>
              </li>
            </ul>
          ) : (
            <ul className="flex space-x-4">
              <li>
                <Link to="/login" className="hover:text-gray-300">Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-gray-300">Register</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;