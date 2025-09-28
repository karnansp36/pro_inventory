import React from 'react';
// TODO: Replace with real shop/profile data from API
const ShopProfile = () => {
  // Example static data
  const shop = {
    name: 'My Branch Shop',
    address: '123 Main St, City',
    owner: 'Branch Owner Name',
    email: 'branch@email.com',
    phone: '123-456-7890',
  };
  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Shop Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div><b>Name:</b> {shop.name}</div>
        <div><b>Owner:</b> {shop.owner}</div>
        <div><b>Email:</b> {shop.email}</div>
        <div><b>Phone:</b> {shop.phone}</div>
        <div className="md:col-span-2"><b>Address:</b> {shop.address}</div>
      </div>
    </div>
  );
};
export default ShopProfile;
