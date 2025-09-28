// pages/admin/Reports.jsx
import { useState, useEffect } from 'react';
import { fetchSalesReport, fetchExpenseReport, fetchProfitLossReport } from '../../../services/reportService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Filter, Download } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });


  const [salesData, setSalesData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [profitLoss, setProfitLoss] = useState({});
  const [loading, setLoading] = useState(false);
  const [branchReports, setBranchReports] = useState([]);
  const [groupedManagers, setGroupedManagers] = useState({});

  const fetchReports = async () => {
    setLoading(true);
    try {
      const salesParams = {};
      const expenseParams = {};
      const profitLossParams = {};
      if (dateRange.start) {
        salesParams.startDate = dateRange.start;
        expenseParams.startDate = dateRange.start;
        profitLossParams.startDate = dateRange.start;
      }
      if (dateRange.end) {
        salesParams.endDate = dateRange.end;
        expenseParams.endDate = dateRange.end;
        profitLossParams.endDate = dateRange.end;
      }
      salesParams.type = 'monthly';
      expenseParams.type = 'monthly';
      profitLossParams.type = 'monthly';

      const [salesRes, expenseRes, profitLossRes] = await Promise.all([
        fetchSalesReport(salesParams),
        fetchExpenseReport(expenseParams),
        fetchProfitLossReport(profitLossParams),
      ]);

      setSalesData(
        salesRes.sales?.map((s, i) => ({
          name: s.date ? new Date(s.date).toLocaleString('default', { month: 'short' }) : `M${i+1}`,
          sales: s.total,
          expenses: expenseRes.expenses?.[i]?.amount || 0,
        })) || []
      );
      setExpenseData(
        expenseRes.expenses?.reduce((acc, exp) => {
          const found = acc.find(e => e.name === exp.category);
          if (found) found.value += exp.amount;
          else acc.push({ name: exp.category, value: exp.amount });
          return acc;
        }, []) || []
      );
      setProfitLoss(profitLossRes.summary || {});
      setBranchReports(profitLossRes.report || []);

      // Group by manager/brand owner if available
      const grouped = {};
      (profitLossRes.report || []).forEach((item) => {
        const manager = item.branchOwner?.assignedManager || 'Unassigned';
        if (!grouped[manager]) grouped[manager] = [];
        grouped[manager].push(item);
      });
      setGroupedManagers(grouped);
    } catch (e) {
      // Optionally handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive system reports and analytics</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Date Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">Date Range:</span>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <span className="self-center">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            onClick={fetchReports}
            disabled={loading}
          >
            <Filter className="h-4 w-4" />
            <span>{loading ? 'Loading...' : 'Apply Filter'}</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Expenses Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Sales vs Expenses</h3>
          <BarChart width={500} height={300} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" />
            <Bar dataKey="expenses" fill="#82ca9d" />
          </BarChart>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          <PieChart width={500} height={300}>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>

      {/* Per-Branch Profit/Loss Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Branch-wise Profit/Loss</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Branch</th>
                <th className="px-4 py-2 text-left">Manager/Brand Owner</th>
                <th className="px-4 py-2 text-right">Sales</th>
                <th className="px-4 py-2 text-right">Expenses</th>
                <th className="px-4 py-2 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {branchReports.map((item, idx) => (
                <tr key={item.branchOwner?._id || idx} className="border-t">
                  <td className="px-4 py-2">{item.branchOwner?.name || 'N/A'}</td>
                  <td className="px-4 py-2">{item.branchOwner?.assignedManager || 'N/A'}</td>
                  <td className="px-4 py-2 text-right">${item.totalSales?.toLocaleString() || 0}</td>
                  <td className="px-4 py-2 text-right">${item.totalExpenses?.toLocaleString() || 0}</td>
                  <td className="px-4 py-2 text-right">${item.netProfit?.toLocaleString() || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grouped by Manager/Brand Owner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Grouped by Manager/Brand Owner</h3>
        {Object.keys(groupedManagers).map((managerId) => (
          <div key={managerId} className="mb-4">
            <h4 className="font-semibold text-blue-700 mb-2">Manager/Brand Owner: {managerId}</h4>
            <table className="min-w-full text-sm mb-2">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Branch</th>
                  <th className="px-4 py-2 text-right">Sales</th>
                  <th className="px-4 py-2 text-right">Expenses</th>
                  <th className="px-4 py-2 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {groupedManagers[managerId].map((item, idx) => (
                  <tr key={item.branchOwner?._id || idx} className="border-t">
                    <td className="px-4 py-2">{item.branchOwner?.name || 'N/A'}</td>
                    <td className="px-4 py-2 text-right">${item.totalSales?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2 text-right">${item.totalExpenses?.toLocaleString() || 0}</td>
                    <td className="px-4 py-2 text-right">${item.netProfit?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900">Total Revenue</h4>
          <p className="text-2xl font-bold text-green-600">${profitLoss.totalSales?.toLocaleString() || 0}</p>
          <p className="text-sm text-gray-600">Total Sales</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900">Total Expenses</h4>
          <p className="text-2xl font-bold text-red-600">${profitLoss.totalExpenses?.toLocaleString() || 0}</p>
          <p className="text-sm text-gray-600">Total Expenses</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900">Net Profit</h4>
          <p className="text-2xl font-bold text-blue-600">${profitLoss.netProfit?.toLocaleString() || 0}</p>
          <p className="text-sm text-gray-600">Net Profit</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;