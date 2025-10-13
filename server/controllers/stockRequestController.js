import asyncHandler from 'express-async-handler';
import StockRequest from '../models/StockRequest.js';
import User from '../models/User.js';

// @desc    Get all stock requests
// @route   GET /api/stockrequests
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getStockRequests = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  let stockRequests;
  if (user.role === 'Admin') {
    stockRequests = await StockRequest.find({}).populate('branchOwner', 'name email');
  } else if (user.role === 'BrandOwner') {
    const branchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    stockRequests = await StockRequest.find({ branchOwner: { $in: branchOwnerIds } }).populate('branchOwner', 'name email');
  } else if (user.role === 'Manager') {
    const branchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    stockRequests = await StockRequest.find({ branchOwner: { $in: branchOwnerIds } }).populate('branchOwner', 'name email');
  } else if (user.role === 'BranchOwner') {
    stockRequests = await StockRequest.find({ branchOwner: req.user.id }).populate('branchOwner', 'name email');
  } else {
    res.status(403);
    throw new Error('Not authorized to view stock requests');
  }

  res.status(200).json(stockRequests);
});

// @desc    Create new stock request (BranchOwner only)
// @route   POST /api/stockrequests
// @access  Private (BranchOwner)
const createStockRequest = asyncHandler(async (req, res) => {
  const { productName, quantity, priority, branchOwner } = req.body;

  if (!productName || !quantity || !priority) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  let ownerId;
  if (user.role === 'BranchOwner') {
    ownerId = req.user.id;
  } else if (user.role === 'Admin') {
    if (!branchOwner) {
      res.status(400);
      throw new Error('branchOwner is required for Admin');
    }
    const branchOwnerUser = await User.findById(branchOwner);
    if (!branchOwnerUser || branchOwnerUser.role !== 'BranchOwner') {
      res.status(400);
      throw new Error('Invalid branchOwner');
    }
    ownerId = branchOwner;
  } else {
    res.status(403);
    throw new Error('Not authorized to create stock requests');
  }

  const stockRequest = await StockRequest.create({
    branchOwner: ownerId,
    productName,
    quantity,
    priority,
  });

  res.status(201).json(stockRequest);
});

// @desc    Approve stock request (BrandOwner only)
// @route   PUT /api/stockrequests/:id/approve
// @access  Private (BrandOwner)
const approveStockRequest = asyncHandler(async (req, res) => {
  const stockRequest = await StockRequest.findById(req.params.id);

  if (!stockRequest) {
    res.status(404);
    throw new Error('Stock request not found');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'BrandOwner' && user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to approve stock requests');
  }

  stockRequest.approved = true;
  const updatedStockRequest = await stockRequest.save();

  res.status(200).json(updatedStockRequest);
});

// @desc    Delete stock request (Admin, BrandOwner only)
// @route   DELETE /api/stockrequests/:id
// @access  Private (Admin, BrandOwner)
const deleteStockRequest = asyncHandler(async (req, res) => {
  const stockRequest = await StockRequest.findById(req.params.id);

  if (!stockRequest) {
    res.status(404);
    throw new Error('Stock request not found');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'Admin' && user.role !== 'BrandOwner') {
    res.status(403);
    throw new Error('Not authorized to delete stock requests');
  }

  await stockRequest.remove();
  res.status(200).json({ message: 'Stock request removed' });
});


export {
  getStockRequests,
  createStockRequest,
  approveStockRequest,
  deleteStockRequest,
  getStockRequestsByBranchOwnerId,
};

// @desc    Get stock requests by branch owner ID
// @route   GET /api/stock-requests/branch/:branchOwnerId
// @access  Private (Admin, BrandOwner, Manager)
const getStockRequestsByBranchOwnerId = asyncHandler(async (req, res) => {
  const { branchOwnerId } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Only Admin, BrandOwner, and Manager roles can access this route
  if (!['Admin', 'BrandOwner', 'Manager'].includes(user.role)) {
    res.status(403);
    throw new Error('Not authorized to view stock requests for other branches');
  }

  // For BrandOwner and Manager, ensure they are authorized to view this specific branch
  if (user.role === 'BrandOwner') {
    const branchOwner = await User.findById(branchOwnerId);
    if (!branchOwner || branchOwner.assignedBrandOwner.toString() !== user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s stock requests');
    }
  } else if (user.role === 'Manager') {
    const branchOwner = await User.findById(branchOwnerId);
    if (!branchOwner || !branchOwner.assignedBranchOwners.includes(branchOwnerId)) {
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s stock requests');
    }
  }

  const stockRequests = await StockRequest.find({ branchOwner: branchOwnerId }).populate('branchOwner', 'name email');

  res.status(200).json(stockRequests);
});