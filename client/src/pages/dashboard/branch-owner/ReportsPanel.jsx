import React from 'react';
// TODO: Implement real report generation and export
const ReportsPanel = ({ branchOwnerId }) => {
  return (
    <div className="bg-white rounded shadow p-4 mt-4">
      <h2 className="text-lg font-semibold mb-2">Reports & Performance</h2>
      <ul className="list-disc ml-6 mb-2 text-sm">
        <li>Generate daily sales summaries</li>
        <li>View performance metrics</li>
        <li>Export reports (PDF, Excel, CSV)</li>
      </ul>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Generate Report</button>
    </div>
  );
};
export default ReportsPanel;
