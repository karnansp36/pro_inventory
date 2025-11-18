import asyncHandler from 'express-async-handler';
import ProductPayment from '../models/ProductPayment.js';
import User from '../models/User.js';

// @desc    Get product payments for a specific user with pagination and filters
// @route   GET /api/productpayments/user/:userId
// @access  Private (Admin, Manager)
const getProductPaymentsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Get userId from URL parameter
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { 
    search, 
    status, 
    minAmount, 
    maxAmount,
    startDate,
    endDate
  } = req.query;

  const currentUser = await User.findById(req.user.id);

  if (!currentUser) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!['Admin', 'Manager'].includes(currentUser.role)) {
    res.status(403);
    throw new Error('Not authorized to view product payments');
  }

  // Validate if the target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Fetch payments for the specific user from URL parameter
  let query = { user: userId };

  // Apply filters
  if (search) {
    query.$or = [
      { productName: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (minAmount) {
    query.totalAmount = { ...query.totalAmount, $gte: parseFloat(minAmount) };
  }

  if (maxAmount) {
    query.totalAmount = { ...query.totalAmount, $lte: parseFloat(maxAmount) };
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const productPayments = await ProductPayment.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await ProductPayment.countDocuments(query);

  // Calculate summary statistics for the specific user
  const totalAmount = await ProductPayment.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const totalPaid = await ProductPayment.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$paymentDone' } } }
  ]);

  const totalPending = await ProductPayment.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$remainingBalance' } } }
  ]);

  res.status(200).json({
    productPayments,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    user: {
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role
    },
    summary: {
      totalAmount: totalAmount[0]?.total || 0,
      totalPaid: totalPaid[0]?.total || 0,
      totalPending: totalPending[0]?.total || 0,
    }
  });
});

// @desc    Get all product payments for the logged-in user (for personal dashboard)
// @route   GET /api/productpayments/my-payments
// @access  Private (Admin, Manager)
const getMyProductPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { 
    search, 
    status, 
    minAmount, 
    maxAmount,
    startDate,
    endDate
  } = req.query;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!['Admin', 'Manager'].includes(user.role)) {
    res.status(403);
    throw new Error('Not authorized to view product payments');
  }

  // Fetch payments for the logged-in user
  let query = { user: req.user.id };

  // Apply filters
  if (search) {
    query.$or = [
      { productName: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (minAmount) {
    query.totalAmount = { ...query.totalAmount, $gte: parseFloat(minAmount) };
  }

  if (maxAmount) {
    query.totalAmount = { ...query.totalAmount, $lte: parseFloat(maxAmount) };
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const productPayments = await ProductPayment.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await ProductPayment.countDocuments(query);

  // Calculate summary statistics for the user's payments only
  const totalAmount = await ProductPayment.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  const totalPaid = await ProductPayment.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$paymentDone' } } }
  ]);

  const totalPending = await ProductPayment.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$remainingBalance' } } }
  ]);

  res.status(200).json({
    productPayments,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    summary: {
      totalAmount: totalAmount[0]?.total || 0,
      totalPaid: totalPaid[0]?.total || 0,
      totalPending: totalPending[0]?.total || 0,
    }
  });
});

// @desc    Create new product payment for the logged-in user
// @route   POST /api/productpayments
// @access  Private (Admin, Manager)
const createProductPayment = asyncHandler(async (req, res) => {
  const {
    productName,
    numberOfPieces,
    totalAmount,
    paymentDone,
    dueDate,
    notes
  } = req.body;

  // Validate required fields
  if (!productName || !numberOfPieces || !totalAmount) {
    res.status(400);
    throw new Error('Please add product name, number of pieces, and total amount');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!['Admin', 'Manager'].includes(user.role)) {
    res.status(403);
    throw new Error('Not authorized to create product payments');
  }

  // Calculate remaining balance and status
  const paymentDoneValue = paymentDone ? parseFloat(paymentDone) : 0;
  const totalAmountValue = parseFloat(totalAmount);
  const remainingBalanceValue = totalAmountValue - paymentDoneValue;
  
  let statusValue = 'Pending';
  if (paymentDoneValue === 0) {
    statusValue = 'Pending';
  } else if (paymentDoneValue < totalAmountValue) {
    statusValue = 'Partial';
  } else {
    statusValue = 'Completed';
  }

  const productPayment = await ProductPayment.create({
    user: req.user.id, // Always use the authenticated user's ID
    productName,
    numberOfPieces: parseInt(numberOfPieces),
    totalAmount: totalAmountValue,
    paymentDone: paymentDoneValue,
    remainingBalance: remainingBalanceValue,
    status: statusValue,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    notes: notes || ''
  });

  const populatedPayment = await ProductPayment.findById(productPayment._id)
    .populate('user', 'name email role');

  res.status(201).json(populatedPayment);
});

// @desc    Update product payment (only if owned by the user)
// @route   PUT /api/productpayments/:id
// @access  Private (Admin, Manager)
const updateProductPayment = asyncHandler(async (req, res) => {
  const productPayment = await ProductPayment.findById(req.params.id);

  if (!productPayment) {
    res.status(404);
    throw new Error('Product payment not found');
  }

  // Check if the payment belongs to the logged-in user
  if (productPayment.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this product payment');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!['Admin', 'Manager'].includes(user.role)) {
    res.status(403);
    throw new Error('Not authorized to update product payments');
  }

  const {
    productName,
    numberOfPieces,
    totalAmount,
    paymentDone,
    dueDate,
    notes
  } = req.body;

  // Update fields if provided
  if (productName) productPayment.productName = productName;
  if (numberOfPieces) productPayment.numberOfPieces = parseInt(numberOfPieces);
  if (totalAmount) productPayment.totalAmount = parseFloat(totalAmount);
  if (paymentDone !== undefined) productPayment.paymentDone = parseFloat(paymentDone);
  if (dueDate !== undefined) productPayment.dueDate = dueDate ? new Date(dueDate) : null;
  if (notes !== undefined) productPayment.notes = notes;

  // Recalculate remaining balance and status
  productPayment.remainingBalance = productPayment.totalAmount - productPayment.paymentDone;
  
  if (productPayment.paymentDone === 0) {
    productPayment.status = 'Pending';
  } else if (productPayment.paymentDone < productPayment.totalAmount) {
    productPayment.status = 'Partial';
  } else {
    productPayment.status = 'Completed';
  }

  const updatedProductPayment = await productPayment.save();
  const populatedPayment = await ProductPayment.findById(updatedProductPayment._id)
    .populate('user', 'name email role');

  res.status(200).json(populatedPayment);
});

// @desc    Delete product payment (only if owned by the user)
// @route   DELETE /api/productpayments/:id
// @access  Private (Admin, Manager)
const deleteProductPayment = asyncHandler(async (req, res) => {
  const productPayment = await ProductPayment.findById(req.params.id);

  if (!productPayment) {
    res.status(404);
    throw new Error('Product payment not found');
  }

  // Check if the payment belongs to the logged-in user
  if (productPayment.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this product payment');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!['Admin', 'Manager'].includes(user.role)) {
    res.status(403);
    throw new Error('Not authorized to delete product payments');
  }

  await ProductPayment.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Product payment removed' });
});

export {
  getProductPaymentsByUserId, // For specific user by URL parameter
  getMyProductPayments,       // For logged-in user's own payments
  createProductPayment,
  updateProductPayment,
  deleteProductPayment,
};