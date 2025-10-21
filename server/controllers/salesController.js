import asyncHandler from 'express-async-handler';
import Sales from '../models/Sales.js';
import User from '../models/User.js';

// @desc    Get all sales with pagination
// @route   GET /api/sales
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getSales = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let sales;
  let totalItems;
  
  if (user.role === 'Admin') {
    sales = await Sales.find({})
      .populate('branchOwner', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await Sales.countDocuments({});
  } else if (user.role === 'BrandOwner') {
    const branchOwners = await User.find({ assignedBrandOwner: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    sales = await Sales.find({ branchOwner: { $in: branchOwnerIds } })
      .populate('branchOwner', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await Sales.countDocuments({ branchOwner: { $in: branchOwnerIds } });
  } else if (user.role === 'Manager') {
    // Fetch sales data for branches assigned to the manager
    const managerId = req.user.id;
    const manager = await User.findById(managerId).populate('assignedBranchOwners');

    let branchOwnerIds = manager.assignedBranchOwners.map(bo => bo._id);

    let query = { branchOwner: { $in: branchOwnerIds } };
    if (req.query.branchId) {
      query.branchOwner = req.query.branchId;
    }

    sales = await Sales.find(query)
      .populate('branchOwner', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await Sales.countDocuments(query);
  } else if (user.role === 'BranchOwner') {
    sales = await Sales.find({ branchOwner: req.user.id })
      .populate('branchOwner', 'name email')
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await Sales.countDocuments({ branchOwner: req.user.id });
  } else {
    res.status(403);
    throw new Error('Not authorized to view sales');
  }

  res.status(200).json({
    sales,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
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
    date: new Date(),
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

// @desc    Get sales by manager ID with pagination
// @route   GET /api/sales/manager/:managerId
// @access  Private (Admin, BrandOwner, Manager)
const getSalesByManagerId = asyncHandler(async (req, res) => {
  const { managerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Find the manager
  const manager = await User.findById(managerId);

  if (!manager) {
    res.status(404);
    throw new Error('Manager not found');
  }

  const branchOwnerIds = manager.assignedBranchOwners;

  if (!branchOwnerIds || branchOwnerIds.length === 0) {
    return res.status(200).json({
      sales: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  // Fetch the sales data for the branch owners
  const sales = await Sales.find({
    branchOwner: { $in: branchOwnerIds },
  })
    .populate('branchOwner', 'name email')
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await Sales.countDocuments({
    branchOwner: { $in: branchOwnerIds },
  });

  res.status(200).json({
    sales,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

// @desc    Get sales by branch owner ID with pagination
// @route   GET /api/sales/branch/:branchOwnerId
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getSalesByBranchOwnerId = asyncHandler(async (req, res) => {
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
      console.log("Auth Error: BranchOwner trying to access other branch's sales.");
      res.status(403);
      throw new Error('Not authorized to view sales for other branches');
    }
  }
  // Restrict other roles to Admin, BrandOwner, and Manager
  else if (!['Admin', 'BrandOwner', 'Manager'].includes(user.role)) {
    console.log("Auth Error: User role not authorized.");
    res.status(403);
    throw new Error('Not authorized to view sales');
  }

  // For BrandOwner and Manager, ensure they are authorized to view this specific branch
  if (user.role === 'BrandOwner') {
    const branchOwner = await User.findById(branchOwnerId);
    console.log("Auth Check: BrandOwner - Found Branch Owner:", branchOwner?._id.toString());
    console.log("Auth Check: BrandOwner - Assigned Brand Owner:", branchOwner?.assignedBrandOwner?.toString());
    if (!branchOwner || branchOwner.assignedBrandOwner?.toString() !== user._id.toString()) {
      console.log("Auth Error: BrandOwner not authorized for this branch owner's sales.");
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s sales');
    }
  } else if (user.role === 'Manager') {
    const branchOwner = await User.findById(branchOwnerId);
    console.log("Auth Check: Manager - Found Branch Owner:", branchOwner?._id.toString());
    console.log("Auth Check: Manager - Assigned Manager:", branchOwner?.assignedManager?.toString());
    if (!branchOwner || !branchOwner.assignedManager?.includes(user._id.toString())) {
      console.log("Auth Error: Manager not authorized for this branch owner's sales.");
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s sales');
    }
  }

  const sales = await Sales.find({ branchOwner: branchOwnerId })
    .populate('branchOwner', 'name email')
    .sort({ date: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await Sales.countDocuments({ branchOwner: branchOwnerId });

  res.status(200).json({
    sales,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

export {
  getSales,
  createSales,
  deleteSales,
  updateSales,
  getSalesByBranchOwnerId,
  getSalesByManagerId
};