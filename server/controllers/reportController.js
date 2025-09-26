import asyncHandler from 'express-async-handler';
import Sales from '../models/Sales.js';
import Expense from '../models/Expense.js';
import StockRequest from '../models/StockRequest.js';
import User from '../models/User.js';

// Helper function to get branch owner IDs for a given manager/brand owner
const getAccessibleBranchOwnerIds = async (userId, userRole) => {
  if (userRole === 'Admin') {
    const branchOwners = await User.find({ role: 'BranchOwner' });
    return branchOwners.map(user => user._id);
  } else if (userRole === 'BrandOwner' || userRole === 'Manager') {
    const branchOwners = await User.find({ assignedManager: userId, role: 'BranchOwner' });
    return branchOwners.map(user => user._id);
  } else if (userRole === 'BranchOwner') {
    return [userId];
  }
  return [];
};

// @desc    Generate sales report
// @route   GET /api/reports/sales
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getSalesReport = asyncHandler(async (req, res) => {
  const { type, branch, manager, startDate, endDate, paymentType } = req.query;
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  const accessibleBranchOwnerIds = await getAccessibleBranchOwnerIds(user._id, user.role);

  let query = {
    branchOwner: { $in: accessibleBranchOwnerIds },
  };

  if (branch && branch !== 'all') {
    query.branchOwner = branch;
  }
  
  if (manager && manager !== 'all') {
    const managerUser = await User.findById(manager);
    if (managerUser && (managerUser.role === 'BrandOwner' || managerUser.role === 'Manager')) {
      const managerBranchOwners = await User.find({ assignedManager: managerUser._id, role: 'BranchOwner' });
      const managerBranchOwnerIds = managerBranchOwners.map(owner => owner._id);
      query.branchOwner = { $in: managerBranchOwnerIds.filter(id => accessibleBranchOwnerIds.includes(id)) };
    } else {
      res.status(400);
      throw new Error('Invalid manager ID or role');
    }
  }

  if (paymentType && paymentType !== 'all') {
    query[paymentType] = { $gt: 0 };
  }

  const now = new Date();
  let start, end;

  switch (type) {
    case 'daily':
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start = new Date();
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'custom':
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        res.status(400);
        throw new Error('Start date and end date are required for custom reports');
      }
      break;
    default:
      // All time - no date filter
      break;
  }

  if (type !== 'all') {
    query.date = { $gte: start, $lte: end };
  }

  const salesReport = await Sales.find(query).populate('branchOwner', 'name email');
  
  // Calculate summary
  const summary = {
    totalSales: salesReport.reduce((sum, sale) => sum + sale.total, 0),
    totalCash: salesReport.reduce((sum, sale) => sum + sale.cash, 0),
    totalGpay: salesReport.reduce((sum, sale) => sum + sale.gpay, 0),
    totalCreditCard: salesReport.reduce((sum, sale) => sum + sale.creditCard, 0),
    totalRecords: salesReport.length
  };

  res.status(200).json({ sales: salesReport, summary });
});

// @desc    Generate expense report
// @route   GET /api/reports/expenses
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getExpenseReport = asyncHandler(async (req, res) => {
  const { type, branch, manager, startDate, endDate, category } = req.query;
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  const accessibleBranchOwnerIds = await getAccessibleBranchOwnerIds(user._id, user.role);

  let query = {
    branchOwner: { $in: accessibleBranchOwnerIds },
  };

  if (branch && branch !== 'all') {
    query.branchOwner = branch;
  }
  
  if (manager && manager !== 'all') {
    const managerUser = await User.findById(manager);
    if (managerUser && (managerUser.role === 'BrandOwner' || managerUser.role === 'Manager')) {
      const managerBranchOwners = await User.find({ assignedManager: managerUser._id, role: 'BranchOwner' });
      const managerBranchOwnerIds = managerBranchOwners.map(owner => owner._id);
      query.branchOwner = { $in: managerBranchOwnerIds.filter(id => accessibleBranchOwnerIds.includes(id)) };
    } else {
      res.status(400);
      throw new Error('Invalid manager ID or role');
    }
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  const now = new Date();
  let start, end;

  switch (type) {
    case 'daily':
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start = new Date();
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'custom':
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        res.status(400);
        throw new Error('Start date and end date are required for custom reports');
      }
      break;
    default:
      // All time - no date filter
      break;
  }

  if (type !== 'all') {
    query.date = { $gte: start, $lte: end };
  }

  const expenseReport = await Expense.find(query).populate('branchOwner', 'name email');
  
  // Calculate summary
  const summary = {
    totalExpenses: expenseReport.reduce((sum, expense) => sum + expense.amount, 0),
    totalRecords: expenseReport.length,
    categories: [...new Set(expenseReport.map(expense => expense.category))]
  };

  res.status(200).json({ expenses: expenseReport, summary });
});

// @desc    Generate stock request report
// @route   GET /api/reports/stockrequests
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getStockRequestReport = asyncHandler(async (req, res) => {
  const { type, branch, manager, startDate, endDate, status } = req.query;
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  const accessibleBranchOwnerIds = await getAccessibleBranchOwnerIds(user._id, user.role);

  let query = {
    branchOwner: { $in: accessibleBranchOwnerIds },
  };

  if (branch && branch !== 'all') {
    query.branchOwner = branch;
  }
  
  if (manager && manager !== 'all') {
    const managerUser = await User.findById(manager);
    if (managerUser && (managerUser.role === 'BrandOwner' || managerUser.role === 'Manager')) {
      const managerBranchOwners = await User.find({ assignedManager: managerUser._id, role: 'BranchOwner' });
      const managerBranchOwnerIds = managerBranchOwners.map(owner => owner._id);
      query.branchOwner = { $in: managerBranchOwnerIds.filter(id => accessibleBranchOwnerIds.includes(id)) };
    } else {
      res.status(400);
      throw new Error('Invalid manager ID or role');
    }
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  const { start, end } = getDateRange(type, startDate, endDate);
  if (type !== 'all') {
    query.createdAt = { $gte: start, $lte: end };
  }

  const stockRequestReport = await StockRequest.find(query)
    .populate('branchOwner', 'name email')
    .populate('items.product', 'name'); // Assuming 'product' is a ref in StockRequest items

  const summary = {
    totalRequests: stockRequestReport.length,
    pendingRequests: stockRequestReport.filter(req => req.status === 'Pending').length,
    approvedRequests: stockRequestReport.filter(req => req.status === 'Approved').length,
    rejectedRequests: stockRequestReport.filter(req => req.status === 'Rejected').length,
  };

  res.status(200).json({ stockRequests: stockRequestReport, summary });
});


// @desc    Generate profit/loss report
// @route   GET /api/reports/profit-loss
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getProfitLossReport = asyncHandler(async (req, res) => {
  const { type, branch, manager, startDate, endDate } = req.query;
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  const accessibleBranchOwnerIds = await getAccessibleBranchOwnerIds(user._id, user.role);

  // Get sales data
  let salesQuery = { branchOwner: { $in: accessibleBranchOwnerIds } };
  let expensesQuery = { branchOwner: { $in: accessibleBranchOwnerIds } };

  if (branch && branch !== 'all') {
    salesQuery.branchOwner = branch;
    expensesQuery.branchOwner = branch;
  }

  // Date filtering
  const { start, end } = getDateRange(type, startDate, endDate);
  if (type !== 'all') {
    salesQuery.date = { $gte: start, $lte: end };
    expensesQuery.date = { $gte: start, $lte: end };
  }

  const [sales, expenses] = await Promise.all([
    Sales.find(salesQuery).populate('branchOwner', 'name email'),
    Expense.find(expensesQuery).populate('branchOwner', 'name email')
  ]);

  // Calculate profit/loss by branch
  const branchProfitLoss = {};
  
  sales.forEach(sale => {
    const branchId = sale.branchOwner._id.toString();
    if (!branchProfitLoss[branchId]) {
      branchProfitLoss[branchId] = {
        branchOwner: sale.branchOwner,
        totalSales: 0,
        totalExpenses: 0,
        netProfit: 0
      };
    }
    branchProfitLoss[branchId].totalSales += sale.total;
  });

  expenses.forEach(expense => {
    const branchId = expense.branchOwner._id.toString();
    if (!branchProfitLoss[branchId]) {
      branchProfitLoss[branchId] = {
        branchOwner: expense.branchOwner,
        totalSales: 0,
        totalExpenses: 0,
        netProfit: 0
      };
    }
    branchProfitLoss[branchId].totalExpenses += expense.amount;
  });

  // Calculate net profit
  Object.keys(branchProfitLoss).forEach(branchId => {
    branchProfitLoss[branchId].netProfit =
      branchProfitLoss[branchId].totalSales - branchProfitLoss[branchId].totalExpenses;
  });

  const report = Object.values(branchProfitLoss);
  
  // Overall summary
  const summary = {
    totalSales: report.reduce((sum, item) => sum + item.totalSales, 0),
    totalExpenses: report.reduce((sum, item) => sum + item.totalExpenses, 0),
    netProfit: report.reduce((sum, item) => sum + item.netProfit, 0),
    totalBranches: report.length
  };

  res.status(200).json({ report, summary, period: { start, end } });
});

// Helper function for date ranges
function getDateRange(type, startDate, endDate) {
  const now = new Date();
  let start, end;

  switch (type) {
    case 'daily':
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start = new Date();
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'custom':
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      } else {
        throw new Error('Start date and end date are required for custom reports');
      }
      break;
    default:
      // All time - no date filter
      start = new Date(0);
      end = new Date();
      break;
  }

  return { start, end };
}

export {
  getSalesReport,
  getExpenseReport,
  getStockRequestReport,
  getProfitLossReport
};