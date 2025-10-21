// ============================================
// ReportsPage.jsx - Redesigned
// ============================================

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../../../context/ThemeContext';

const ReportsPage = () => {
  const { branchOwnerId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { 
      value: 'sales', 
      label: 'Sales Report', 
      description: 'Track revenue and transactions',
      color: 'from-green-500 to-emerald-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      value: 'expenses', 
      label: 'Expenses Report', 
      description: 'Monitor costs and spending',
      color: 'from-red-500 to-pink-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      value: 'stock', 
      label: 'Stock Requests', 
      description: 'Inventory movement analysis',
      color: 'from-blue-500 to-indigo-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      value: 'profit-loss', 
      label: 'Profit & Loss', 
      description: 'Financial performance overview',
      color: 'from-purple-500 to-violet-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  const exportFormats = [
    { 
      value: 'pdf', 
      label: 'PDF', 
      color: 'bg-red-500 hover:bg-red-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      value: 'excel', 
      label: 'Excel', 
      color: 'bg-green-500 hover:bg-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      value: 'csv', 
      label: 'CSV', 
      color: 'bg-purple-500 hover:bg-purple-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/reports/${reportType}?branchOwnerId=${branchOwnerId}&start=${dateRange.start}&end=${dateRange.end}`);
      if (response.ok) {
        const data = await response.json();
        toast.success('Report generated successfully!');
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      toast.error('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format) => {
    try {
      toast.info(`Exporting ${format.toUpperCase()}...`);
      const response = await fetch(`/api/exports/${reportType}/${format}?branchOwnerId=${branchOwnerId}&start=${dateRange.start}&end=${dateRange.end}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${dateRange.start}-to-${dateRange.end}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`${format.toUpperCase()} exported successfully!`);
      } else {
        throw new Error('Failed to export report');
      }
    } catch (error) {
      toast.error('Error exporting report. Please try again.');
    }
  };

  const selectedReport = reportTypes.find(r => r.value === reportType);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-2xl p-6 ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600'
        } shadow-xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Reports & Analytics
                </h1>
              </div>
              <p className="text-white/90 text-sm">
                Generate comprehensive reports and export data
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Real-time Data</span>
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className={`rounded-2xl overflow-hidden ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        } shadow-xl`}>
          <div className={`px-6 py-4 border-b ${
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Select Report Type
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  className={`relative p-6 rounded-xl transition-all duration-300 border-2 ${
                    reportType === type.value
                      ? isDark
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                        : 'border-indigo-500 bg-indigo-50 shadow-lg'
                      : isDark
                      ? 'border-slate-700 bg-slate-700/30 hover:border-slate-600 hover:bg-slate-700/50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {reportType === type.value && (
                    <div className="absolute top-3 right-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-indigo-500' : 'bg-indigo-600'
                      }`}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} p-2.5 mb-4 text-white`}>
                    {type.icon}
                  </div>
                  <h3 className={`font-semibold mb-1 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {type.label}
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Range */}
          <div className={`lg:col-span-2 rounded-2xl overflow-hidden ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          } shadow-xl`}>
            <div className={`px-6 py-4 border-b ${
              isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date Range
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    isGenerating
                      ? isDark
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isDark
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className={`rounded-2xl overflow-hidden ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          } shadow-xl`}>
            <div className={`px-6 py-4 border-b ${
              isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Options
              </h2>
            </div>

            <div className="p-6 space-y-3">
              {exportFormats.map(format => (
                <button
                  key={format.value}
                  onClick={() => handleExport(format.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium transition-all duration-300 shadow-lg ${format.color}`}
                >
                  {format.icon}
                  <span>Export as {format.label}</span>
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className={`rounded-2xl overflow-hidden ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        } shadow-xl`}>
          <div className={`px-6 py-4 border-b ${
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
          }`}>
            <h2 className={`text-lg font-semibold flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Report Preview
            </h2>
          </div>

          <div className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${selectedReport.color} p-6 mb-6 text-white`}>
                {selectedReport.icon}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {selectedReport.label}
              </h3>
              <p className={`text-sm mb-6 max-w-md ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Configure your date range and click "Generate Report" to view detailed {selectedReport.label.toLowerCase()} data and analytics.
              </p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  Date range: {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;