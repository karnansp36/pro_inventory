import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'BranchOwner', // Default role
    assignedManager: '', // Optional for BranchOwner
    assignedBranchOwners: [], // Optional for BrandOwner
  });

  const { name, email, password, password2, role, assignedManager, assignedBranchOwners } = formData;

  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (password !== password2) {
      console.error('Passwords do not match');
    } else {
      // Handle registration logic here
      console.log('Registration submitted:', formData);
      navigate('/login'); // Redirect to login after registration
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Register a new account</h3>
        <form onSubmit={onSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="name">Name</label>
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="password2">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="password2"
                name="password2"
                value={password2}
                onChange={onChange}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="role">Role</label>
              <select
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                id="role"
                name="role"
                value={role}
                onChange={onChange}
                required
              >
                <option value="BranchOwner">Branch Owner</option>
                <option value="Manager">Manager</option>
                <option value="BrandOwner">Brand Owner</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            {role === 'BranchOwner' && (
              <div className="mt-4">
                <label className="block" htmlFor="assignedManager">Assigned Manager (Optional)</label>
                <input
                  type="text"
                  placeholder="Manager ID"
                  className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                  id="assignedManager"
                  name="assignedManager"
                  value={assignedManager}
                  onChange={onChange}
                />
              </div>
            )}
            {role === 'BrandOwner' && (
              <div className="mt-4">
                <label className="block" htmlFor="assignedBranchOwners">Assigned Branch Owners (Comma separated IDs, Optional)</label>
                <input
                  type="text"
                  placeholder="Branch Owner IDs"
                  className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                  id="assignedBranchOwners"
                  name="assignedBranchOwners"
                  value={assignedBranchOwners}
                  onChange={(e) => setFormData(prevState => ({ ...prevState, assignedBranchOwners: e.target.value.split(',').map(id => id.trim()) }))}
                />
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Register</button>
              <Link to="/login" className="text-sm text-blue-600 hover:underline">Already have an account? Login</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;