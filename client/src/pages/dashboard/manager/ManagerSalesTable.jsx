// components/branch-owner/ManagerSalesTable.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useTheme } from "../../../context/ThemeContext";
import dailyReportService from "../../../services/dailyReportService";
import {
  Calendar,
  DollarSign,
  CreditCard,
  Receipt,
  TrendingUp,
  Search,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Calendar as CalendarIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  FileText,
  BarChart3,
  RefreshCw,
  Copy,
  CheckCircle2,
  Edit,
  Trash2,
  Save,
} from "lucide-react";

const ManagerSalesTable = ({
  branchOwnerId,
  salesData = null,
  totalItems: propTotalItems = 0,
  isManagerView = false,
  filters: propFilters = {},
  currentPage: propCurrentPage = 1,
  itemsPerPage: propItemsPerPage = 10,
  onPageChange = null,
  onItemsPerPageChange = null,
  loading: propLoading = false,
  onRefresh = null,
}) => {
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [localItemsPerPage, setLocalItemsPerPage] = useState(10);
  const [localSalesData, setLocalSalesData] = useState([]);
  const [localTotalItems, setLocalTotalItems] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    type: "all",
    startDate: "",
    endDate: "",
  });
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [copiedRow, setCopiedRow] = useState(null);
  const { theme } = useTheme();
  // Add these states after the existing state declarations
  const [editingReport, setEditingReport] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const currentPage = isManagerView ? propCurrentPage : localCurrentPage;
  const itemsPerPage = isManagerView ? propItemsPerPage : localItemsPerPage;
  const dailyReports = isManagerView
    ? Array.isArray(salesData)
      ? salesData
      : []
    : localSalesData;
  const totalItems = isManagerView ? propTotalItems : localTotalItems;
  const loading = isManagerView ? propLoading : localLoading;

  useEffect(() => {
    if (isManagerView) {
      // Manager view props already control pagination
    } else {
      const fetchDailyReports = async () => {
        setLocalLoading(true);
        try {
          const filters = {
            searchTerm,
            dateFilterType: dateFilter.type,
            dateFilterStartDate: dateFilter.startDate,
            dateFilterEndDate: dateFilter.endDate,
            sortField,
            sortOrder,
          };
          const response = await dailyReportService.getDailyReportsByBranch(
            branchOwnerId,
            localCurrentPage,
            localItemsPerPage,
            filters
          );
          setLocalSalesData(response.dailyReports);
          setLocalTotalItems(response.totalItems);
        } catch (error) {
          toast.error("Failed to fetch daily reports.");
          console.error("Error fetching daily reports:", error);
        } finally {
          setLocalLoading(false);
        }
      };

      if (branchOwnerId) {
        fetchDailyReports();
      }
    }
  }, [
    branchOwnerId,
    currentPage,
    itemsPerPage,
    searchTerm,
    dateFilter,
    sortField,
    sortOrder,
    isManagerView,
    localCurrentPage,
    localItemsPerPage,
  ]);

  // When in manager view, update local states if props change
  useEffect(() => {
    if (isManagerView) {
      setLocalCurrentPage(propCurrentPage);
      setLocalItemsPerPage(propItemsPerPage);
    }
  }, [propCurrentPage, propItemsPerPage, isManagerView]);

  // Filtering and Sorting are now handled by the backend when not in ManagerView
  // When in ManagerView, we still need to apply local filtering/sorting to the provided salesData
  const processedReports = useMemo(() => {
    if (isManagerView) {
      let filtered = dailyReports.filter((report) => {
        const matchesSearch =
          !searchTerm ||
          report.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.gpay?.toString().includes(searchTerm) ||
          report.card?.toString().includes(searchTerm) ||
          report.cash?.toString().includes(searchTerm) ||
          report.regularExpenses?.toString().includes(searchTerm) ||
          report.otherExpenses?.toString().includes(searchTerm);

        let matchesDateRange = true;
        if (dateFilter.type !== "all") {
          const reportDate = new Date(report.date);

          switch (dateFilter.type) {
            case "today":
              const today = new Date();
              matchesDateRange =
                reportDate.toDateString() === today.toDateString();
              break;
            case "week":
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              matchesDateRange = reportDate >= weekAgo;
              break;
            case "month":
              const monthAgo = new Date();
              monthAgo.setDate(monthAgo.getDate() - 30);
              matchesDateRange = reportDate >= monthAgo;
              break;
            case "date":
              aValue = new Date(a.date);
              bValue = new Date(b.date);
              break;
            case "custom":
              if (dateFilter.startDate) {
                matchesDateRange =
                  matchesDateRange &&
                  reportDate >= new Date(dateFilter.startDate);
              }
              if (dateFilter.endDate) {
                const endDate = new Date(dateFilter.endDate);
                endDate.setHours(23, 59, 59, 999);
                matchesDateRange = matchesDateRange && reportDate <= endDate;
              }
              break;
            default:
              matchesDateRange = true;
          }
        }
        return matchesSearch && matchesDateRange;
      });

      const sorted = [...filtered];
      sorted.sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
          case "date":
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case "gpay":
          case "card":
          case "cash":
          case "regularExpenses":
          case "otherExpenses":
            aValue = Number(a[sortField]) || 0;
            bValue = Number(b[sortField]) || 0;
            break;
          case "total":
            aValue =
              (Number(a.gpay) || 0) +
              (Number(a.card) || 0) +
              (Number(a.cash) || 0);
            bValue =
              (Number(b.gpay) || 0) +
              (Number(b.card) || 0) +
              (Number(b.cash) || 0);
            break;
          case "netIncome":
            aValue =
              (Number(a.gpay) || 0) +
              (Number(a.card) || 0) +
              (Number(a.cash) || 0) -
              ((Number(a.regularExpenses) || 0) +
                (Number(a.otherExpenses) || 0));
            bValue =
              (Number(b.gpay) || 0) +
              (Number(b.card) || 0) +
              (Number(b.cash) || 0) -
              ((Number(b.regularExpenses) || 0) +
                (Number(b.otherExpenses) || 0));
            break;
          case "profit":
            const totalCollectionA =
              (Number(a.gpay) || 0) +
              (Number(a.card) || 0) +
              (Number(a.cash) || 0);
            const totalCollectionB =
              (Number(b.gpay) || 0) +
              (Number(b.card) || 0) +
              (Number(b.cash) || 0);
            const totalExpensesA =
              (Number(a.regularExpenses) || 0) + (Number(a.otherExpenses) || 0);
            const totalExpensesB =
              (Number(b.regularExpenses) || 0) + (Number(b.otherExpenses) || 0);
            const netIncomeA = totalCollectionA - totalExpensesA;
            const netIncomeB = totalCollectionB - totalExpensesB;
            aValue = netIncomeA * 0.35; // 35% of net income
            bValue = netIncomeB * 0.35;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
      return sorted;
    }
    return dailyReports; // When not in manager view, data is already filtered/sorted by backend
  }, [
    dailyReports,
    searchTerm,
    dateFilter,
    sortField,
    sortOrder,
    isManagerView,
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentReports = processedReports; // When using backend pagination, currentReports is already the sliced data

  // Calculate totals
  const getTotalCollection = () => {
    return processedReports.reduce((sum, report) => {
      return (
        sum +
        (Number(report.gpay) || 0) +
        (Number(report.card) || 0) +
        (Number(report.cash) || 0)
      );
    }, 0);
  };

  const getTotalRegularExpenses = () => {
    return processedReports.reduce(
      (sum, report) => sum + (Number(report.regularExpenses) || 0),
      0
    );
  };

  const getTotalOtherExpenses = () => {
    return processedReports.reduce(
      (sum, report) => sum + (Number(report.otherExpenses) || 0),
      0
    );
  };

  // Edit handlers
  const handleEdit = (report) => {
    setEditingReport(report._id || report.id);
    setEditFormData({
      gpay: report.gpay || 0,
      card: report.card || 0,
      cash: report.cash || 0,
      regularExpenses: report.regularExpenses || 0,
      otherExpenses: report.otherExpenses || 0,
      date: report.date,
    });
  };

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingReport) return;

    setEditLoading(true);
    try {
      await dailyReportService.updateDailyReport(editingReport, editFormData);
      toast.success("Report updated successfully!");

      // Refresh the data
      if (isManagerView && onRefresh) {
        onRefresh();
      } else {
        // Refetch data for local view
        const filters = {
          searchTerm,
          dateFilterType: dateFilter.type,
          dateFilterStartDate: dateFilter.startDate,
          dateFilterEndDate: dateFilter.endDate,
          sortField,
          sortOrder,
        };
        const response = await dailyReportService.getDailyReportsByBranch(
          branchOwnerId,
          localCurrentPage,
          localItemsPerPage,
          filters
        );
        setLocalSalesData(response.dailyReports);
      }

      setEditingReport(null);
      setEditFormData({});
    } catch (error) {
      toast.error("Failed to update report.");
      console.error("Error updating report:", error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
    setEditFormData({});
  };

  // Delete handlers
  const handleDelete = async (reportId) => {
    setDeleteLoading(true);
    try {
      await dailyReportService.deleteDailyReport(reportId);
      toast.success("Report deleted successfully!");

      // Refresh the data
      if (isManagerView && onRefresh) {
        onRefresh();
      } else {
        // Refetch data for local view
        const filters = {
          searchTerm,
          dateFilterType: dateFilter.type,
          dateFilterStartDate: dateFilter.startDate,
          dateFilterEndDate: dateFilter.endDate,
          sortField,
          sortOrder,
        };
        const response = await dailyReportService.getDailyReportsByBranch(
          branchOwnerId,
          localCurrentPage,
          localItemsPerPage,
          filters
        );
        setLocalSalesData(response.dailyReports);
        setLocalTotalItems(response.totalItems);
      }

      setDeleteConfirm(null);
    } catch (error) {
      toast.error("Failed to delete report.");
      console.error("Error deleting report:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDelete = (reportId) => {
    setDeleteConfirm(reportId);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const getTotalExpenses = () => {
    return getTotalRegularExpenses() + getTotalOtherExpenses();
  };

// Fix the getTotalProfit function
const getTotalProfit = () => {
  const totalCollection = getTotalCollection();
  const totalExpenses = getTotalExpenses();
  const netIncome = totalCollection - totalExpenses;
  return netIncome * 0.35; // 35% of net income
};

  // Add this helper function at the top of the component, after the imports
  const formatDateWithDay = (dateString) => {
    if (!dateString) return "Invalid Date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      const options = {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Also add this helper function for a shorter version if needed
  const formatDateWithShortDay = (dateString) => {
    if (!dateString) return "Invalid Date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
      };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      return "Invalid Date";
    }
  };
  const getAverageCollection = () => {
    return processedReports.length > 0
      ? getTotalCollection() / processedReports.length
      : 0;
  };

  const getAverageExpenses = () => {
    return processedReports.length > 0
      ? getTotalExpenses() / processedReports.length
      : 0;
  };

  // Sort handler
  const handleSort = (field) => {
    if (isManagerView) {
      if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    } else {
      // For local view, sorting is handled by backend fetch
      if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
      setLocalCurrentPage(1); // Reset to first page on sort change
    }
  };

  // Row selection
  const toggleRowSelection = (reportId) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(reportId)) {
      newSelection.delete(reportId);
    } else {
      newSelection.add(reportId);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === currentReports.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(currentReports.map((r) => r._id || r.id)));
    }
  };

  // Copy row data
 const copyRowData = (report) => {
  const totalCollection = (Number(report.gpay) || 0) + (Number(report.card) || 0) + (Number(report.cash) || 0);
  const totalExpenses = (Number(report.regularExpenses) || 0) + (Number(report.otherExpenses) || 0);
  const netIncome = totalCollection - totalExpenses;
  const profit = netIncome * 0.35; // 35% of net income

  const text = `Date: ${report.date}
GPay: ₹${(Number(report.gpay) || 0).toFixed(2)}
Card: ₹${(Number(report.card) || 0).toFixed(2)}
Cash: ₹${(Number(report.cash) || 0).toFixed(2)}
Regular Expenses: ₹${(Number(report.regularExpenses) || 0).toFixed(2)}
Other Expenses: ₹${(Number(report.otherExpenses) || 0).toFixed(2)}
Total Collection: ₹${totalCollection.toFixed(2)}
Total Expenses: ₹${totalExpenses.toFixed(2)}
Net Income: ₹${netIncome.toFixed(2)}
Profit (35%): ₹${profit.toFixed(2)}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedRow(report._id || report.id);
        toast.success("Data copied to clipboard!");
        setTimeout(() => setCopiedRow(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy data");
      });
  };

  // Pagination handlers
  const goToFirstPage = () => {
    const newPage = 1;
    if (isManagerView && onPageChange) {
      onPageChange(newPage);
    } else {
      setLocalCurrentPage(newPage);
    }
  };

  const goToLastPage = () => {
    const newPage = totalPages;
    if (isManagerView && onPageChange) {
      onPageChange(newPage);
    } else {
      setLocalCurrentPage(newPage);
    }
  };

  const goToPreviousPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    if (isManagerView && onPageChange) {
      onPageChange(newPage);
    } else {
      setLocalCurrentPage(newPage);
    }
  };

  const goToNextPage = () => {
    const newPage = Math.min(totalPages, currentPage + 1);
    if (isManagerView && onPageChange) {
      onPageChange(newPage);
    } else {
      setLocalCurrentPage(newPage);
    }
  };

  const handlePageChange = (page) => {
    if (isManagerView && onPageChange) {
      onPageChange(page);
    } else {
      setLocalCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (isManagerView && onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    } else {
      setLocalItemsPerPage(newItemsPerPage);
      setLocalCurrentPage(1); // Reset to first page when items per page changes
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Enhanced CSV Export
  const downloadCSV = () => {
    if (processedReports.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      const escapeCSV = (field) => {
        if (field === null || field === undefined) return '""';
        const stringField = String(field);
        if (
          stringField.includes('"') ||
          stringField.includes(",") ||
          stringField.includes("\n")
        ) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      };

      const headers = [
        "Date",
        "GPay",
        "Card",
        "Cash",
        "Regular Expenses",
        "Other Expenses",
        "Total Collection",
        "Total Expenses",
        "Profit (35%)",
        "Net Income",
      ];

      const csvRows = processedReports.map((report) => {
        const totalCollection =
          (Number(report.gpay) || 0) +
          (Number(report.card) || 0) +
          (Number(report.cash) || 0);
        const totalExpenses =
          (Number(report.regularExpenses) || 0) +
          (Number(report.otherExpenses) || 0);
          const netIncome = totalCollection - totalExpenses;
          const profit = netIncome * 0.35; // 35% of net income

        return [
          escapeCSV(report.date),
          escapeCSV((Number(report.gpay) || 0).toFixed(2)),
          escapeCSV((Number(report.card) || 0).toFixed(2)),
          escapeCSV((Number(report.cash) || 0).toFixed(2)),
          escapeCSV((Number(report.regularExpenses) || 0).toFixed(2)),
          escapeCSV((Number(report.otherExpenses) || 0).toFixed(2)),
          escapeCSV(totalCollection.toFixed(2)),
          escapeCSV(totalExpenses.toFixed(2)),
          escapeCSV(profit.toFixed(2)), // This is now 35% of net income
          escapeCSV(netIncome.toFixed(2)),
        ];
      });

      let csvContent = [headers.join(",")];
      csvContent = csvContent.concat(csvRows.map((row) => row.join(",")));

      // Enhanced summary
      csvContent.push("");
      csvContent.push("SUMMARY STATISTICS");
      csvContent.push(`Total Records,${totalItems}`);
      csvContent.push(`Total Collection,₹${getTotalCollection().toFixed(2)}`);
      csvContent.push(
        `Average Collection,₹${getAverageCollection().toFixed(2)}`
      );
      csvContent.push(
        `Total Regular Expenses,₹${getTotalRegularExpenses().toFixed(2)}`
      );
      csvContent.push(
        `Total Other Expenses,₹${getTotalOtherExpenses().toFixed(2)}`
      );
      csvContent.push(`Total Expenses,₹${getTotalExpenses().toFixed(2)}`);
      csvContent.push(`Average Expenses,₹${getAverageExpenses().toFixed(2)}`);
      csvContent.push(`Total Profit (35%),₹${getTotalProfit().toFixed(2)}`);
      csvContent.push(
        `Net Income,₹${(getTotalCollection() - getTotalExpenses()).toFixed(2)}`
      );
      csvContent.push(`Export Date,${new Date().toLocaleDateString("en-US")}`);
      csvContent.push(`Export Time,${new Date().toLocaleTimeString("en-US")}`);

      const blob = new Blob([csvContent.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      const date = new Date().toISOString().split("T")[0];
      const filename = `daily-reports-${branchOwnerId || "branch"}-${date}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success("CSV file downloaded successfully!");
      setShowExportMenu(false);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download CSV file");
    }
  };

  // Export selected rows
  const exportSelectedRows = () => {
    if (selectedRows.size === 0) {
      toast.error("No rows selected");
      return;
    }

    const selectedData = processedReports.filter((r) =>
      selectedRows.has(r._id || r.id)
    );

    // Temporarily set filtered data for export
    downloadCSV(); // This will now use selectedData if we pass it
  };

  // Apply quick date filter
  const applyQuickDateFilter = (type) => {
    const today = new Date();
    let startDate = new Date();

    switch (type) {
      case "today":
        startDate = new Date(today);
        break;
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "custom":
        setDateFilter({ type: "custom", startDate: "", endDate: "" });
        return;
      default:
        setDateFilter({ type: "all", startDate: "", endDate: "" });
        return;
    }

    setDateFilter({
      type,
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
    setLocalCurrentPage(1); // Reset to first page on filter change
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter({ type: "all", startDate: "", endDate: "" });
    setLocalCurrentPage(1);
    setSelectedRows(new Set());
    setSortField("date"); // Reset sort field
    setSortOrder("desc"); // Reset sort order
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  const dateFilters = [
    { key: "all", label: "All Time" },
    { key: "today", label: "Today" },
    { key: "week", label: "Last 7 Days" },
    { key: "month", label: "Last 30 Days" },
    { key: "custom", label: "Custom Range" },
  ];

  // Loading state
  if (loading && dailyReports.length === 0) {
    return (
      <div
        className={`rounded-xl p-8 transition-all duration-300 ${
          theme === "dark"
            ? "bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
            : "bg-white border border-gray-200 shadow-lg"
        }`}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2
            className={`w-12 h-12 animate-spin mb-4 ${
              theme === "dark" ? "text-emerald-400" : "text-emerald-600"
            }`}
          />
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading daily reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all duration-300 ${
        theme === "dark"
          ? "bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
          : "bg-white border border-gray-200 shadow-lg"
      }`}
    >
      {/* Header */}
      <div
        className={`px-6 py-4 border-b ${
          theme === "dark" ? "border-slate-700/50" : "border-gray-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                theme === "dark"
                  ? "bg-emerald-500/20 border border-emerald-500/30"
                  : "bg-emerald-50 border border-emerald-200"
              }`}
            >
              <Receipt
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                }`}
              />
            </div>
            <div>
              <h2
                className={`text-lg font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {isManagerView ? "Daily Reports Overview" : "Daily Reports"}
              </h2>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Showing {startIndex + 1} to {endIndex} of {totalItems} report
                {totalItems !== 1 ? "s" : ""}
                {totalItems !== dailyReports.length &&
                  ` (filtered from ${totalItems})`}
                {selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "hover:bg-slate-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            )}

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? theme === "dark"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-emerald-100 text-emerald-700"
                  : theme === "dark"
                  ? "hover:bg-slate-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={totalItems === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "hover:bg-slate-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                } ${totalItems === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div
                    className={`absolute right-0 top-full mt-1 w-64 rounded-lg shadow-lg border z-50 ${
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="p-2">
                      <div
                        className={`px-3 py-2 text-xs font-semibold ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Export Options
                      </div>
                      <button
                        onClick={downloadCSV}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-white font-medium transition-all bg-blue-500 hover:bg-blue-600 mb-1"
                      >
                        <FileText className="w-4 h-4" />
                        Export All to CSV
                      </button>
                      {selectedRows.size > 0 && (
                        <button
                          onClick={exportSelectedRows}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-white font-medium transition-all bg-emerald-500 hover:bg-emerald-600"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Export Selected ({selectedRows.size})
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div
            className={`mt-4 p-4 rounded-lg border ${
              theme === "dark"
                ? "bg-slate-700/50 border-slate-600"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Filters
              </h3>
              <button
                onClick={clearFilters}
                className={`text-xs flex items-center gap-1 ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label
                  className={`block text-xs font-medium mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Search
                </label>
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search by date, amount..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setLocalCurrentPage(1); // Reset to first page on search
                    }}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>

              {/* Date Filters */}
              <div className="lg:col-span-2 space-y-2">
                <label
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Date Range
                </label>

                {/* Quick Date Filters */}
                <div className="flex flex-wrap gap-2">
                  {dateFilters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => applyQuickDateFilter(filter.key)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        dateFilter.type === filter.key
                          ? theme === "dark"
                            ? "bg-emerald-500 text-white"
                            : "bg-emerald-500 text-white"
                          : theme === "dark"
                          ? "bg-slate-600 text-gray-300 hover:bg-slate-500"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range */}
                {dateFilter.type === "custom" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label
                        className={`block text-xs font-medium mb-1 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-1.5 rounded border text-sm ${
                          theme === "dark"
                            ? "bg-slate-600 border-slate-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-medium mb-1 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-1.5 rounded border text-sm ${
                          theme === "dark"
                            ? "bg-slate-600 border-slate-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      <div
        className={`px-6 py-4 border-b ${
          theme === "dark" ? "border-slate-700/50" : "border-gray-200"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30"
                : "bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-emerald-500/30" : "bg-emerald-200"
                }`}
              >
                <DollarSign
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-emerald-300" : "text-emerald-700"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-emerald-300" : "text-emerald-700"
                  }`}
                >
                  Total Collection
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  ₹{getTotalCollection().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30"
                : "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-blue-500/30" : "bg-blue-200"
                }`}
              >
                <TrendingUp
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-blue-300" : "text-blue-700"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  Average Collection
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  ₹{getAverageCollection().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30"
                : "bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-red-500/30" : "bg-red-200"
                }`}
              >
                <Receipt
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-red-300" : "text-red-700"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-red-300" : "text-red-700"
                  }`}
                >
                  Regular Expenses
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}
                >
                  ₹{getTotalRegularExpenses().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30"
                : "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-orange-500/30" : "bg-orange-200"
                }`}
              >
                <Receipt
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-orange-300" : "text-orange-700"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-orange-300" : "text-orange-700"
                  }`}
                >
                  Other Expenses
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-orange-400" : "text-orange-600"
                  }`}
                >
                  ₹{getTotalOtherExpenses().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30"
                : "bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-purple-500/30" : "bg-purple-200"
                }`}
              >
                <BarChart3
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-purple-300" : "text-purple-700"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-purple-300" : "text-purple-700"
                  }`}
                >
                  Total Expenses
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}
                >
                  ₹{getTotalExpenses().toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              theme === "dark"
                ? "bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30"
                : "bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  theme === "dark" ? "bg-green-500/30" : "bg-green-200"
                }`}
              >
                <DollarSign
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-green-300" : "text-green-700"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-green-300" : "text-green-700"
                  }`}
                >
                  Profit (35%)
                </p>
                <p
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}
                >
                  ₹{getTotalProfit().toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table with sorting */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`${
                theme === "dark"
                  ? "bg-slate-900/50 border-b border-slate-700/50"
                  : "bg-gray-50 border-b border-gray-200"
              }`}
            >
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.size === currentReports.length &&
                    currentReports.length > 0
                  }
                  onChange={toggleAllRows}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-2">
                  Date
                  <SortIcon field="date" />
                </div>
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleSort("gpay")}
              >
                <div className="flex items-center gap-2">
                  GPay
                  <SortIcon field="gpay" />
                </div>
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleSort("card")}
              >
                <div className="flex items-center gap-2">
                  Card
                  <SortIcon field="card" />
                </div>
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleSort("cash")}
              >
                <div className="flex items-center gap-2">
                  Cash
                  <SortIcon field="cash" />
                </div>
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleSort("regularExpenses")}
              >
                <div className="flex items-center gap-2">
                  Regular Expenses
                  <SortIcon field="regularExpenses" />
                </div>
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleSort("otherExpenses")}
              >
                <div className="flex items-center gap-2">
                  Other Expenses
                  <SortIcon field="otherExpenses" />
                </div>
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleSort("total")}
              >
                <div className="flex items-center gap-2">
                  Total Collection
                  <SortIcon field="total" />
                </div>
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleSort("profit")}
              >
                <div className="flex items-center gap-2">
                  Profit (35%)
                  <SortIcon field="profit" />
                </div>
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75 transition-colors ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => handleSort("netIncome")}
              >
                <div className="flex items-center gap-2">
                  Net Income
                  <SortIcon field="netIncome" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              theme === "dark" ? "divide-slate-700/50" : "divide-gray-200"
            }`}
          >
            {currentReports.map((report, index) => {
              const totalCollection =
                (Number(report.gpay) || 0) +
                (Number(report.card) || 0) +
                (Number(report.cash) || 0);
              const totalExpenses =
                (Number(report.regularExpenses) || 0) +
                (Number(report.otherExpenses) || 0);
                const netIncome = totalCollection - totalExpenses;
                const profit = netIncome * 0.35; // 35% of net income
              const isSelected = selectedRows.has(report._id || report.id);
              const isCopied = copiedRow === (report._id || report.id);
              const isEditing = editingReport === (report._id || report.id);
              const isDeleteConfirm =
                deleteConfirm === (report._id || report.id);

              return (
                <tr
                  key={report._id || report.id}
                  className={`transition-all duration-200 ${
                    isSelected
                      ? theme === "dark"
                        ? "bg-emerald-500/10 border-l-4 border-l-emerald-500"
                        : "bg-emerald-50 border-l-4 border-l-emerald-500"
                      : theme === "dark"
                      ? "hover:bg-slate-700/30"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleRowSelection(report._id || report.id)
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>

                  {/* Date Column */}
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      {formatDateWithDay(report.date)}
                    </div>
                  </td>

                  {/* Editable Columns */}
                  {/* GPay */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.gpay}
                        onChange={(e) =>
                          handleEditChange("gpay", e.target.value)
                        }
                        className={`w-20 px-2 py-1 rounded border text-sm ${
                          theme === "dark"
                            ? "bg-slate-600 border-slate-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        ₹{(Number(report.gpay) || 0).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Card */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.card}
                        onChange={(e) =>
                          handleEditChange("card", e.target.value)
                        }
                        className={`w-20 px-2 py-1 rounded border text-sm ${
                          theme === "dark"
                            ? "bg-slate-600 border-slate-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        ₹{(Number(report.card) || 0).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Cash */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.cash}
                        onChange={(e) =>
                          handleEditChange("cash", e.target.value)
                        }
                        className={`w-20 px-2 py-1 rounded border text-sm ${
                          theme === "dark"
                            ? "bg-slate-600 border-slate-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        ₹{(Number(report.cash) || 0).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Regular Expenses */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.regularExpenses}
                        onChange={(e) =>
                          handleEditChange("regularExpenses", e.target.value)
                        }
                        className={`w-20 px-2 py-1 rounded border text-sm ${
                          theme === "dark"
                            ? "bg-slate-600 border-slate-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        ₹{(Number(report.regularExpenses) || 0).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Other Expenses */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.otherExpenses}
                        onChange={(e) =>
                          handleEditChange("otherExpenses", e.target.value)
                        }
                        className={`w-20 px-2 py-1 rounded border text-sm ${
                          theme === "dark"
                            ? "bg-slate-600 border-slate-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          theme === "dark"
                            ? "text-orange-400"
                            : "text-orange-600"
                        }`}
                      >
                        ₹{(Number(report.otherExpenses) || 0).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Calculated Columns (Read-only) */}
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    ₹{totalCollection.toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    ₹{profit.toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      netIncome >= 0
                        ? theme === "dark"
                          ? "text-green-400"
                          : "text-green-600"
                        : theme === "dark"
                        ? "text-red-400"
                        : "text-red-600"
                    }`}
                  >
                    ₹{netIncome.toFixed(2)}
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={editLoading}
                          className={`p-1.5 rounded transition-colors ${
                            editLoading
                              ? "opacity-50 cursor-not-allowed"
                              : theme === "dark"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                          title="Save changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={editLoading}
                          className={`p-1.5 rounded transition-colors ${
                            editLoading
                              ? "opacity-50 cursor-not-allowed"
                              : theme === "dark"
                              ? "bg-gray-600 hover:bg-gray-700 text-white"
                              : "bg-gray-600 hover:bg-gray-700 text-white"
                          }`}
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : isDeleteConfirm ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(report._id || report.id)}
                          disabled={deleteLoading}
                          className={`p-1.5 rounded transition-colors text-white ${
                            deleteLoading
                              ? "opacity-50 cursor-not-allowed bg-red-500"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                          title="Confirm delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelDelete}
                          disabled={deleteLoading}
                          className={`p-1.5 rounded transition-colors ${
                            deleteLoading
                              ? "opacity-50 cursor-not-allowed"
                              : theme === "dark"
                              ? "bg-gray-600 hover:bg-gray-700 text-white"
                              : "bg-gray-600 hover:bg-gray-700 text-white"
                          }`}
                          title="Cancel delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyRowData(report)}
                          className={`p-1.5 rounded transition-colors ${
                            isCopied
                              ? theme === "dark"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-green-100 text-green-700"
                              : theme === "dark"
                              ? "hover:bg-slate-600 text-gray-400 hover:text-white"
                              : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                          }`}
                          title={isCopied ? "Copied!" : "Copy row data"}
                        >
                          {isCopied ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(report)}
                          className={`p-1.5 rounded transition-colors ${
                            theme === "dark"
                              ? "hover:bg-slate-600 text-gray-400 hover:text-white"
                              : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                          }`}
                          title="Edit report"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(report._id || report.id)}
                          className={`p-1.5 rounded transition-colors ${
                            theme === "dark"
                              ? "hover:bg-slate-600 text-red-400 hover:text-red-300"
                              : "hover:bg-gray-200 text-red-600 hover:text-red-700"
                          }`}
                          title="Delete report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`rounded-lg p-6 max-w-md w-full mx-4 ${
                theme === "dark" ? "bg-slate-800" : "bg-white"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Confirm Delete
              </h3>
              <p
                className={`mb-4 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Are you sure you want to delete this daily report? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  className={`px-4 py-2 rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  {deleteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {currentReports.length === 0 && (
          <div className="text-center py-12">
            <div
              className={`mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                theme === "dark"
                  ? "bg-slate-700/50 text-gray-400"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Receipt className="w-8 h-8" />
            </div>
            <h3
              className={`text-lg font-medium mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-900"
              }`}
            >
              No reports found
            </h3>
            <p
              className={`text-sm max-w-sm mx-auto ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {totalItems === 0
                ? "No daily reports have been added yet."
                : "No reports match your current filters. Try adjusting your search criteria."}
            </p>
            {totalItems === 0 && !isManagerView && (
              <button
                onClick={() =>
                  (window.location.href = "/branch-owner/add-sales")
                }
                className={`mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                Add First Report
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div
          className={`px-6 py-4 border-t ${
            theme === "dark" ? "border-slate-700/50" : "border-gray-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-3">
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Show:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className={`px-3 py-1.5 rounded border text-sm ${
                  theme === "dark"
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                items per page
              </span>
            </div>

            {/* Page info */}
            <div
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Showing {startIndex + 1} to {endIndex} of {totalItems} entries
              {totalItems !== dailyReports.length && (
                <span className="ml-1">(filtered from {totalItems} total)</span>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className={`p-2 rounded ${
                  currentPage === 1
                    ? theme === "dark"
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 cursor-not-allowed"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded ${
                  currentPage === 1
                    ? theme === "dark"
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 cursor-not-allowed"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  disabled={page === "..."}
                  className={`min-w-[40px] h-10 px-3 rounded text-sm font-medium transition-colors ${
                    page === currentPage
                      ? theme === "dark"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-600 text-white"
                      : page === "..."
                      ? theme === "dark"
                        ? "text-gray-500 cursor-default"
                        : "text-gray-400 cursor-default"
                      : theme === "dark"
                      ? "text-gray-400 hover:text-white hover:bg-slate-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Page */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${
                  currentPage === totalPages
                    ? theme === "dark"
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 cursor-not-allowed"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${
                  currentPage === totalPages
                    ? theme === "dark"
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 cursor-not-allowed"
                    : theme === "dark"
                    ? "text-gray-400 hover:text-white hover:bg-slate-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerSalesTable;
