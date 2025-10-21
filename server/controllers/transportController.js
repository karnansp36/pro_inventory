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

// @desc    Get transport details by branch owner ID with pagination
// @route   GET /api/transport/branch/:branchOwnerId
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getTransportsByBranchOwnerId = asyncHandler(async (req, res) => {
  let { branchOwnerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

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
      console.log("Auth Error: BranchOwner trying to access other branch's transports.");
      res.status(403);
      throw new Error('Not authorized to view transports for other branches');
    }
  }
  // Restrict other roles to Admin, BrandOwner, and Manager
  else if (!['Admin', 'BrandOwner', 'Manager'].includes(user.role)) {
    console.log("Auth Error: User role not authorized.");
    res.status(403);
    throw new Error('Not authorized to view transports');
  }

  // For BrandOwner and Manager, ensure they are authorized to view this specific branch
  if (user.role === 'BrandOwner') {
    const branchOwner = await User.findById(branchOwnerId);
    console.log("Auth Check: BrandOwner - Found Branch Owner:", branchOwner?._id.toString());
    console.log("Auth Check: BrandOwner - Assigned Brand Owner:", branchOwner?.assignedBrandOwner?.toString());
    if (!branchOwner || branchOwner.assignedBrandOwner?.toString() !== user._id.toString()) {
      console.log("Auth Error: BrandOwner not authorized for this branch owner's transports.");
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s transports');
    }
  } else if (user.role === 'Manager') {
    const branchOwner = await User.findById(branchOwnerId);
    console.log("Auth Check: Manager - Found Branch Owner:", branchOwner?._id.toString());
    console.log("Auth Check: Manager - Assigned Manager:", branchOwner?.assignedManager?.toString());
    if (!branchOwner || branchOwner.assignedManager?.toString() !== user._id.toString()) {
      console.log("Auth Error: Manager not authorized for this branch owner's transports.");
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s transports');
    }
  }

  // Get stock requests for the branch owner
  const stockRequests = await StockRequest.find({ branchOwner: branchOwnerId });
  const stockRequestIds = stockRequests.map(request => request._id);

  // Get transports with pagination
  const transports = await Transport.find({ stockRequest: { $in: stockRequestIds } })
    .populate({
      path: 'stockRequest',
      select: 'productName quantity branchOwner',
      populate: {
        path: 'branchOwner',
        select: 'name email',
      },
    })
    .sort({ createdAt: -1 }) // Sort by latest first
    .limit(limit)
    .skip(skip);

  const totalItems = await Transport.countDocuments({ stockRequest: { $in: stockRequestIds } });

  res.status(200).json({
    transports,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});