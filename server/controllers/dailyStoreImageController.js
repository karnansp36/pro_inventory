import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose'; // Import mongoose
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
    if (req.body.branchOwner) {
      if (mongoose.Types.ObjectId.isValid(req.body.branchOwner)) {
        branchOwnerId = req.body.branchOwner;
      } else {
        res.status(400);
        throw new Error('Invalid branchOwner ID');
      }
    } else {
      branchOwnerId = user._id;
    }
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

// @desc    Get daily store images by manager ID with pagination
// @route   GET /api/daily-store-images/manager/:managerId
// @access  Private (Admin, BrandOwner, Manager)
const getDailyStoreImagesByManagerId = asyncHandler(async (req, res) => {
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
      images: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  // Fetch the daily store images for the branch owners
  const images = await DailyStoreImage.find({
    branchOwner: { $in: branchOwnerIds },
  })
    .populate('branchOwner', 'name email branchName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await DailyStoreImage.countDocuments({
    branchOwner: { $in: branchOwnerIds },
  });

  res.status(200).json({
    images,
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
  });
});
// dailyStoreImageController.js - Add this function
// @desc    Get daily store images by brand owner ID with pagination and filtering
// @route   GET /api/daily-store-images/brandowner/:brandOwnerId
// @access  Private (Admin, BrandOwner)
const getDailyStoreImagesByBrandOwner = asyncHandler(async (req, res) => {
  const { brandOwnerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const managerNameFilter = req.query.managerName || '';
  const branchOwnerNameFilter = req.query.branchOwnerName || '';

  const brandOwner = await User.findById(brandOwnerId).populate({
    path: 'assignedManagers',
    select: 'name email assignedBranchOwners',
    populate: {
      path: 'assignedBranchOwners',
      select: 'name email branchName'
    }
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
      branchOwnerIds = branchOwnerIds.concat(manager.assignedBranchOwners.map(bo => bo._id));
    }
  });

  // Ensure uniqueness and convert to string IDs for filtering if needed
  branchOwnerIds = [...new Set(branchOwnerIds.map(id => id.toString()))];

  // Apply branch owner name filter if provided
  if (branchOwnerNameFilter && branchOwnerIds.length > 0) {
    const filteredBranchOwners = await User.find({
      _id: { $in: branchOwnerIds },
      name: { $regex: branchOwnerNameFilter, $options: 'i' }
    });
    branchOwnerIds = filteredBranchOwners.map(bo => bo._id.toString()); // Ensure string IDs
  }

  // Convert all branchOwnerIds to Mongoose ObjectIds for the final query
  const objectIdBranchOwnerIds = branchOwnerIds.map(id => new mongoose.Types.ObjectId(id));

  if (objectIdBranchOwnerIds.length === 0) {
    return res.status(200).json({
      images: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  const images = await DailyStoreImage.find({ branchOwner: { $in: objectIdBranchOwnerIds } })
    .populate('branchOwner', 'name email branchName')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const totalItems = await DailyStoreImage.countDocuments({ branchOwner: { $in: branchOwnerIds } });

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
  getDailyStoreImagesByManagerId,
  uploadDailyStoreImage,
  getDailyStoreImagesByBrandOwner,
};