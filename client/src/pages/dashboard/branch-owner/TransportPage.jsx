// pages/dashboard/branch-owner/TransportPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import TransportTable from './TransportTable';

const TransportPage = () => {
  const { branchOwnerId } = useParams();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Transport Management</h1>
        <div className="text-sm text-gray-600">
          Confirm received quantities and track shipments
        </div>
      </div>

      <TransportTable branchOwnerId={branchOwnerId} />
    </div>
  );
};

export default TransportPage;
