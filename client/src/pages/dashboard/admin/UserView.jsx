// pages/admin/UserView.jsx
import { useEffect, useState } from 'react';
import api from '../../../services/api';

const UserView = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // Default active tab

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
      } catch (e) {
        setError('Failed to load user');
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!user) return <div className="p-8">User not found</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Details: {user.name}</h1>
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-2"><b>Name:</b> {user.name}</div>
        <div className="mb-2"><b>Email:</b> {user.email}</div>
        <div className="mb-2"><b>Role:</b> {user.role}</div>
      </div>

      {/* Tabs for role-specific details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('details')}
              className={`${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              General Details
            </button>
            {user.role === 'BranchOwner' && (
              <button
                onClick={() => setActiveTab('shopDetails')}
                className={`${
                  activeTab === 'shopDetails'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Shop Details
              </button>
            )}
            {user.role === 'Manager' && (
              <button
                onClick={() => setActiveTab('managerDetails')}
                className={`${
                  activeTab === 'managerDetails'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Manager Details
              </button>
            )}
            {user.role === 'BrandOwner' && (
              <button
                onClick={() => setActiveTab('brandOwnerDetails')}
                className={`${
                  activeTab === 'brandOwnerDetails'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Brand Owner Details
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {user.assignedManager && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Assigned Manager</h3>
                  <p>{user.assignedManager.name} ({user.assignedManager.email})</p>
                </div>
              )}
              {user.assignedBrandOwner && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Assigned Brand Owner</h3>
                  <p>{user.assignedBrandOwner.name} ({user.assignedBrandOwner.email})</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shopDetails' && user.role === 'BranchOwner' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Shop Details</h2>
              <p>This section would typically display details like shop name, location, contact information, etc.</p>
              <p className="text-gray-600 mt-2">
                To display sales, transport, and transaction details, additional API endpoints and components would be needed to fetch and render that specific data for this Branch Owner.
              </p>
            </div>
          )}

          {activeTab === 'managerDetails' && user.role === 'Manager' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Assigned Branch Owners</h2>
              {user.assignedBranchOwners && user.assignedBranchOwners.length > 0 ? (
                <ul className="list-disc ml-6">
                  {user.assignedBranchOwners.map((bo) => (
                    <li key={bo._id}>{bo.name} ({bo.email})</li>
                  ))}
                </ul>
              ) : (
                <p>No Branch Owners assigned.</p>
              )}
            </div>
          )}

          {activeTab === 'brandOwnerDetails' && user.role === 'BrandOwner' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-2">Assigned Managers</h2>
              {user.assignedManagers && user.assignedManagers.length > 0 ? (
                <ul className="list-disc ml-6">
                  {user.assignedManagers.map((mgr) => (
                    <li key={mgr._id}>
                      {mgr.name} ({mgr.email})
                      {mgr.assignedBranchOwners && mgr.assignedBranchOwners.length > 0 && (
                        <ul className="list-circle ml-6">
                          {mgr.assignedBranchOwners.map((bo) => (
                            <li key={bo._id}>{bo.name} ({bo.email})</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No Managers assigned.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserView;
