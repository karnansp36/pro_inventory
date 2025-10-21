import asyncHandler from 'express-async-handler';
import DailyStoreImage from '../models/DailyStoreImage.js';
import User from '../models/User.js';

// @desc    Get daily store images for branch owner (their own images only) with pagination
// @route   GET /api/daily-store-images/my-images
// @access  Private (BranchOwner)
const getDailyStoreImagesForBranchOwner = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'BranchOwner') {
    res.status(403);
    throw new Error('Only branch owners can access their images');
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Only fetch images where branchOwner matches the logged-in user's ID
  const images = await DailyStoreImage.find({ branchOwner: user._id })
    .populate('branchOwner', 'name email branchName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await DailyStoreImage.countDocuments({ branchOwner: user._id });

  res.status(200).json({
    images,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

// @desc    Upload daily store image (only for branch owner's own branch)
// @route   POST /api/daily-store-images
// @access  Private (Admin, BranchOwner)
const uploadDailyStoreImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  let branchOwnerId;
  
  // Branch owners can only upload to their own branch
  if (user.role === 'BranchOwner') {
    branchOwnerId = user._id;
  } else if (user.role === 'Admin') {
    // Admin can specify branch owner, otherwise use their own
    branchOwnerId = req.body.branchOwner || user._id;
  } else {
    res.status(403);
    throw new Error('Not authorized to upload images');
  }

  const image = await DailyStoreImage.create({
    branchOwner: branchOwnerId,
    img: `/uploads/dailyStoreImages/${req.file.filename}`,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });

  const populatedImage = await DailyStoreImage.findById(image._id)
    .populate('branchOwner', 'name email branchName');

  res.status(201).json(populatedImage);
});

// @desc    Get daily store images by specific branch ID with pagination
// @route   GET /api/daily-store-images/branch/:branchId
// @access  Private (Admin, BrandOwner, Manager, BranchOwner)
const getDailyStoreImagesByBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  // Authorization checks
  if (user.role === 'BranchOwner') {
    // Branch owners can only view their own images
    if (user._id.toString() !== branchId) {
      res.status(403);
      throw new Error('Not authorized to view images for other branches');
    }
  } else if (user.role === 'BrandOwner') {
    // Brand owners can only view images from their assigned branches
    const branchOwner = await User.findById(branchId);
    if (!branchOwner || branchOwner.assignedBrandOwner?.toString() !== user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s images');
    }
  } else if (user.role === 'Manager') {
    // Managers can only view images from their assigned branches
    const branchOwner = await User.findById(branchId);
    if (!branchOwner || !branchOwner.assignedManager?.includes(user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to view this branch owner\'s images');
    }
  } else if (user.role !== 'Admin') {
    res.status(403);
    throw new Error('Not authorized to view daily store images');
  }

  // Fetch images only for the specified branch ID
  const images = await DailyStoreImage.find({ branchOwner: branchId })
    .populate('branchOwner', 'name email branchName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await DailyStoreImage.countDocuments({ branchOwner: branchId });

  res.status(200).json({
    images,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

// @desc    Get all daily store images with pagination (for admin/brand owner/manager)
// @route   GET /api/daily-store-images
// @access  Private (Admin, BrandOwner, Manager)
const getAllDailyStoreImages = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let images;
  let totalItems;

  if (user.role === 'Admin') {
    // Admin can see all images
    images = await DailyStoreImage.find({})
      .populate('branchOwner', 'name email branchName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await DailyStoreImage.countDocuments({});
  } else if (user.role === 'BrandOwner') {
    // Brand owners can only see images from their assigned branches
    const branchOwners = await User.find({ assignedBrandOwner: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    images = await DailyStoreImage.find({ branchOwner: { $in: branchOwnerIds } })
      .populate('branchOwner', 'name email branchName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await DailyStoreImage.countDocuments({ branchOwner: { $in: branchOwnerIds } });
  } else if (user.role === 'Manager') {
    // Managers can only see images from their assigned branches
    const branchOwners = await User.find({ assignedManager: user._id, role: 'BranchOwner' });
    const branchOwnerIds = branchOwners.map(owner => owner._id);
    images = await DailyStoreImage.find({ branchOwner: { $in: branchOwnerIds } })
      .populate('branchOwner', 'name email branchName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    totalItems = await DailyStoreImage.countDocuments({ branchOwner: { $in: branchOwnerIds } });
  } else {
    res.status(403);
    throw new Error('Not authorized to view all daily store images');
  }

  res.status(200).json({
    images,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});

export {
  getAllDailyStoreImages,
  getDailyStoreImagesByBranch,
  getDailyStoreImagesForBranchOwner,
  uploadDailyStoreImage,
};