import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getExpenses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  let expenses;
  if (user.role === 'Admin') {
    expenses = await Expense.find({}).populate('branchOwner', 'name email');
  } else if (user.role === 'BrandOwner') {
    const branchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    expenses = await Expense.find({ branchOwner: { $in: branchOwnerIds } }).populate('branchOwner', 'name email');
  } else if (user.role === 'Manager') {
    const branchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    expenses = await Expense.find({ branchOwner: { $in: branchOwnerIds } }).populate('branchOwner', 'name email');
  } else if (user.role === 'BranchOwner') {
    expenses = await Expense.find({ branchOwner: req.user.id }).populate('branchOwner', 'name email');
  } else {
    res.status(403);
    throw new Error('Not authorized to view expenses');
  }

  res.status(200).json(expenses);
});

// @desc    Create new expense (Admin, BrandOwner, BranchOwner)
// @route   POST /api/expenses
// @access  Private (Admin, BrandOwner, BranchOwner)
const createExpense = asyncHandler(async (req, res) => {
  const { category, amount, description, branchOwner, paymentMethod } = req.body;


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





export {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesByManagerId,
};


// @desc    Get expenses by manager ID
// @route   GET /api/expenses/manager/:managerId
// @access  Private (Admin, BrandOwner, Manager)
const getExpensesByManagerId = asyncHandler(async (req, res) => {
  const { managerId } = req.params;

  // Find the manager
  const manager = await User.findById(managerId);

  if (!manager) {
    res.status(404);
    throw new Error('Manager not found');
  }

  // Get assigned branch owners
  const branchOwnerIds = manager.assignedBranchOwners;

  if (!branchOwnerIds || branchOwnerIds.length === 0) {
    return res.status(200).json([]); // no branches assigned
  }

  // Fetch the expenses for those branch owners
  const expenses = await Expense.find({
    branchOwner: { $in: branchOwnerIds },
  }).populate('branchOwner', 'name email');

  res.status(200).json(expenses);
});
