import DailyStoreImage from '../models/DailyStoreImage.js';
import asyncHandler from 'express-async-handler';

// @desc Upload daily store image
// @route POST /api/daily-store-images
// @access Private (Branch Owner)
const uploadDailyStoreImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please include an image');
  }

  const imageFile = req.file;
  const imagePath = imageFile.path.replace(/\\/g, '/'); // Normalize path
  console.log('Final image path:', imagePath); // Debugging log
  const webPath = `/uploads/dailyStoreImages/${imageFile.filename}`; // Store web-accessible path
  console.log('Web-accessible path:', webPath); // Debugging log

  const newImage = await DailyStoreImage.create({
    branchOwner: req.user._id,
    img: webPath, // Store web-accessible path
  });

  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    data: newImage,
  });
});

// @desc Get daily store images for a branch
// @route GET /api/daily-store-images/branch/:branchId
// @access Private
const getDailyStoreImagesByBranch = asyncHandler(async (req, res) => {
  const dailyStoreImages = await DailyStoreImage.find({
    branchOwner: req.params.branchId,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: dailyStoreImages.length,
    data: dailyStoreImages,
  });
});

// @desc Get daily store images for the logged-in branch owner
// @route GET /api/daily-store-images/my-images
// @access Private (Branch Owner)
const getDailyStoreImagesForBranchOwner = asyncHandler(async (req, res) => {
  const dailyStoreImages = await DailyStoreImage.find({
    branchOwner: req.user._id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: dailyStoreImages.length,
    data: dailyStoreImages,
  });
});

// @desc Get all daily store images (for Admin, Brand Owner, etc.)
// @route GET /api/daily-store-images
// @access Private
const getAllDailyStoreImages = asyncHandler(async (req, res) => {
  const dailyStoreImages = await DailyStoreImage.find()
    .populate('branchOwner', 'name email role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: dailyStoreImages.length,
    data: dailyStoreImages,
  });
});

export {
  uploadDailyStoreImage,
  getDailyStoreImagesByBranch,
  getAllDailyStoreImages,
  getDailyStoreImagesForBranchOwner,
};
