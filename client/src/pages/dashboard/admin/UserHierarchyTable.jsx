import api from '../../../services/api';
import { useState, useEffect } from 'react';

export default function UserHierarchyTable({ userId, onClose }) {
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHierarchy() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/users/hierarchy');
        setHierarchy(res.data);
      } catch (e) {
        setError('Failed to load hierarchy');
      }
      setLoading(false);
    }
    fetchHierarchy();
  }, [userId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!hierarchy) return <div className="p-4">No hierarchy data</div>;

  // Find the user in the hierarchy
  let userNode = null;
  function findUser(node) {
    if (!node) return null;
    if (Array.isArray(node)) {
      for (const n of node) {
        const found = findUser(n);
        if (found) return found;
      }
    } else if (node._id === userId) {
      return node;
    } else if (node.managers) {
      for (const mgr of node.managers) {
        const found = findUser(mgr);
        if (found) return found;
      }
    } else if (node.branchOwners) {
      for (const bo of node.branchOwners) {
        const found = findUser(bo);
        if (found) return found;
      }
    }
    return null;
  }
  userNode = findUser(hierarchy);

  if (!userNode) return <div className="p-4">User not found in hierarchy</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">User Hierarchy</h2>
        {onClose && <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>}
      </div>
      <div className="mb-2"><b>Name:</b> {userNode.name}</div>
      <div className="mb-2"><b>Email:</b> {userNode.email}</div>
      {userNode.managers && (
        <div className="mb-4">
          <h3 className="font-semibold">Managers</h3>
          <table className="min-w-full text-sm border">
            <thead><tr><th className="border px-2 py-1">Name</th><th className="border px-2 py-1">Email</th></tr></thead>
            <tbody>
              {userNode.managers.map(mgr => (
                <tr key={mgr._id}><td className="border px-2 py-1">{mgr.name}</td><td className="border px-2 py-1">{mgr.email}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {userNode.branchOwners && (
        <div className="mb-4">
          <h3 className="font-semibold">Branch Owners</h3>
          <table className="min-w-full text-sm border">
            <thead><tr><th className="border px-2 py-1">Name</th><th className="border px-2 py-1">Email</th></tr></thead>
            <tbody>
              {userNode.branchOwners.map(bo => (
                <tr key={bo._id}><td className="border px-2 py-1">{bo.name}</td><td className="border px-2 py-1">{bo.email}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
