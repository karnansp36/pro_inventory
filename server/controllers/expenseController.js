import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

// @desc    Get all expenses with pagination
// @route   GET /api/expenses
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getExpenses = asyncHandler(async (req, res) => {
  console.log('getExpenses: User ID from request:', req.user.id);
  const user = await User.findById(req.user.id);

  if (!user) {
    console.log('getExpenses: User not found for ID:', req.user.id);
    res.status(401);
    throw new Error('User not found');
  }

  console.log('getExpenses: User role:', user.role);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let expenses;
  let totalItems;
  
  if (user.role === 'Admin') {
    expenses = await Expense.find({})
      .populate('branchOwner', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await Expense.countDocuments({});
  } else if (user.role === 'BrandOwner') {
    const branchOwners = await User.find({ assignedBrandOwner: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    expenses = await Expense.find({ branchOwner: { $in: branchOwnerIds } })
      .populate('branchOwner', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await Expense.countDocuments({ branchOwner: { $in: branchOwnerIds } });
  } else if (user.role === 'Manager') {
    // Fetch expenses data for branches assigned to the manager
    const managerId = req.user.id;
    const manager = await User.findById(managerId).populate('assignedBranchOwners');

    let branchOwnerIds = manager.assignedBranchOwners.map(bo => bo._id);

    let query = { branchOwner: { $in: branchOwnerIds } };
    if (req.query.branchId) {
      query.branchOwner = req.query.branchId;
    }

    expenses = await Expense.find(query)
      .populate('branchOwner', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await Expense.countDocuments(query);
  } else if (user.role === 'BranchOwner') {
    expenses = await Expense.find({ branchOwner: req.user.id })
      .populate('branchOwner', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await Expense.countDocuments({ branchOwner: req.user.id });
  } else {
    res.status(403);
    throw new Error('Not authorized to view expenses');
  }

  res.status(200).json({
    expenses,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

// @desc    Create new expense (Admin, BrandOwner, BranchOwner)
// @route   POST /api/expenses
// @access  Private (Admin, BrandOwner, BranchOwner)
const createExpense = asyncHandler(async (req, res) => {
  const { category, amount, description, branchOwner, paymentMethod, date } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  let ownerId;
  if (user.role === 'Admin' || user.role === 'BrandOwner') {
    if (!branchOwner) {
      res.status(400);
      throw new Error('branchOwner is required');
    }
    // Validate branchOwner exists and is a BranchOwner
    const branchOwnerUser = await User.findById(branchOwner);
    if (!branchOwnerUser || branchOwnerUser.role !== 'BranchOwner') {
      res.status(400);
      throw new Error('Invalid branchOwner');
    }
    ownerId = branchOwner;
  } else if (user.role === 'BranchOwner') {
    ownerId = req.user.id;
  } else {
    res.status(403);
    throw new Error('Not authorized to create expenses');
  }

  const expense = await Expense.create({
    branchOwner: ownerId,
    category,
    amount,
    description,
    paymentMethod,
    date,
  });

  res.status(201).json(expense);
});

// @desc    Update expense (Admin, BrandOwner only)
// @route   PUT /api/expenses/:id
// @access  Private (Admin, BrandOwner)
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'Admin' && user.role !== 'BrandOwner') {
    res.status(403);
    throw new Error('Not authorized to update expenses');
  }

  const updatedExpense = await Expense.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('branchOwner', 'name email');

  res.status(200).json(updatedExpense);
});

// @desc    Delete expense (Admin, BrandOwner only)
// @route   DELETE /api/expenses/:id
// @access  Private (Admin, BrandOwner)
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'Admin' && user.role !== 'BrandOwner') {
    res.status(403);
    throw new Error('Not authorized to delete expenses');
  }

  await Expense.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Expense removed' });
});

// @desc    Get expenses by manager ID with pagination
// @route   GET /api/expenses/manager/:managerId
// @access  Private (Admin, BrandOwner, Manager)
const getExpensesByManagerId = asyncHandler(async (req, res) => {
  const { managerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  console.log('getExpensesByManagerId: Received managerId:', managerId);

  // Find the manager
  const manager = await User.findById(managerId);

  if (!manager) {
    console.log('getExpensesByManagerId: Manager not found for ID:', managerId);
    res.status(404);
    throw new Error('Manager not found');
  }
  console.log('getExpensesByManagerId: Manager found:', manager.name, 'ID:', manager._id);

  // Get assigned branch owners from the manager's assignedBranchOwners array
  const branchOwnerIds = manager.assignedBranchOwners;
  console.log('getExpensesByManagerId: Manager assignedBranchOwners:', branchOwnerIds);

  if (!branchOwnerIds || branchOwnerIds.length === 0) {
    console.log('getExpensesByManagerId: No branch owners assigned to this manager. Returning empty array.');
    return res.status(200).json({
      expenses: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  // Fetch the expenses for those branch owners
  const expenses = await Expense.find({
    branchOwner: { $in: branchOwnerIds },
  })
    .populate('branchOwner', 'name email')
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await Expense.countDocuments({
    branchOwner: { $in: branchOwnerIds },
  });

  console.log('getExpensesByManagerId: Querying expenses for branchOwner IDs:', branchOwnerIds);
  console.log('getExpensesByManagerId: Fetched expenses count:', expenses.length);
  console.log('getExpensesByManagerId: Total items:', totalItems);

  res.status(200).json({
    expenses,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

// @desc    Get expenses by branch owner ID with pagination
// @route   GET /api/expenses/branch-owner/:branchOwnerId
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getExpensesByBranchOwnerId = asyncHandler(async (req, res) => {
  let { branchOwnerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  console.log('getExpensesByBranchOwnerId: Received branchOwnerId:', branchOwnerId);

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }
  console.log('getExpensesByBranchOwnerId: User role:', user.role, 'User ID:', user._id);

  // If branchOwnerId is not provided in params and user is BranchOwner, use their own ID
  if (!branchOwnerId && user.role === 'BranchOwner') {
    branchOwnerId = user._id.toString();
  }

  if (!branchOwnerId) {
    res.status(400);
    throw new Error('BranchOwnerId is required');
  }

  console.log("Auth Check: User Role:", user.role, "User ID:", user._id.toString());
  console.log("Auth Check: Requested BranchOwnerId:", branchOwnerId);
  console.log("Pagination: Page:", page, "Limit:", limit);

  // Allow BranchOwner to access their own requests
  if (user.role === 'BranchOwner') {
    if (user._id.toString() !== branchOwnerId) {
      console.log("Auth Error: BranchOwner trying to access other branch's expenses.");
      res.status(403);
      throw new Error('Not authorized to view expenses for other branches');
    }
  }
  // Restrict other roles to Admin, BrandOwner, and Manager
  else if (!['Admin', 'BrandOwner', 'Manager'].includes(user.role)) {
    console.log("Auth Error: User role not authorized.");
    res.status(403);
    throw new Error('Not authorized to view expenses');
  }

  // For BrandOwner and Manager, ensure they are authorized to view this specific branch
  if (user.role === 'BrandOwner') {
    const branchOwner = await User.findById(branchOwnerId);
    console.log("Auth Check: BrandOwner - Found Branch Owner:", branchOwner?._id.toString());
    console.log("Auth Check: BrandOwner - Assigned Brand Owner:", branchOwner?.assignedBrandOwner?.toString());
    if (!branchOwner || branchOwner.assignedBrandOwner?.toString() !== user._id.toString()) {
      console.log("Auth Error: BrandOwner not authorized for this branch owner's expenses.");
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s expenses');
    }
  } else if (user.role === 'Manager') {
    const branchOwner = await User.findById(branchOwnerId);
    console.log("Auth Check: Manager - Found Branch Owner:", branchOwner?._id.toString());
    console.log("Auth Check: Manager - Assigned Manager:", branchOwner?.assignedManager?.toString());
    if (!branchOwner || !branchOwner.assignedManager?.includes(user._id.toString())) {
      console.log("Auth Error: Manager not authorized for this branch owner's expenses.");
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s expenses');
    }
  }

  const expenses = await Expense.find({ branchOwner: branchOwnerId })
    .populate('branchOwner', 'name email')
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await Expense.countDocuments({ branchOwner: branchOwnerId });

  console.log('getExpensesByBranchOwnerId: Querying expenses for branchOwner ID:', branchOwnerId);
  console.log('getExpensesByBranchOwnerId: Fetched expenses count:', expenses.length);
  console.log('getExpensesByBranchOwnerId: Total items:', totalItems);

  res.status(200).json({
    expenses,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

// @desc    Get expenses by multiple branch owner IDs with pagination
// @route   GET /api/expenses/branch-owners?branchOwnerIds=id1&branchOwnerIds=id2
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getExpensesByBranchOwners = asyncHandler(async (req, res) => {
  const { branchOwnerIds } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  console.log('getExpensesByBranchOwners: Received branchOwnerIds:', branchOwnerIds);

  if (!branchOwnerIds) {
    res.status(400);
    throw new Error('branchOwnerIds are required as query parameters');
  }

  // Ensure branchOwnerIds is an array
  const ids = Array.isArray(branchOwnerIds) ? branchOwnerIds : [branchOwnerIds];

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }
  console.log('getExpensesByBranchOwners: User role:', user.role, 'User ID:', user._id);

  // Authorization logic (similar to getExpensesByBranchOwnerId but for multiple IDs)
  if (!['Admin', 'BrandOwner', 'Manager', 'BranchOwner'].includes(user.role)) {
    res.status(403);
    throw new Error('Not authorized to view expenses');
  }

  // For BranchOwner, ensure they can only view their own expenses
  if (user.role === 'BranchOwner') {
    if (!ids.every(id => user._id.toString() === id)) {
      res.status(403);
      throw new Error('Not authorized to view expenses for other branches');
    }
  }
  // For BrandOwner and Manager, ensure they are authorized to view these specific branches
  else if (user.role === 'BrandOwner') {
    const authorizedBranchOwners = await User.find({ assignedBrandOwner: user._id, role: 'BranchOwner', _id: { $in: ids } });
    if (authorizedBranchOwners.length !== ids.length) {
      res.status(403);
      throw new Error('Not authorized to view all specified branch owners\' expenses');
    }
  } else if (user.role === 'Manager') {
    const authorizedBranchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner', _id: { $in: ids } });
    if (authorizedBranchOwners.length !== ids.length) {
      res.status(403);
      throw new Error('Not authorized to view all specified branch owners\' expenses');
    }
  }

  const expenses = await Expense.find({ branchOwner: { $in: ids } })
    .populate('branchOwner', 'name email')
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await Expense.countDocuments({ branchOwner: { $in: ids } });

  console.log('getExpensesByBranchOwners: Querying expenses for branchOwner IDs:', ids);
  console.log('getExpensesByBranchOwners: Fetched expenses count:', expenses.length);
  console.log('getExpensesByBranchOwners: Total items:', totalItems);

  res.status(200).json({
    expenses,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});
// @desc    Get expenses by brand owner ID with pagination and filtering
// @route   GET /api/expenses/brandowner/:brandOwnerId
// @access  Private (Admin, BrandOwner)
const getExpensesByBrandOwner = asyncHandler(async (req, res) => {
  const { brandOwnerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const managerNameFilter = req.query.managerName || '';

  const brandOwner = await User.findById(brandOwnerId).populate({
    path: 'assignedManagers',
    select: 'name email assignedBranchOwners'
  });

  if (!brandOwner) {
    res.status(404);
    throw new Error('Brand owner not found');
  }

  let relevantManagers = brandOwner.assignedManagers;

  if (managerNameFilter) {
    relevantManagers = relevantManagers.filter(manager =>
      manager.name.toLowerCase().includes(managerNameFilter.toLowerCase())
    );
  }

  let branchOwnerIds = [];
  relevantManagers.forEach(manager => {
    if (manager.assignedBranchOwners && manager.assignedBranchOwners.length > 0) {
      branchOwnerIds = branchOwnerIds.concat(manager.assignedBranchOwners);
    }
  });

  branchOwnerIds = [...new Set(branchOwnerIds.map(id => id.toString()))];

  if (branchOwnerIds.length === 0) {
    return res.status(200).json({
      expenses: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  const expenses = await Expense.find({ branchOwner: { $in: branchOwnerIds } })
    .populate('branchOwner', 'name email')
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await Expense.countDocuments({ branchOwner: { $in: branchOwnerIds } });

  res.status(200).json({
    expenses,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});
export {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesByManagerId,
  getExpensesByBranchOwnerId,
  getExpensesByBranchOwners,
  getExpensesByBrandOwner,
};