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



// @desc    Get stock requests by manager ID with pagination
// @route   GET /api/stockrequests/manager/:managerId
// @access  Private (Admin, BrandOwner, Manager)
const getStockRequestsByManagerId = asyncHandler(async (req, res) => {
  const { managerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  console.log('getStockRequestsByManagerId: Received managerId:', managerId);

  // Find the manager
  const manager = await User.findById(managerId);

  if (!manager) {
    console.log('getStockRequestsByManagerId: Manager not found for ID:', managerId);
    res.status(404);
    throw new Error('Manager not found');
  }
  console.log('getStockRequestsByManagerId: Manager found:', manager.name, 'ID:', manager._id);

  // Get assigned branch owners from the manager's assignedBranchOwners array
  const branchOwnerIds = manager.assignedBranchOwners;
  console.log('getStockRequestsByManagerId: Manager assignedBranchOwners:', branchOwnerIds);

  if (!branchOwnerIds || branchOwnerIds.length === 0) {
    console.log('getStockRequestsByManagerId: No branch owners assigned to this manager. Returning empty array.');
    return res.status(200).json({
      stockRequests: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  // Fetch the stock requests for those branch owners
  const stockRequests = await StockRequest.find({
    branchOwner: { $in: branchOwnerIds },
  })
    .populate('branchOwner', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await StockRequest.countDocuments({
    branchOwner: { $in: branchOwnerIds },
  });

  console.log('getStockRequestsByManagerId: Querying stock requests for branchOwner IDs:', branchOwnerIds);
  console.log('getStockRequestsByManagerId: Fetched stock requests count:', stockRequests.length);
  console.log('getStockRequestsByManagerId: Total items:', totalItems);

  res.status(200).json({
    stockRequests,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});


// @desc    Get stock requests by branch owner ID
// @route   GET /api/stockrequests/branch/:branchOwnerId
// @access  Private (Admin, BrandOwner, Manager)
const getStockRequestsByBranchId = asyncHandler(async (req, res) => {
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

  // Allow BranchOwner to access their own requests
  if (user.role === 'BranchOwner') {
    if (user._id.toString() !== branchOwnerId) {
      console.log("Auth Error: BranchOwner trying to access other branch's requests.");
      res.status(403);
      throw new Error('Not authorized to view stock requests for other branches');
    }
  }
  // Restrict other roles to Admin, BrandOwner, and Manager
  else if (!['Admin', 'BrandOwner', 'Manager'].includes(user.role)) {
    console.log("Auth Error: User role not authorized.");
    res.status(403);
    throw new Error('Not authorized to view stock requests');
  }

  // For BrandOwner and Manager, ensure they are authorized to view this specific branch
  if (user.role === 'BrandOwner') {
    const branchOwner = await User.findById(branchOwnerId);
    console.log("Auth Check: BrandOwner - Found Branch Owner:", branchOwner?._id.toString());
    console.log("Auth Check: BrandOwner - Assigned Brand Owner:", branchOwner?.assignedBrandOwner?.toString());
    if (!branchOwner || branchOwner.assignedBrandOwner.toString() !== user._id.toString()) {
      console.log("Auth Error: BrandOwner not authorized for this branch owner's requests.");
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s stock requests');
    }
  } else if (user.role === 'Manager') {
    const branchOwner = await User.findById(branchOwnerId);
    console.log("Auth Check: Manager - Found Branch Owner:", branchOwner?._id.toString());
    console.log("Auth Check: Manager - Assigned Manager:", branchOwner?.assignedManager?.toString());
    if (!branchOwner || branchOwner.assignedManager.toString() !== user._id.toString()) {
      console.log("Auth Error: Manager not authorized for this branch owner's requests.");
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s stock requests');
    }
  }

  const stockRequests = await StockRequest.find({ branchOwner: branchOwnerId })
    .populate('branchOwner', 'name email')
    .limit(limit)
    .skip(skip);

  const totalItems = await StockRequest.countDocuments({ branchOwner: branchOwnerId });

  res.status(200).json({
    stockRequests,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});


// @desc    Get stock requests by brand owner ID with pagination and filtering
// @route   GET /api/stockrequests/brandowner/:brandOwnerId
// @access  Private (Admin, BrandOwner)
const getStockRequestsByBrandOwner = asyncHandler(async (req, res) => {
  const { brandOwnerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const managerNameFilter = req.query.managerName || ''; // Added managerNameFilter
  const statusFilter = req.query.status || '';

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
      stockRequests: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  let query = { branchOwner: { $in: branchOwnerIds } };

  if (statusFilter) {
    query.status = statusFilter;
  }

  const stockRequests = await StockRequest.find(query)
    .populate('branchOwner', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await StockRequest.countDocuments(query);

  res.status(200).json({
    stockRequests,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

export {
  getStockRequests,
  createStockRequest,
  approveStockRequest,
  deleteStockRequest,
  getStockRequestsByBranchId,
  getStockRequestsByManagerId,
  getStockRequestsByBrandOwner,
}
