import asyncHandler from 'express-async-handler';
import Transport from '../models/Transport.js';
import StockRequest from '../models/StockRequest.js';
import User from '../models/User.js';

// @desc    Get all transport details
// @route   GET /api/transport
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getTransports = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  let transports;
  if (user.role === 'Admin') {
    transports = await Transport.find({}).populate({
      path: 'stockRequest',
      select: 'productName quantity branchOwner',
      populate: {
        path: 'branchOwner',
        select: 'name email',
      },
    });
  } else if (user.role === 'BrandOwner') {
    const branchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    const stockRequests = await StockRequest.find({ branchOwner: { $in: branchOwnerIds } });
    const stockRequestIds = stockRequests.map(request => request._id);
    transports = await Transport.find({ stockRequest: { $in: stockRequestIds } }).populate({
      path: 'stockRequest',
      select: 'productName quantity branchOwner',
      populate: {
        path: 'branchOwner',
        select: 'name email',
      },
    });
  } else if (user.role === 'Manager') {
    const branchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    const stockRequests = await StockRequest.find({ branchOwner: { $in: branchOwnerIds } });
    const stockRequestIds = stockRequests.map(request => request._id);
    transports = await Transport.find({ stockRequest: { $in: stockRequestIds } }).populate({
      path: 'stockRequest',
      select: 'productName quantity branchOwner',
      populate: {
        path: 'branchOwner',
        select: 'name email',
      },
    });
  } else if (user.role === 'BranchOwner') {
    const stockRequests = await StockRequest.find({ branchOwner: req.user.id });
    const stockRequestIds = stockRequests.map(request => request._id);
    transports = await Transport.find({ stockRequest: { $in: stockRequestIds } }).populate({
      path: 'stockRequest',
      select: 'productName quantity branchOwner',
      populate: {
        path: 'branchOwner',
        select: 'name email',
      },
    });
  } else {
    res.status(403);
    throw new Error('Not authorized to view transport details');
  }

  res.status(200).json(transports);
});

// @desc    Create new transport details (BrandOwner only)
// @route   POST /api/transport
// @access  Private (BrandOwner)
const createTransport = asyncHandler(async (req, res) => {
  const { stockRequest, bundleSize, quantity, from, to } = req.body;

  if (!stockRequest || !bundleSize || !quantity || !from || !to) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'BrandOwner' && user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to create transport details');
  }

  const transport = await Transport.create({
    stockRequest,
    bundleSize,
    quantity,
    from,
    to,
  });

  res.status(201).json(transport);
});

// @desc    Confirm received quantity for transport (BranchOwner only)
// @route   PUT /api/transport/:id/receive
// @access  Private (BranchOwner)
const confirmReceivedTransport = asyncHandler(async (req, res) => {
  const { receivedQuantity } = req.body;

  const transport = await Transport.findById(req.params.id).populate('stockRequest');

  if (!transport) {
    res.status(404);
    throw new Error('Transport not found');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'BranchOwner' && user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to confirm received quantity');
  }

  // If the user is an Admin, they can confirm any transport.
  // If the user is a BranchOwner, they can only confirm transports for their own branch.
  if (user.role === 'BranchOwner' && transport.stockRequest.branchOwner.toString() !== req.user.id.toString()) {
    res.status(403);
    throw new Error('Not authorized to confirm this transport');
  }

  transport.receivedQuantity = receivedQuantity;
  const updatedTransport = await transport.save();

  res.status(200).json(updatedTransport);
});

// @desc    Delete transport (Admin, BrandOwner only)
// @route   DELETE /api/transport/:id
// @access  Private (Admin, BrandOwner)
const deleteTransport = asyncHandler(async (req, res) => {
  const transport = await Transport.findById(req.params.id);

  if (!transport) {
    res.status(404);
    throw new Error('Transport not found');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'Admin' && user.role !== 'BrandOwner') {
    res.status(403);
    throw new Error('Not authorized to delete transport details');
  }

  await transport.remove();
  res.status(200).json({ message: 'Transport removed' });
});

export {
  getTransports,
  createTransport,
  confirmReceivedTransport,
  deleteTransport,
  getTransportsByBranchOwnerId,
};

// @desc    Get transport details by branch owner ID
// @route   GET /api/transport/branch/:branchOwnerId
// @access  Private (Admin, BrandOwner, Manager)
const getTransportsByBranchOwnerId = asyncHandler(async (req, res) => {
  const { branchOwnerId } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Only Admin, BrandOwner, and Manager roles can access this route
  if (!['Admin', 'BrandOwner', 'Manager'].includes(user.role)) {
    res.status(403);
    throw new Error('Not authorized to view transport details for other branches');
  }

  // For BrandOwner and Manager, ensure they are authorized to view this specific branch
  if (user.role === 'BrandOwner') {
    const branchOwner = await User.findById(branchOwnerId);
    if (!branchOwner || branchOwner.assignedBrandOwner.toString() !== user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s transport details');
    }
  } else if (user.role === 'Manager') {
    const branchOwner = await User.findById(branchOwnerId);
    if (!branchOwner || !branchOwner.assignedBranchOwners.includes(branchOwnerId)) {
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s transport details');
    }
  }

  const stockRequests = await StockRequest.find({ branchOwner: branchOwnerId });
  const stockRequestIds = stockRequests.map(request => request._id);

  const transports = await Transport.find({ stockRequest: { $in: stockRequestIds } }).populate({
    path: 'stockRequest',
    select: 'productName quantity branchOwner',
    populate: {
      path: 'branchOwner',
      select: 'name email',
    },
  });

  res.status(200).json(transports);
});