// pages/admin/UserView.jsx
import { useEffect, useState } from 'react';
import api from '../../../services/api';

const UserView = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // Default active tab
  const [showAddManager, setShowAddManager] = useState(false);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [selectedManagerIds, setSelectedManagerIds] = useState([]);
  const [showAssignBranches, setShowAssignBranches] = useState(false);
  const [assigningManager, setAssigningManager] = useState(null);
  const [availableBranchOwners, setAvailableBranchOwners] = useState([]);
  const [selectedBranchOwnerIds, setSelectedBranchOwnerIds] = useState([]);

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

  const refreshUser = async () => {
    try {
      const res = await api.get(`/users/${userId}`);
      setUser(res.data);
    } catch (e) {
      // ignore
    }
  };

  const openAssignManagers = async () => {
    // Pre-select current assigned managers and fetch available managers
    const currentAssigned = (user.assignedManagers || []).map(m => (typeof m === 'string' || typeof m === 'number') ? m : m._id);
    setSelectedManagerIds(currentAssigned);
    try {
      const res = await api.get('/users/role/Manager');
      setAvailableManagers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch managers', err);
      setAvailableManagers([]);
    }
    setShowAddManager(true);
  };

  const toggleManagerSelection = (id) => {
    setSelectedManagerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssignManagersSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update brand owner's assignedManagers
      await api.put(`/users/${user._id}`, { assignedManagers: selectedManagerIds });

      // Update each manager's assignedBrandOwner: set to this brand owner for selected managers
      // and unset for managers previously assigned but now removed
      const prevAssigned = (user.assignedManagers || []).map(m => (typeof m === 'string' || typeof m === 'number') ? m : m._id);
      const toAssign = selectedManagerIds.filter(id => !prevAssigned.includes(id));
      const toUnassign = prevAssigned.filter(id => !selectedManagerIds.includes(id));

      await Promise.all(
        toAssign.map(id => api.put(`/users/${id}`, { assignedBrandOwner: user._id }))
      );
      await Promise.all(
        toUnassign.map(id => api.put(`/users/${id}`, { assignedBrandOwner: null }))
      );

      setShowAddManager(false);
      await refreshUser();
    } catch (err) {
      console.error('Failed to assign managers', err);
      alert(err.response?.data?.message || 'Failed to assign managers');
    }
  };

  const openAssignBranches = async (manager) => {
    try {
      let mgrObj = manager;
      // manager may be an id string (if API returned populated with ids) or an object
      if (!manager || (typeof manager === 'string') || !manager._id) {
        const id = typeof manager === 'string' ? manager : manager?._id || manager?.id;
        if (!id) {
          console.error('Invalid manager provided to openAssignBranches', manager);
          return;
        }
        const mgrRes = await api.get(`/users/${id}`);
        mgrObj = mgrRes.data;
      }

      setAssigningManager(mgrObj);
      setSelectedBranchOwnerIds(mgrObj.assignedBranchOwners ? mgrObj.assignedBranchOwners.map(b => b._id || b) : []);

      const res = await api.get('/users/role/BranchOwner');
      setAvailableBranchOwners(res.data || []);
      setShowAssignBranches(true);
    } catch (err) {
      console.error('Failed to open assign branches', err);
      setAvailableBranchOwners([]);
    }
  };

  const toggleBranchSelection = (id) => {
    setSelectedBranchOwnerIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssignBranchesSubmit = async (e) => {
    e.preventDefault();
    if (!assigningManager) return;
    try {
      const managerId = assigningManager._id || assigningManager.id || assigningManager;
      if (!managerId) throw new Error('Manager id not found');
      // Update manager's assignedBranchOwners via PUT /users/:id
      await api.put(`/users/${managerId}`, {
        assignedBranchOwners: selectedBranchOwnerIds,
      });
      setShowAssignBranches(false);
      setAssigningManager(null);
      await refreshUser();
    } catch (err) {
      console.error('Failed to assign branches', err);
      alert(err.response?.data?.message || 'Failed to assign branches');
    }
  };

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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Owner</th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {user.assignedBranchOwners.map((bo) => (
                        <tr key={bo._id}>
                          <td className="px-6 py-4 whitespace-nowrap">{bo.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{bo.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{bo.assignedManager?.name || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{bo.assignedBrandOwner?.name || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(`/users/${bo._id}`, { assignedManager: null });
                                  await refreshUser();
                                } catch (err) {
                                  console.error('Failed to unassign branch', err);
                                  alert(err.response?.data?.message || 'Failed to unassign branch');
                                }
                              }}
                              className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded"
                            >
                              Unassign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No Branch Owners assigned.</p>
              )}
            </div>
          )}

          {activeTab === 'brandOwnerDetails' && user.role === 'BrandOwner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold mb-2">Assigned Managers</h2>
                <button
                  onClick={() => openAssignManagers()}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Assign Existing Managers
                </button>
              </div>
              {user.assignedManagers && user.assignedManagers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branches</th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {user.assignedManagers.map((mgr) => (
                        <tr key={mgr._id || mgr}>
                          <td className="px-6 py-4 whitespace-nowrap">{mgr.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{mgr.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{(mgr.assignedBranchOwners && mgr.assignedBranchOwners.length) || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openAssignBranches(mgr)}
                                className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded"
                              >
                                View / Edit Branches
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No Managers assigned.</p>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Add Manager Modal */}
      {showAddManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Assign Existing Managers</h2>
            <form onSubmit={handleAssignManagersSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {availableManagers.map((mgr) => (
                  <label key={mgr._id} className="flex items-center space-x-2 p-2 border rounded">
                    <input type="checkbox" checked={selectedManagerIds.includes(mgr._id)} onChange={() => toggleManagerSelection(mgr._id)} />
                    <span>{mgr.name} ({mgr.email})</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowAddManager(false)} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Branches Modal */}
      {showAssignBranches && assigningManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Assign Branch Owners to {assigningManager.name}</h2>
            <form onSubmit={handleAssignBranchesSubmit} className="space-y-3">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Owner</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableBranchOwners.map((bo) => (
                      <tr key={bo._id}>
                        <td className="px-4 py-2">
                          <input type="checkbox" checked={selectedBranchOwnerIds.includes(bo._id)} onChange={() => toggleBranchSelection(bo._id)} />
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">{bo.name}</td>
                        <td className="px-6 py-2 whitespace-nowrap">{bo.email}</td>
                        <td className="px-6 py-2 whitespace-nowrap">{bo.assignedBrandOwner?.name || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setShowAssignBranches(false); setAssigningManager(null); }} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Save Assignments</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserView;
