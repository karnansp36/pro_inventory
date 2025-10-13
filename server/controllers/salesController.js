import asyncHandler from 'express-async-handler';
import Sales from '../models/Sales.js';
import User from '../models/User.js';

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getSales = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  let sales;
  if (user.role === 'Admin') {
    sales = await Sales.find({}).populate('branchOwner', 'name email');
  } else if (user.role === 'BrandOwner') {
    const branchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    sales = await Sales.find({ branchOwner: { $in: branchOwnerIds } }).populate('branchOwner', 'name email');
  } else if (user.role === 'Manager') {
    const branchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    sales = await Sales.find({ branchOwner: { $in: branchOwnerIds } }).populate('branchOwner', 'name email');
  } else if (user.role === 'BranchOwner') {
    sales = await Sales.find({ branchOwner: req.user.id }).populate('branchOwner', 'name email');
  } else {
    res.status(403);
    throw new Error('Not authorized to view sales');
  }

  res.status(200).json(sales);
});

// @desc    Create new sales (BranchOwner only)
// @route   POST /api/sales
// @access  Private (BranchOwner)
const createSales = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, branchOwner } = req.body;

  if (!amount || !paymentMethod) {
    res.status(400);
    throw new Error('Please add amount and payment method');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }


  let branchOwnerId;
  if (user.role === 'BranchOwner') {
    branchOwnerId = req.user.id;
  } else if (user.role === 'Admin' || user.role === 'BrandOwner') {
    if (!branchOwner) {
      res.status(400);
      throw new Error('branchOwner is required for Admin/BrandOwner');
    }
    branchOwnerId = branchOwner;
  } else {
    res.status(403);
    throw new Error('Not authorized to create sales');
  }

  const sales = await Sales.create({
    branchOwner: branchOwnerId,
    amount,
    paymentMethod,
    date: Date.now(),
  });

  res.status(201).json(sales);
});

// @desc    Delete sales (Admin, BrandOwner only)
// @route   DELETE /api/sales/:id
// @access  Private (Admin, BrandOwner)
const deleteSales = asyncHandler(async (req, res) => {
  const sales = await Sales.findById(req.params.id);

  if (!sales) {
    res.status(404);
    throw new Error('Sales not found');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'Admin' && user.role !== 'BrandOwner') {
    res.status(403);
    throw new Error('Not authorized to delete sales');
  }

  await Sales.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Sales removed' });
});

// @desc    Update sales (Admin, BrandOwner only)
// @route   PUT /api/sales/:id
// @access  Private (Admin, BrandOwner)
const updateSales = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, branchOwner } = req.body;

  const sales = await Sales.findById(req.params.id);

  if (!sales) {
    res.status(404);
    throw new Error('Sales not found');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'Admin' && user.role !== 'BrandOwner') {
    res.status(403);
    throw new Error('Not authorized to update sales');
  }

  sales.amount = amount || sales.amount;
  sales.paymentMethod = paymentMethod || sales.paymentMethod;
  sales.branchOwner = branchOwner || sales.branchOwner;

  const updatedSales = await sales.save();
  res.status(200).json(updatedSales);
});

export {
  getSales,
  createSales,
  deleteSales,
  updateSales,
};