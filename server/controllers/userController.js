import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';
import multer from 'multer'; // Import multer
import { upload } from '../middleware/uploadMiddleware.js'; // Import the upload middleware
import { profileImageUpload } from '../middleware/profileImageUploadMiddleware.js'; // Import the profile image upload middleware
import { bannerImageUpload, compressBannerImage } from '../middleware/bannerImageUploadMiddleware.js';
dotenv.config();

// Helper to normalize ID fields coming from the client.
// Treat empty string or null/undefined as undefined so Mongoose doesn't try to cast them to ObjectId.
const normalizeId = (val) => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'string' && val.trim() === '') return undefined;
  return val;
};
// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password, role, assignedManager, assignedBrandOwner } = req.body;
    const profileImage = req.files && req.files['profileImage'] && req.files['profileImage'][0] ? `/uploads/profileImages/${req.files['profileImage'][0].filename}` : undefined;

    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error('Please add all required fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      profileImage,
      assignedManager: role === 'BranchOwner' ? normalizeId(assignedManager) : undefined,
      assignedBrandOwner: (role === 'Manager' || role === 'BranchOwner') ? normalizeId(assignedBrandOwner) : undefined,
      assignedManagers: role === 'BrandOwner' ? [] : undefined,
      assignedBranchOwners: role === 'Manager' ? [] : undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error); // Pass the error to the Express error handling middleware
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user and set expiration
    user.refreshToken = refreshToken;
    user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
    });
  } else {
    res.status(400);
    throw new Error('Invalid credentials');
  }
});



// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Manager') {
      query = { _id: { $in: req.user.assignedBranchOwners } };
    }
    const users = await User.find(query)
      .select('-password')
      .populate({ path: 'assignedManager', select: 'name email' })
      .populate({ path: 'assignedBrandOwner', select: 'name email' })
      .populate({ path: 'assignedManagers', select: 'name email assignedBranchOwners' })
      .populate({ path: 'assignedBranchOwners', select: 'name email' })
      .exec(); // Add .exec() to explicitly return a promise

    res.json(users);
  } catch (error) {
    console.error("Error populating users:", error);
    res.status(500).json({ message: "Error fetching users with populated fields", error: error.message });
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate({ path: 'assignedManager', select: 'name email' })
    .populate({ path: 'assignedBrandOwner', select: 'name email' })
    .populate({ path: 'assignedManagers', select: 'name email assignedBranchOwners' })
    .populate({ path: 'assignedBranchOwners', select: 'name email' });

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  profileImageUpload.single('profileImage')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected field in form data.' });
      } else {
        return res.status(400).json({ message: `Multer Error: ${err.message}` });
      }
    } else if (err) {
      if (err.message && err.message.includes('Unexpected end of form')) {
        return next(new Error('Upload Error: Malformed form data or missing file.'));
      } else {
        return next(new Error(`Upload Error: ${err.message}`));
      }
    }

    try {
      const targetUser = await User.findById(req.params.id);
      const currentUser = req.user;

      if (!targetUser) {
        res.status(404);
        throw new Error('User not found');
      }

      if (currentUser.role === 'Admin') {
        targetUser.name = req.body.name || targetUser.name;
        targetUser.email = req.body.email || targetUser.email;
        targetUser.role = req.body.role || targetUser.role;
        if (req.files && req.files['profileImage'] && req.files['profileImage'][0]) {
          targetUser.profileImage = `/uploads/profileImages/${req.files['profileImage'][0].filename}`;
        } else if (req.body.profileImage === '') {
          targetUser.profileImage = undefined;
        }

        if (req.body.assignedManager !== undefined) {
          targetUser.assignedManager = normalizeId(req.body.assignedManager);
        }
        if (req.body.assignedBrandOwner !== undefined) {
          targetUser.assignedBrandOwner = normalizeId(req.body.assignedBrandOwner);
        }
        if (req.body.assignedManagers !== undefined) {
          targetUser.assignedManagers = Array.isArray(req.body.assignedManagers) ? req.body.assignedManagers : targetUser.assignedManagers;
        }
        if (req.body.assignedBranchOwners !== undefined) {
          targetUser.assignedBranchOwners = Array.isArray(req.body.assignedBranchOwners) ? targetUser.assignedBranchOwners : targetUser.assignedBranchOwners;
        }
      } else if (currentUser.role === 'BrandOwner') {
        const isManagedUser =
          (targetUser.role === 'Manager' && targetUser.assignedBrandOwner?.toString() === currentUser._id.toString()) ||
          (targetUser.role === 'BranchOwner' && targetUser.assignedBrandOwner?.toString() === currentUser._id.toString());

        if (!isManagedUser && targetUser._id.toString() !== currentUser._id.toString()) {
          res.status(403);
          throw new Error('Not authorized to update this user');
        }

        targetUser.name = req.body.name || targetUser.name;
        targetUser.email = req.body.email || targetUser.email;

        if (targetUser._id.toString() === currentUser._id.toString()) {
          if (req.body.role && req.body.role !== targetUser.role) {
            res.status(403);
            throw new Error('Brand Owners cannot change their own role.');
          }
        } else {
          if (req.body.role && ['Manager', 'BranchOwner'].includes(req.body.role)) {
            targetUser.role = req.body.role;
          } else if (req.body.role && !['Manager', 'BranchOwner'].includes(req.body.role)) {
            res.status(403);
            throw new Error('Brand Owners can only manage Manager and Branch Owner roles.');
          }
        }

        if (targetUser.role === 'Manager' || targetUser.role === 'BranchOwner') {
          targetUser.assignedBrandOwner = currentUser._id;
        }

        if (targetUser.role === 'Manager' && req.body.assignedBranchOwners !== undefined) {
          const branchOwners = await User.find({ _id: { $in: req.body.assignedBranchOwners } });
          const validBranchOwners = branchOwners.filter(bo => bo.role === 'BranchOwner' && bo.assignedBrandOwner?.toString() === currentUser._id.toString());

          if (validBranchOwners.length !== req.body.assignedBranchOwners.length) {
            res.status(400);
            throw new Error('Invalid Branch Owner assignment for Manager');
          }
          targetUser.assignedBranchOwners = req.body.assignedBranchOwners;
        }

        if (targetUser.role === 'BranchOwner' && req.body.assignedManager !== undefined) {
          if (req.body.assignedManager === null || req.body.assignedManager === '') {
            targetUser.assignedManager = undefined;
          } else {
            const manager = await User.findById(req.body.assignedManager);
            if (manager && manager.role === 'Manager' && manager.assignedBrandOwner?.toString() === currentUser._id.toString()) {
              targetUser.assignedManager = req.body.assignedManager;
            } else {
              res.status(400);
              throw new Error('Invalid manager assignment for Branch Owner');
            }
          }
        }
      } else {
        res.status(403);
        throw new Error('Not authorized to update users');
      }

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        targetUser.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await targetUser.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        assignedManager: updatedUser.assignedManager,
        assignedBrandOwner: updatedUser.assignedBrandOwner,
      });
    } catch (error) {
      next(error);
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Update basic info
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Handle profile image
    if (req.files && req.files['profileImage']) {
      user.profileImage = `/uploads/profileImages/${req.files['profileImage'][0].filename}`;
    } else if (req.body.profileImage === '') {
      user.profileImage = undefined;
    }

    // Handle banner image
    if (req.files && req.files['bannerImage']) {
      user.bannerImage = `/uploads/bannerImages/${req.files['bannerImage'][0].filename}`;
    } else if (req.body.bannerImage === '') {
      user.bannerImage = undefined;
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Shop Information
    user.shopName = req.body.shopName !== undefined ? req.body.shopName : user.shopName;
    user.ownerName = req.body.ownerName !== undefined ? req.body.ownerName : user.ownerName;
    user.shopType = req.body.shopType !== undefined ? req.body.shopType : user.shopType;
    user.description = req.body.description !== undefined ? req.body.description : user.description;
    user.establishedYear = req.body.establishedYear !== undefined ? req.body.establishedYear : user.establishedYear;

    // Contact Information
    user.phoneNumbers = req.body.phoneNumbers !== undefined ? req.body.phoneNumbers : user.phoneNumbers;
    user.emailAddress = req.body.emailAddress !== undefined ? req.body.emailAddress : user.emailAddress;
    user.websiteLinks = req.body.websiteLinks !== undefined ? req.body.websiteLinks : user.websiteLinks;
    user.socialMediaLinks = req.body.socialMediaLinks !== undefined ? req.body.socialMediaLinks : user.socialMediaLinks;
    user.messagingLinks = req.body.messagingLinks !== undefined ? req.body.messagingLinks : user.messagingLinks;

    // Location & Address
    user.fullAddress = req.body.fullAddress !== undefined ? req.body.fullAddress : user.fullAddress;
    user.landmark = req.body.landmark !== undefined ? req.body.landmark : user.landmark;
    user.googleMapsLink = req.body.googleMapsLink !== undefined ? req.body.googleMapsLink : user.googleMapsLink;
    user.operatingArea = req.body.operatingArea !== undefined ? req.body.operatingArea : user.operatingArea;
    user.deliveryArea = req.body.deliveryArea !== undefined ? req.body.deliveryArea : user.deliveryArea;

    // Operating Details
    user.openingClosingTimes = req.body.openingClosingTimes !== undefined ? req.body.openingClosingTimes : user.openingClosingTimes;
    user.holidays = req.body.holidays !== undefined ? req.body.holidays : user.holidays;
    user.availableServices = req.body.availableServices !== undefined ? req.body.availableServices : user.availableServices;

    // Products / Services Offered
    user.productCategories = req.body.productCategories !== undefined ? req.body.productCategories : user.productCategories;
    user.productHighlights = req.body.productHighlights !== undefined ? req.body.productHighlights : user.productHighlights;
    user.serviceDetails = req.body.serviceDetails !== undefined ? req.body.serviceDetails : user.serviceDetails;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      bannerImage: updatedUser.bannerImage,
      shopName: updatedUser.shopName,
      ownerName: updatedUser.ownerName,
      shopType: updatedUser.shopType,
      description: updatedUser.description,
      establishedYear: updatedUser.establishedYear,
      phoneNumbers: updatedUser.phoneNumbers,
      emailAddress: updatedUser.emailAddress,
      websiteLinks: updatedUser.websiteLinks,
      socialMediaLinks: updatedUser.socialMediaLinks,
      messagingLinks: updatedUser.messagingLinks,
      fullAddress: updatedUser.fullAddress,
      landmark: updatedUser.landmark,
      googleMapsLink: updatedUser.googleMapsLink,
      operatingArea: updatedUser.operatingArea,
      deliveryArea: updatedUser.deliveryArea,
      openingClosingTimes: updatedUser.openingClosingTimes,
      holidays: updatedUser.holidays,
      availableServices: updatedUser.availableServices,
      productCategories: updatedUser.productCategories,
      productHighlights: updatedUser.productHighlights,
      serviceDetails: updatedUser.serviceDetails,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to update profile' 
    });
  }
});
// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


// Generate Access Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Increased expiration to 1 day
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

// @desc    Get users by role with assignments
// @route   GET /api/users/role/:role
// @access  Private (Admin, BrandOwner)
const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  let query = { role };
  
  // Filter based on user role
  if (user.role === 'BrandOwner') {
    if (role === 'Manager') {
      query = { _id: { $in: user.assignedManagers } };
    } else if (role === 'BranchOwner') {
      // Find branch owners assigned to managers who are assigned to this brand owner
      const managers = await User.find({ _id: { $in: user.assignedManagers } }).select('assignedBranchOwners');
      const assignedBranchOwnerIds = managers.flatMap(manager => manager.assignedBranchOwners);
      query = { _id: { $in: assignedBranchOwnerIds } };
    } else {
      res.status(403);
      throw new Error('Not authorized to view these users');
    }
  } else if (user.role === 'Manager') {
    if (role === 'BranchOwner') {
      query = { _id: { $in: user.assignedBranchOwners } };
    } else {
      res.status(403);
      throw new Error('Not authorized to view these users');
    }
  }

  const users = await User.find(query).select('-password');
  res.json(users);
});

// @desc    Assign Manager to Brand Owner or Branch Owner to Manager
// @route   PUT /api/users/:id/assign
// @access  Private (Admin, BrandOwner)
const assignUser = asyncHandler(async (req, res) => {
  const { assignedManagerId, assignedBranchOwnerIds } = req.body;
  const targetUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!targetUser || !currentUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Authorization checks
  if (currentUser.role === 'BrandOwner') {
    if (targetUser.role === 'Manager') {
      // Brand Owner can assign/unassign managers to themselves
      if (assignedManagerId) {
        // Assign manager to this BrandOwner
        if (!currentUser.assignedManagers.includes(targetUser._id)) {
          currentUser.assignedManagers.push(targetUser._id);
          await currentUser.save();
        }
        targetUser.assignedBrandOwner = currentUser._id;
      } else {
        // Unassign manager from this BrandOwner
        currentUser.assignedManagers = currentUser.assignedManagers.filter(
          (managerId) => managerId.toString() !== targetUser._id.toString()
        );
        await currentUser.save();
        targetUser.assignedBrandOwner = undefined;
      }
    } else if (targetUser.role === 'BranchOwner') {
      // Brand Owner can assign/unassign a Manager to a Branch Owner
      if (assignedManagerId) {
        const manager = await User.findById(assignedManagerId);
        if (manager && manager.role === 'Manager' && manager.assignedBrandOwner?.toString() === currentUser._id.toString()) {
          targetUser.assignedManager = assignedManagerId;
          // Add branch owner to manager's assignedBranchOwners if not already there
          if (!manager.assignedBranchOwners.includes(targetUser._id)) {
            manager.assignedBranchOwners.push(targetUser._id);
            await manager.save();
          }
        } else {
          res.status(400);
          throw new Error('Invalid manager assignment');
        }
      } else {
        // Unassign manager from Branch Owner
        const oldManager = await User.findById(targetUser.assignedManager);
        if (oldManager) {
          oldManager.assignedBranchOwners = oldManager.assignedBranchOwners.filter(
            (boId) => boId.toString() !== targetUser._id.toString()
          );
          await oldManager.save();
        }
        targetUser.assignedManager = undefined;
      }
    } else {
      res.status(403);
      throw new Error('Brand Owners can only assign Managers and Branch Owners');
    }
  } else if (currentUser.role === 'Admin') {
    // Admin can assign anyone
    if (assignedManagerId !== undefined) {
      targetUser.assignedManager = normalizeId(assignedManagerId);
    }
    if (assignedBranchOwnerIds !== undefined) {
      // ensure array or undefined
      targetUser.assignedBranchOwners = Array.isArray(assignedBranchOwnerIds) ? assignedBranchOwnerIds : targetUser.assignedBranchOwners;
    }
  } else {
    res.status(403);
    throw new Error('Not authorized to assign users');
  }

  await targetUser.save();
  res.json({ message: 'User assigned successfully', user: targetUser });
});

// @desc    Get assigned users hierarchy
// @route   GET /api/users/hierarchy
// @access  Private (Admin, BrandOwner, Manager)
const getUserHierarchy = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  let hierarchy = {};

  if (user.role === 'Admin') {
    // Admin sees entire hierarchy
    const brandOwners = await User.find({ role: 'BrandOwner' }).select('name email assignedManagers');
    hierarchy = await Promise.all(brandOwners.map(async (brandOwner) => {
      const managers = await User.find({ _id: { $in: brandOwner.assignedManagers } }).select('name email assignedBranchOwners');
      const managerHierarchy = await Promise.all(managers.map(async (manager) => {
        const branchOwners = await User.find({ _id: { $in: manager.assignedBranchOwners } }).select('name email');
        return { ...manager.toObject(), branchOwners };
      }));
      return { ...brandOwner.toObject(), managers: managerHierarchy };
    }));
  } else if (user.role === 'BrandOwner') {
    const managers = await User.find({ _id: { $in: user.assignedManagers } }).select('name email assignedBranchOwners');
    hierarchy = await Promise.all(managers.map(async (manager) => {
      const branchOwners = await User.find({ _id: { $in: manager.assignedBranchOwners } }).select('name email');
      return { ...manager.toObject(), branchOwners };
    }));
  } else if (user.role === 'Manager') {
    hierarchy = await User.find({ _id: { $in: user.assignedBranchOwners } }).select('name email');
  }

  res.json(hierarchy);
});

// @desc    Create user by Admin (protected)
// @route   POST /api/users/
// @access  Private/Admin
const createUserByAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, password, role, assignedManager, assignedBrandOwner } = req.body;
    const profileImage = req.file ? `/uploads/profileImages/${req.file.filename}` : undefined;

    if (!name || !email || !role) {
      res.status(400);
      throw new Error('Please add all required fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password: password || Math.random().toString(36).slice(-8),
      role,
      profileImage,
      assignedManager: role === 'BranchOwner' ? normalizeId(assignedManager) : undefined,
      assignedBrandOwner: (role === 'Manager' || role === 'BranchOwner') ? normalizeId(assignedBrandOwner) : undefined,
      assignedManagers: role === 'BrandOwner' ? [] : undefined,
      assignedBranchOwners: role === 'Manager' ? [] : undefined,
    });

    if (user) {
      res.status(201).json(user);
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
});


export {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  // Admin create (no token)
  createUserByAdmin,
  getUsersByRole,
  assignUser,
  getUserHierarchy,
  updateUserProfile,
  refreshAccessToken,
  logoutUser,
  generateRefreshToken, // Export for testing if needed, but not for direct route use
  getBranchesByManagerId,
};

// @desc    Get branches assigned to a specific manager
// @route   GET /api/users/branches-by-manager/:managerId
// @access  Private (Manager, Admin, BrandOwner)
const getBranchesByManagerId = asyncHandler(async (req, res) => {
  const { managerId } = req.params;
  const currentUser = req.user;

  // Ensure the current user is authorized to view these branches
  if (currentUser.role === 'Manager' && currentUser._id.toString() !== managerId) {
    res.status(403);
    throw new Error('Not authorized to view branches for other managers');
  }

  const manager = await User.findById(managerId).populate({
    path: 'assignedBranchOwners',
    select: 'name email shopName fullAddress phoneNumbers', // Select relevant branch owner fields
  });

  if (!manager) {
    res.status(404);
    throw new Error('Manager not found');
  }

  if (manager.role !== 'Manager') {
    res.status(400);
    throw new Error('User is not a manager');
  }

  res.status(200).json(manager.assignedBranchOwners);
});

// @desc    Refresh Access Token
// @route   POST /api/users/refresh-token
// @access  Public
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error('No refresh token found');
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.status(403);
    throw new Error('Invalid refresh token');
  }

  // Check if refresh token has expired
  if (user.refreshTokenExpires < Date.now()) {
    user.refreshToken = undefined;
    user.refreshTokenExpires = undefined;
    await user.save();
    res.status(403);
    throw new Error('Refresh token expired');
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) {
      res.status(403);
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = generateToken(user._id);

    res.json({
      token: newAccessToken,
    });
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.refreshToken = undefined;
    user.refreshTokenExpires = undefined;
    await user.save();
  }

  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});