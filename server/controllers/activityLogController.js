import asyncHandler from 'express-async-handler';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

// @desc    Get activity logs
// @route   GET /api/activity-logs
// @access  Private (Admin, BrandOwner)
const getActivityLogs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const { page = 1, limit = 50, userId, action } = req.query;

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (user.role !== 'Admin' && user.role !== 'BrandOwner') {
    res.status(403);
    throw new Error('Not authorized to view activity logs');
  }

  let query = {};
  
  if (userId) {
    query.user = userId;
  }
  
  if (action) {
    query.action = action;
  }

  // Brand Owners can only see logs for their hierarchy
  if (user.role === 'BrandOwner') {
    const accessibleUsers = await User.find({
      $or: [
        { assignedManager: user._id },
        { _id: user._id }
      ]
    });
    const accessibleUserIds = accessibleUsers.map(u => u._id);
    query.user = { $in: accessibleUserIds };
  }

  const logs = await ActivityLog.find(query)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await ActivityLog.countDocuments(query);

  res.json({
    logs,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  });
});

// Utility function to log activities
const logActivity = async (userId, action, resource, resourceId = null, description = '', req = null) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      resource,
      resourceId,
      description,
      ipAddress: req ? req.ip : null,
      userAgent: req ? req.get('User-Agent') : null
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export {
  getActivityLogs,
  logActivity
};