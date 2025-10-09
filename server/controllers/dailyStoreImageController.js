import DailyStoreImage from '../models/DailyStoreImage.js';
import asyncHandler from 'express-async-handler';

// @desc    Upload daily store image
// @route   POST /api/daily-store-images
// @access  Private (Branch Owner)
const uploadDailyStoreImage = asyncHandler(async (req, res) => {
  const { date, time } = req.body;
  const { path } = req.file;

  if (!date || !time || !path) {
    res.status(400);
    throw new Error('Please include all fields: date, time, and image');
  }

  const dailyStoreImage = await DailyStoreImage.create({
    img: path,
    date,
    time,
    branch: req.user._id,
  });

  res.status(201).json(dailyStoreImage);
});

// @desc    Get daily store images for a branch
// @route   GET /api/daily-store-images/branch/:branchId
// @access  Private (Branch Owner, Manager, Brand Owner, Admin)
const getDailyStoreImagesByBranch = asyncHandler(async (req, res) => {
  const dailyStoreImages = await DailyStoreImage.find({ branch: req.params.branchId }).sort({ date: -1, time: -1 });
  res.status(200).json(dailyStoreImages);
});

// @desc    Get all daily store images (for admin/brand owner)
// @route   GET /api/daily-store-images
// @access  Private (Admin, Brand Owner)
const getAllDailyStoreImages = asyncHandler(async (req, res) => {
  const dailyStoreImages = await DailyStoreImage.find().populate('branch', 'name').sort({ date: -1, time: -1 });
  res.status(200).json(dailyStoreImages);
});

export {
  uploadDailyStoreImage,
  getDailyStoreImagesByBranch,
  getAllDailyStoreImages,
};