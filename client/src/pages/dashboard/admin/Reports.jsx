// pages/admin/Reports.jsx
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Filter, Download } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Sample data - replace with actual API data
  const salesData = [
    { name: 'Jan', sales: 4000, expenses: 2400 },
    { name: 'Feb', sales: 3000, expenses: 1398 },
    { name: 'Mar', sales: 2000, expenses: 9800 },
    { name: 'Apr', sales: 2780, expenses: 3908 },
    { name: 'May', sales: 1890, expenses: 4800 },
  ];

  const expenseData = [
    { name: 'Rent', value: 400 },
    { name: 'Utilities', value: 300 },
    { name: 'Supplies', value: 300 },
    { name: 'Salary', value: 200 },
  ];

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
          <button className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Apply Filter</span>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900">Total Revenue</h4>
          <p className="text-2xl font-bold text-green-600">$45,231.89</p>
          <p className="text-sm text-gray-600">+20.1% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900">Total Expenses</h4>
          <p className="text-2xl font-bold text-red-600">$12,234.56</p>
          <p className="text-sm text-gray-600">+5.2% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900">Net Profit</h4>
          <p className="text-2xl font-bold text-blue-600">$32,997.33</p>
          <p className="text-sm text-gray-600">+15.3% from last month</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;