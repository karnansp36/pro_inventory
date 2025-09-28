// pages/admin/UserView.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';

const UserView = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);
      } catch (e) {
        setError('Failed to load user');
      }
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!user) return <div className="p-8">User not found</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">User Details</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-2"><b>Name:</b> {user.name}</div>
        <div className="mb-2"><b>Email:</b> {user.email}</div>
        <div className="mb-2"><b>Role:</b> {user.role}</div>
      </div>
      {/* Manager/BrandOwner/BranchOwner relationships */}
      {user.role === 'Manager' && user.assignedBranchOwners?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">Assigned Branch Owners</h2>
          <ul className="list-disc ml-6">
            {user.assignedBranchOwners.map((bo) => (
              <li key={bo._id}>{bo.name} ({bo.email})</li>
            ))}
          </ul>
        </div>
      )}
      {user.role === 'BrandOwner' && user.assignedManagers?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">Assigned Managers</h2>
          <ul className="list-disc ml-6">
            {user.assignedManagers.map((mgr) => (
              <li key={mgr._id}>{mgr.name} ({mgr.email})</li>
            ))}
          </ul>
        </div>
      )}
      {user.role === 'BranchOwner' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">Assigned Manager</h2>
          <div>{user.assignedManager ? `${user.assignedManager.name} (${user.assignedManager.email})` : 'None'}</div>
          <h2 className="text-lg font-semibold mt-4 mb-2">Assigned Brand Owner</h2>
          <div>{user.assignedBrandOwner ? `${user.assignedBrandOwner.name} (${user.assignedBrandOwner.email})` : 'None'}</div>
        </div>
      )}
    </div>
  );
};

export default UserView;
