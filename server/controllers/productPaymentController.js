import asyncHandler from 'express-async-handler';
import ProductPayment from '../models/ProductPayment.js';
import User from '../models/User.js';

// @desc    Get all product payments with pagination and filters
// @route   GET /api/productpayments
// @access  Private (Admin, Manager)
const getProductPayments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
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

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!['Admin', 'Manager'].includes(user.role)) {
    res.status(403);
    throw new Error('Not authorized to view product payments');
  }

  let query = {};

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

  // Calculate summary statistics
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
    summary: {
      totalAmount: totalAmount[0]?.total || 0,
      totalPaid: totalPaid[0]?.total || 0,
      totalPending: totalPending[0]?.total || 0,
    }
  });
});

// @desc    Create new product payment
// @route   POST /api/productpayments
// @access  Private (Admin, Manager)
const createProductPayment = asyncHandler(async (req, res) => {
  const {
    userId,
    productName,
    numberOfPieces,
    totalAmount,
    paymentDone,
    dueDate,
    notes
  } = req.body;

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

  // Validate user exists if userId is provided
  let targetUser;
  if (userId) {
    targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(400);
      throw new Error('User not found');
    }
  }

  const productPayment = await ProductPayment.create({
    user: userId || req.user.id,
    productName,
    numberOfPieces: parseInt(numberOfPieces),
    totalAmount: parseFloat(totalAmount),
    paymentDone: paymentDone ? parseFloat(paymentDone) : 0,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    notes
  });

  const populatedPayment = await ProductPayment.findById(productPayment._id)
    .populate('user', 'name email role');

  res.status(201).json(populatedPayment);
});

// @desc    Update product payment
// @route   PUT /api/productpayments/:id
// @access  Private (Admin, Manager)
const updateProductPayment = asyncHandler(async (req, res) => {
  const productPayment = await ProductPayment.findById(req.params.id);

  if (!productPayment) {
    res.status(404);
    throw new Error('Product payment not found');
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

  const updatedProductPayment = await productPayment.save();
  const populatedPayment = await ProductPayment.findById(updatedProductPayment._id)
    .populate('user', 'name email role');

  res.status(200).json(populatedPayment);
});

// @desc    Delete product payment
// @route   DELETE /api/productpayments/:id
// @access  Private (Admin, Manager)
const deleteProductPayment = asyncHandler(async (req, res) => {
  const productPayment = await ProductPayment.findById(req.params.id);

  if (!productPayment) {
    res.status(404);
    throw new Error('Product payment not found');
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

  await productPayment.remove();
  res.status(200).json({ message: 'Product payment removed' });
});

// @desc    Get product payments by user ID
// @route   GET /api/productpayments/user/:userId
// @access  Private (Admin, Manager)
const getProductPaymentsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!['Admin', 'Manager'].includes(user.role)) {
    res.status(403);
    throw new Error('Not authorized to view product payments');
  }

  const query = { user: userId };

  const productPayments = await ProductPayment.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await ProductPayment.countDocuments(query);

  res.status(200).json({
    productPayments,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

export {
  getProductPayments,
  createProductPayment,
  updateProductPayment,
  deleteProductPayment,
  getProductPaymentsByUserId,
};