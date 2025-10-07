import React, { useEffect, useState } from 'react';
import api from '../../../services/api';

const ShopProfile = ({ branchOwnerId }) => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopProfile = async () => {
      try {
        const res = await api.get(`/users/${branchOwnerId}`);
        setShop(res.data);
      } catch (e) {
        setError('Failed to load shop profile');
      }
      setLoading(false);
    };

    fetchShopProfile();
  }, [branchOwnerId]);

  if (loading) return <div className="p-4">Loading shop profile...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!shop) return <div className="p-4">Shop profile not found</div>;

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Shop Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div><b>Name:</b> {shop.name}</div>
        <div><b>Owner:</b> {shop.name}</div>
        <div><b>Email:</b> {shop.email}</div>
        <div><b>Phone:</b> {shop.phone || 'N/A'}</div>
        <div className="md:col-span-2"><b>Address:</b> {shop.address || 'N/A'}</div>
      </div>
    </div>
  );
};

export default ShopProfile;
