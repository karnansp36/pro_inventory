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

// @desc    Get transport details by manager ID with pagination and filters
// @route   GET /api/transport/manager/:managerId
// @access  Private (Admin, BrandOwner, Manager)
const getTransportsByManagerId = asyncHandler(async (req, res) => {
  const { managerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, search, branchId, dateFilter, startDate, endDate } = req.query;

  console.log(`getTransportsByManagerId: managerId = ${managerId}, page = ${page}, limit = ${limit}`);

  // Find the manager
  const manager = await User.findById(managerId);

  if (!manager) {
    res.status(404);
    throw new Error('Manager not found');
  }

  // Get assigned branch owners from the manager's assignedBranchOwners array
  const branchOwnerIds = manager.assignedBranchOwners;

  if (!branchOwnerIds || branchOwnerIds.length === 0) {
    return res.status(200).json({
      transports: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  // Get stock requests for those branch owners
  let stockRequestQuery = { branchOwner: { $in: branchOwnerIds } };
  
  // Apply branch filter if provided
  if (branchId) {
    stockRequestQuery.branchOwner = branchId;
  }

  const stockRequests = await StockRequest.find(stockRequestQuery);
  const stockRequestIds = stockRequests.map(request => request._id);

  // Build transport query
  let transportQuery = { stockRequest: { $in: stockRequestIds } };

  // Apply status filter
  if (status && status !== 'all') {
    if (status === 'completed') {
      transportQuery.$expr = { $eq: ['$receivedQuantity', '$quantity'] };
    } else if (status === 'pending') {
      transportQuery.receivedQuantity = { $in: [0, null, undefined] };
    } else if (status === 'partial') {
      transportQuery.$and = [
        { receivedQuantity: { $gt: 0 } },
        { $expr: { $lt: ['$receivedQuantity', '$quantity'] } }
      ];
    }
  }

  // Apply search filter
  if (search) {
    const stockRequestIdsWithSearch = await StockRequest.find({
      ...stockRequestQuery,
      productName: { $regex: search, $options: 'i' }
    }).select('_id');
    
    const searchStockRequestIds = stockRequestIdsWithSearch.map(req => req._id);
    transportQuery.stockRequest = { $in: searchStockRequestIds };
  }

  // Apply date filter
  if (dateFilter && dateFilter !== 'all') {
    const now = new Date();
    let startDateFilter = new Date();
    let endDateFilter = new Date();

    switch (dateFilter) {
      case 'today':
        startDateFilter.setHours(0, 0, 0, 0);
        endDateFilter.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDateFilter.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDateFilter.setMonth(now.getMonth() - 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          startDateFilter = new Date(startDate);
          endDateFilter = new Date(endDate);
          endDateFilter.setHours(23, 59, 59, 999);
        }
        break;
      default:
        break;
    }

    if (dateFilter !== 'all') {
      transportQuery.createdAt = {
        $gte: startDateFilter,
        $lte: endDateFilter
      };
    }
  }

  // Fetch the transports with pagination
  const transports = await Transport.find(transportQuery)
    .populate({
      path: 'stockRequest',
      select: 'productName quantity branchOwner',
      populate: {
        path: 'branchOwner',
        select: 'name email',
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await Transport.countDocuments(transportQuery);

  console.log(`getTransportsByManagerId: transports count = ${transports.length}, totalItems = ${totalItems}`);

  res.status(200).json({
    transports,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

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
    .sort({ createdAt: -1 })
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
// @desc    Get transport details by brand owner ID with pagination and filtering
// @route   GET /api/transport/brandowner/:brandOwnerId
// @access  Private (Admin, BrandOwner)
const getTransportsByBrandOwner = asyncHandler(async (req, res) => {
  const { brandOwnerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { managerName, status, search, dateFilter, startDate, endDate } = req.query;

  const brandOwner = await User.findById(brandOwnerId).populate({
    path: 'assignedManagers',
    select: 'name email assignedBranchOwners'
  });

  if (!brandOwner) {
    res.status(404);
    throw new Error('Brand owner not found');
  }

  let relevantManagers = brandOwner.assignedManagers;

  // Filter by manager name if provided
  if (managerName) {
    relevantManagers = relevantManagers.filter(manager =>
      manager.name.toLowerCase().includes(managerName.toLowerCase())
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
      transports: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  // Get stock requests for those branch owners
  const stockRequestQuery = { branchOwner: { $in: branchOwnerIds } };
  const stockRequests = await StockRequest.find(stockRequestQuery);
  const stockRequestIds = stockRequests.map(request => request._id);

  // Build transport query
  let transportQuery = { stockRequest: { $in: stockRequestIds } };

  // Apply status filter
  if (status && status !== 'all') {
    if (status === 'completed') {
      transportQuery.$expr = { $eq: ['$receivedQuantity', '$quantity'] };
    } else if (status === 'pending') {
      transportQuery.receivedQuantity = { $in: [0, null, undefined] };
    } else if (status === 'partial') {
      transportQuery.$and = [
        { receivedQuantity: { $gt: 0 } },
        { $expr: { $lt: ['$receivedQuantity', '$quantity'] } }
      ];
    }
  }

  // Apply search filter
  if (search) {
    const stockRequestIdsWithSearch = await StockRequest.find({
      ...stockRequestQuery,
      productName: { $regex: search, $options: 'i' }
    }).select('_id');
    
    const searchStockRequestIds = stockRequestIdsWithSearch.map(req => req._id);
    transportQuery.stockRequest = { $in: searchStockRequestIds };
  }

  // Apply date filter
  if (dateFilter && dateFilter !== 'all') {
    const now = new Date();
    let startDateFilter = new Date();
    let endDateFilter = new Date();

    switch (dateFilter) {
      case 'today':
        startDateFilter.setHours(0, 0, 0, 0);
        endDateFilter.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDateFilter.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDateFilter.setMonth(now.getMonth() - 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          startDateFilter = new Date(startDate);
          endDateFilter = new Date(endDate);
          endDateFilter.setHours(23, 59, 59, 999);
        }
        break;
      default:
        break;
    }

    if (dateFilter !== 'all') {
      transportQuery.createdAt = {
        $gte: startDateFilter,
        $lte: endDateFilter
      };
    }
  }

  // Fetch the transports with pagination
  const transports = await Transport.find(transportQuery)
    .populate({
      path: 'stockRequest',
      select: 'productName quantity branchOwner',
      populate: {
        path: 'branchOwner',
        select: 'name email',
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await Transport.countDocuments(transportQuery);

  res.status(200).json({
    transports,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});
export {
  getTransports,
  createTransport,
  confirmReceivedTransport,
  deleteTransport,
  getTransportsByBranchOwnerId,
  getTransportsByManagerId,
  getTransportsByBrandOwner,
};