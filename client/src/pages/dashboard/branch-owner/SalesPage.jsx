// pages/dashboard/branch-owner/SalesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getDailyReportsByBranch,
  createDailyReport,
} from "../../../store/slices/dailyReportSlice";
import { useTheme } from "../../../context/ThemeContext";
import {
  DollarSign,
  Wallet,
  CreditCard,
  Banknote,
  Receipt,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Modal2 from "../../../components/Modal2";
import SalesTable from "./SalesTable";

const SalesPage = () => {
  const location = useLocation();
  const { branchOwnerId } = location.state || {};
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Daily report form state
  const [gpay, setGpay] = useState("");
  const [card, setCard] = useState("");
  const [cash, setCash] = useState("");
  const [regularExpenses, setRegularExpenses] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [savingReport, setSavingReport] = useState(false);

  // Pagination and filter states for SalesTable
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({});

  const {
    dailyReports,
    totalItems,
    loading: dailyReportLoading,
    error: dailyReportError,
  } = useSelector((state) => state.dailyReport);

  const fetchReports = useCallback(() => {
    if (branchOwnerId) {
      dispatch(
        getDailyReportsByBranch({
          branchId: branchOwnerId,
          page: currentPage,
          limit: itemsPerPage,
          filters,
        })
      );
    }
  }, [branchOwnerId, dispatch, currentPage, itemsPerPage, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleSalesTableRefresh = () => {
    fetchReports();
  };

  // Calculate total income
  const calculateTotal = () => {
    const total =
      (parseFloat(gpay) || 0) +
      (parseFloat(card) || 0) +
      (parseFloat(cash) || 0);
    return total;
  };

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    return (
      (parseFloat(regularExpenses) || 0) + (parseFloat(otherExpenses) || 0)
    );
  };

  // Calculate net income (Total Income - Total Expenses)
  const calculateNet = () => {
    const total = calculateTotal();
    const totalExp = calculateTotalExpenses();
    return total - totalExp;
  };

  // FIXED: Calculate profit (35% of net income)
  const calculateProfit = () => {
    const netIncome = calculateNet();
    return netIncome * 0.35; // 35% of NET INCOME, not expenses
  };

  // Save daily report (show confirm modal)
  const handleSaveReport = () => {
    setShowConfirmModal(true);
  };

  // Helper to get today's date in IST (YYYY-MM-DD)
  const getTodayIST = () => {
    const now = new Date();
    // IST is UTC+5:30
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffsetMs);
    return istDate.toISOString().split("T")[0];
  };

  // Actually save after confirmation
  const confirmSaveReport = async () => {
    if (!branchOwnerId) {
      console.error("No branchOwnerId found");
      setShowConfirmModal(false);
      return;
    }
    setSavingReport(true);
    try {
      await dispatch(
        createDailyReport({
          branchId: branchOwnerId,
          gpay: parseFloat(gpay) || 0,
          card: parseFloat(card) || 0,
          cash: parseFloat(cash) || 0,
          regularExpenses: parseFloat(regularExpenses) || 0,
          otherExpenses: parseFloat(otherExpenses) || 0,
          date: getTodayIST(),
        })
      ).unwrap();
      setGpay("");
      setCard("");
      setCash("");
      setRegularExpenses("");
      setOtherExpenses("");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      fetchReports();
    } catch (error) {
      console.error("Failed to save report:", error);
    } finally {
      setSavingReport(false);
      setShowConfirmModal(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div
          className={`rounded-2xl p-6 relative overflow-hidden ${
            isDark
              ? "bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border border-slate-600"
              : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
          } shadow-xl`}
        >
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      Sales Management
                    </h1>
                    <p className="text-white/80 text-xs flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" />
                      {today}
                    </p>
                  </div>
                </div>
                <p className="text-white/90 text-sm ml-14">
                  Track and manage all your daily sales transactions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div
            className={`rounded-xl p-4 flex items-center gap-3 animate-slide-down ${
              isDark
                ? "bg-green-900/50 border border-green-700"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className={isDark ? "text-green-300" : "text-green-700"}>
              Daily report saved successfully!
            </span>
          </div>
        )}

        {/* Daily Shop Report Section - Enhanced Design */}
        <div
          className={`rounded-2xl overflow-hidden transition-all duration-300 ${
            isDark
              ? "bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700"
              : "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl"
          }`}
        >
          {/* Header Section */}
          <div
            className={`p-6 border-b ${
              isDark
                ? "border-slate-700 bg-slate-800/50"
                : "border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    isDark ? "bg-emerald-500/20" : "bg-emerald-100"
                  }`}
                >
                  <Receipt
                    className={`w-6 h-6 ${
                      isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                </div>
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Daily Shop Report
                  </h2>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Enter today's financial summary
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-lg ${
                  isDark ? "bg-slate-700" : "bg-white border border-gray-200"
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Today
                </span>
                <p
                  className={`text-sm font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Income Section */}
            <div className="mb-6">
              <h3
                className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
                  isDark ? "text-emerald-400" : "text-emerald-700"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Income Sources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* GPay Input */}
                <div
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    gpay
                      ? isDark
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-emerald-400 bg-emerald-50"
                      : isDark
                      ? "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isDark ? "bg-blue-500/20" : "bg-blue-100"
                      }`}
                    >
                      <Wallet
                        className={`w-5 h-5 ${
                          isDark ? "text-blue-400" : "text-blue-600"
                        }`}
                      />
                    </div>
                    <label
                      className={`text-sm font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      GPay
                    </label>
                  </div>
                  <input
                    type="number"
                    value={gpay}
                    onChange={(e) => setGpay(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold transition-all duration-200 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500 focus:border-emerald-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                  {gpay && (
                    <p
                      className={`text-xs mt-2 font-medium ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      ₹{parseFloat(gpay).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Card Input */}
                <div
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    card
                      ? isDark
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-emerald-400 bg-emerald-50"
                      : isDark
                      ? "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isDark ? "bg-purple-500/20" : "bg-purple-100"
                      }`}
                    >
                      <CreditCard
                        className={`w-5 h-5 ${
                          isDark ? "text-purple-400" : "text-purple-600"
                        }`}
                      />
                    </div>
                    <label
                      className={`text-sm font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Card
                    </label>
                  </div>
                  <input
                    type="number"
                    value={card}
                    onChange={(e) => setCard(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold transition-all duration-200 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500 focus:border-emerald-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                  {card && (
                    <p
                      className={`text-xs mt-2 font-medium ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      ₹{parseFloat(card).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Cash Input */}
                <div
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    cash
                      ? isDark
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-emerald-400 bg-emerald-50"
                      : isDark
                      ? "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isDark ? "bg-green-500/20" : "bg-green-100"
                      }`}
                    >
                      <Banknote
                        className={`w-5 h-5 ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}
                      />
                    </div>
                    <label
                      className={`text-sm font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Cash
                    </label>
                  </div>
                  <input
                    type="number"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold transition-all duration-200 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500 focus:border-emerald-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                  {cash && (
                    <p
                      className={`text-xs mt-2 font-medium ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      ₹{parseFloat(cash).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="mb-6">
              <h3
                className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
                  isDark ? "text-red-400" : "text-red-600"
                }`}
              >
                <Receipt className="w-4 h-4" />
                Expenses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Regular Expenses Input */}
                <div
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    regularExpenses
                      ? isDark
                        ? "border-red-500 bg-red-500/10"
                        : "border-red-400 bg-red-50"
                      : isDark
                      ? "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isDark ? "bg-red-500/20" : "bg-red-100"
                      }`}
                    >
                      <Receipt
                        className={`w-5 h-5 ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}
                      />
                    </div>
                    <label
                      className={`text-sm font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Regular Expenses
                    </label>
                  </div>
                  <input
                    type="number"
                    value={regularExpenses}
                    onChange={(e) => setRegularExpenses(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold transition-all duration-200 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500 focus:border-red-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-red-500"
                    } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                  />
                  {regularExpenses && (
                    <p
                      className={`text-xs mt-2 font-medium ${
                        isDark ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      ₹{parseFloat(regularExpenses).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Other Expenses Input */}
                <div
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    otherExpenses
                      ? isDark
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-orange-400 bg-orange-50"
                      : isDark
                      ? "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isDark ? "bg-orange-500/20" : "bg-orange-100"
                      }`}
                    >
                      <Receipt
                        className={`w-5 h-5 ${
                          isDark ? "text-orange-400" : "text-orange-600"
                        }`}
                      />
                    </div>
                    <label
                      className={`text-sm font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Other Expenses
                    </label>
                  </div>
                  <input
                    type="number"
                    value={otherExpenses}
                    onChange={(e) => setOtherExpenses(e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-lg border-2 text-lg font-semibold transition-all duration-200 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-white placeholder-gray-500 focus:border-orange-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500"
                    } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
                  />
                  {otherExpenses && (
                    <p
                      className={`text-xs mt-2 font-medium ${
                        isDark ? "text-orange-400" : "text-orange-600"
                      }`}
                    >
                      ₹{parseFloat(otherExpenses).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div
                className={`p-5 rounded-xl ${
                  isDark
                    ? "bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 border border-emerald-700/50"
                    : "bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200"
                }`}
              >
                <p
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-emerald-400" : "text-emerald-700"
                  }`}
                >
                  Total Income
                </p>
                <p
                  className={`text-3xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  ₹{calculateTotal().toFixed(2)}
                </p>
              </div>
              <div
                className={`p-5 rounded-xl ${
                  isDark
                    ? "bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700/50"
                    : "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
                }`}
              >
                <p
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-blue-400" : "text-blue-700"
                  }`}
                >
                  Net Income
                </p>
                <p
                  className={`text-3xl font-bold ${
                    calculateNet() >= 0
                      ? isDark
                        ? "text-white"
                        : "text-gray-900"
                      : "text-red-500"
                  }`}
                >
                  ₹{calculateNet().toFixed(2)}
                </p>
              </div>
              <div
                className={`p-5 rounded-xl ${
                  isDark
                    ? "bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/50"
                    : "bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
                }`}
              >
                <p
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-green-400" : "text-green-700"
                  }`}
                >
                  Profit (35%)
                </p>
                <p
                  className={`text-3xl font-bold ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  ₹{calculateProfit().toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Button and Messages */}
            <div className="space-y-3">
              <button
                onClick={handleSaveReport}
                disabled={savingReport || !branchOwnerId}
                className={`px-6 py-3 rounded-xl font-semibold text-white ${
                  savingReport || !branchOwnerId
                    ? "bg-gray-400 cursor-not-allowed"
                    : isDark
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } transition-all duration-300`}
              >
                {savingReport ? "Saving..." : "Save Report"}
              </button>

              {/* Error Messages */}
              {dailyReportError && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    isDark
                      ? "bg-red-900/50 border border-red-700"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className={isDark ? "text-red-300" : "text-red-700"}>
                    {dailyReportError}
                  </p>
                </div>
              )}

              {!branchOwnerId && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    isDark
                      ? "bg-yellow-900/50 border border-yellow-700"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className={isDark ? "text-yellow-300" : "text-yellow-700"}>
                    No branch ID found. Please navigate properly to this page.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div>
          <SalesTable
            salesData={dailyReports}
            totalItems={totalItems}
            loading={dailyReportLoading}
            branchOwnerId={branchOwnerId}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            onRefresh={handleSalesTableRefresh}
          />
        </div>

        {/* Enhanced Confirm Save Modal2 */}
        {showConfirmModal && (
          <Modal2 onClose={() => setShowConfirmModal(false)} title="">
            <div className="space-y-6 p-2">
              {/* Icon Section */}
              <div className="flex justify-center">
                <div
                  className={`p-4 rounded-full ${
                    isDark
                      ? "bg-emerald-500/20 border-2 border-emerald-500/30"
                      : "bg-emerald-100 border-2 border-emerald-200"
                  }`}
                >
                  <CheckCircle2
                    className={`w-12 h-12 ${
                      isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  />
                </div>
              </div>

              {/* Message Section */}
              <div className="text-center space-y-2">
                <h3
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Save Daily Shop Report?
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  This action will save the current daily shop report. You can
                  edit it later if needed.
                </p>
              </div>

              {/* Report Summary in Confirm Modal */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark
                    ? "bg-slate-900/50 border-slate-700/50"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Income:
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Expenses:
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isDark ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      ₹{calculateTotalExpenses().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Net Income:
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        calculateNet() >= 0
                          ? isDark
                            ? "text-green-400"
                            : "text-green-600"
                          : isDark
                          ? "text-red-400"
                          : "text-red-600"
                      }`}
                    >
                      ₹{calculateNet().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Profit (35% of Net):
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      ₹{calculateProfit().toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`border-t-2 ${
                      isDark ? "border-slate-700" : "border-gray-300"
                    }`}
                  ></div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-base font-bold ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Final Amount:
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        calculateNet() - calculateProfit() >= 0
                          ? isDark
                            ? "text-blue-400"
                            : "text-blue-600"
                          : isDark
                          ? "text-red-400"
                          : "text-red-600"
                      }`}
                    >
                      ₹{(calculateNet() - calculateProfit()).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isDark
                      ? "bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                  onClick={() => setShowConfirmModal(false)}
                  disabled={savingReport}
                >
                  Cancel
                </button>
                <button
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    savingReport
                      ? "bg-emerald-500 cursor-not-allowed opacity-75"
                      : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105"
                  }`}
                  onClick={confirmSaveReport}
                  disabled={savingReport}
                >
                  {savingReport ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm Save</span>
                    </>
                  )}
                </button>
              </div>

              {/* Helper Text */}
              <p
                className={`text-xs text-center ${
                  isDark ? "text-gray-500" : "text-gray-500"
                }`}
              >
                This report will be saved to your daily records and can be
                viewed in the table below
              </p>
            </div>
          </Modal2>
        )}
      </div>
    </div>
  );
};

export default SalesPage;
