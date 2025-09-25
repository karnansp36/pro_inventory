import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx'; // For Excel export

function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState(''); // sales, expenses, stockrequests
  const [filters, setFilters] = useState({
    type: 'daily', // daily, weekly, monthly, custom
    branch: '',
    manager: '',
    startDate: '',
    endDate: '',
    paymentType: '', // cash, gpay, creditCard (for sales)
    expenseCategory: '', // (for expenses)
    priority: '', // (for stockrequests)
    approved: '', // (for stockrequests)
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { type, branch, manager, startDate, endDate, paymentType, expenseCategory, priority, approved } = filters;

  const fetchReports = async () => {
    if (!reportType) {
      setReports([]);
      return;
    }

    setLoading(true);
    setError(null);
    let queryParams = new URLSearchParams();
    for (const key in filters) {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    }

    try {
      const response = await fetch(`/api/reports/${reportType}?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setReports(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch reports.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && reportType) {
      fetchReports();
    }
  }, [user, reportType, filters]);

  const onChange = (e) => {
    setFilters((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setReports([]); // Clear previous reports when type changes
  };

  const handleExport = (format) => {
    if (reports.length === 0) {
      alert('No data to export.');
      return;
    }

    const filename = `${reportType}_report_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'CSV') {
      const csv = convertToCSV(reports);
      downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
    } else if (format === 'Excel') {
      const ws = XLSX.utils.json_to_sheet(reports);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } else if (format === 'PDF') {
      // For PDF, typically a backend endpoint is used to generate a proper PDF
      // For simplicity, we'll just open a new window with JSON data
      const pdfContent = JSON.stringify(reports, null, 2);
      const newWindow = window.open();
      newWindow.document.write(`<pre>${pdfContent}</pre>`);
      newWindow.document.close();
    }
  };

  const convertToCSV = (objArray) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';

    for (let index in objArray[0]) {
      row += index + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line !== '') line += ','

        line += JSON.stringify(array[i][index]);
      }
      str += line + '\r\n';
    }
    return str;
  };

  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Reports</h1>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Report Filters</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reportType">
            Select Report Type
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="reportType"
            name="reportType"
            value={reportType}
            onChange={handleReportTypeChange}
            required
          >
            <option value="">-- Select --</option>
            <option value="sales">Sales Report</option>
            <option value="expenses">Expenses Report</option>
            <option value="stockrequests">Stock Requests Report</option>
          </select>
        </div>

        {reportType && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                Time Period
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="type"
                name="type"
                value={type}
                onChange={onChange}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="branch">
                Branch
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="branch"
                type="text"
                placeholder="Branch ID"
                name="branch"
                value={branch}
                onChange={onChange}
              />
            </div>

            {(user.role === 'Admin' || user.role === 'BrandOwner') && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manager">
                  Manager
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="manager"
                  type="text"
                  placeholder="Manager ID"
                  name="manager"
                  value={manager}
                  onChange={onChange}
                />
              </div>
            )}

            {type === 'custom' && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                    Start Date
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={onChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                    End Date
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={endDate}
                    onChange={onChange}
                  />
                </div>
              </>
            )}

            {reportType === 'sales' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentType">
                  Payment Type
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="paymentType"
                  name="paymentType"
                  value={paymentType}
                  onChange={onChange}
                >
                  <option value="">All</option>
                  <option value="cash">Cash</option>
                  <option value="gpay">GPay</option>
                  <option value="creditCard">Credit Card</option>
                </select>
              </div>
            )}

            {reportType === 'expenses' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expenseCategory">
                  Expense Category
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="expenseCategory"
                  type="text"
                  placeholder="Expense Category"
                  name="expenseCategory"
                  value={expenseCategory}
                  onChange={onChange}
                />
              </div>
            )}

            {reportType === 'stockrequests' && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                    Priority
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="priority"
                    name="priority"
                    value={priority}
                    onChange={onChange}
                  >
                    <option value="">All</option>
                    <option value="Normal">Normal</option>
                    <option value="Required">Required</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="approved">
                    Approved
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="approved"
                    name="approved"
                    value={approved}
                    onChange={onChange}
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={fetchReports}
            disabled={loading || !reportType}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          <div>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => handleExport('PDF')}
              disabled={reports.length === 0}
            >
              Export PDF
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={() => handleExport('Excel')}
              disabled={reports.length === 0}
            >
              Export Excel
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleExport('CSV')}
              disabled={reports.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Generated Reports</h2>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {reports.length === 0 && !loading && !error ? (
        <p>No reports generated yet. Select a report type and filters, then click "Generate Report".</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {reports.length > 0 && Object.keys(reports[0]).map((key) => (
                  <th key={key} className="py-2 px-4 border-b">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index}>
                  {Object.values(report).map((value, i) => (
                    <td key={i} className="py-2 px-4 border-b">
                      {typeof value === 'object' && value !== null && value.name ? value.name : JSON.stringify(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Reports;