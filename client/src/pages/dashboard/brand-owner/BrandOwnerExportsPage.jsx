// client/src/pages/dashboard/brand-owner/BrandOwnerExportsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getExportOptions, generateExport } from '../../../store/slices/exportSlice';
import { Download, FileText, Table, BarChart } from 'lucide-react';

const BrandOwnerExportsPage = () => {
  const dispatch = useDispatch();
  const { exportOptions, loading, error } = useSelector((state) => state.exports);
  const [selectedType, setSelectedType] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    dispatch(getExportOptions());
  }, [dispatch]);

  const handleGenerateExport = () => {
    if (!selectedType || !selectedFormat) {
      alert('Please select both an export type and format.');
      return;
    }
    dispatch(generateExport({ type: selectedType, format: selectedFormat, startDate, endDate }));
  };

  if (loading) return <div className="p-8">Loading export options...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
          <p className="text-gray-600">Generate reports and data exports for your business unit</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Export Options</h2>
        
        <div>
          <label htmlFor="exportType" className="block text-sm font-medium text-gray-700 mb-1">
            Select Data Type
          </label>
          <select
            id="exportType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select --</option>
            {exportOptions?.types?.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="exportFormat" className="block text-sm font-medium text-gray-700 mb-1">
            Select Format
          </label>
          <select
            id="exportFormat"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select --</option>
            {exportOptions?.formats?.map((format) => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateExport}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>Generate Export</span>
        </button>
      </div>
    </div>
  );
};

export default BrandOwnerExportsPage;