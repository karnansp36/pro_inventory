import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, assignedManager, assignedBrandOwner } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user (pre-save hook will hash password)
  const user = await User.create({
    name,
    email,
    password, // plain password, will be hashed automatically
    role,
    assignedManager: role === 'BranchOwner' ? assignedManager : undefined,
    assignedBrandOwner: role === 'Manager' ? assignedBrandOwner : undefined,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
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
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
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
  const users = await User.find({});
  res.json(users);
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

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
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.assignedManager = req.body.assignedManager || user.assignedManager;
  user.assignedBrandOwner = req.body.assignedBrandOwner || user.assignedBrandOwner;
  user.assignedManagers = req.body.assignedManagers || user.assignedManagers;
  user.assignedBranchOwners = req.body.assignedBranchOwners || user.assignedBranchOwners;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
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


// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
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
    if (role === 'Manager' || role === 'BranchOwner') {
      // Brand Owners can only see Managers and Branch Owners assigned to them
      query.assignedManager = user._id;
    } else {
      res.status(403);
      throw new Error('Not authorized to view these users');
    }
  } else if (user.role === 'Manager') {
    if (role === 'BranchOwner') {
      // Managers can only see their assigned Branch Owners
      query.assignedManager = user._id;
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
  const { assignedManager, assignedBrandOwner } = req.body;
  const targetUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);

  if (!targetUser || !currentUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Authorization checks
  if (currentUser.role === 'BrandOwner') {
    if (targetUser.role === 'Manager') {
      // Brand Owner can assign themselves as BrandOwner to a Manager
      targetUser.assignedBrandOwner = currentUser._id;
    } else if (targetUser.role === 'BranchOwner') {
      // Brand Owner can assign a Manager to a Branch Owner
      if (assignedManager) {
        const manager = await User.findById(assignedManager);
        if (manager && manager.role === 'Manager' && manager.assignedBrandOwner && manager.assignedBrandOwner.toString() === currentUser._id.toString()) {
          targetUser.assignedManager = assignedManager;
        } else {
          res.status(400);
          throw new Error('Invalid manager assignment');
        }
      }
    }
  } else if (currentUser.role === 'Admin') {
    // Admin can assign anyone
    if (assignedManager) {
      targetUser.assignedManager = assignedManager;
    }
    if (assignedBrandOwner) {
      targetUser.assignedBrandOwner = assignedBrandOwner;
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
    const brandOwners = await User.find({ role: 'BrandOwner' }).select('name email');
    hierarchy = await Promise.all(brandOwners.map(async (brandOwner) => {
      // Managers assigned to this BrandOwner
      const managers = await User.find({ role: 'Manager', assignedBrandOwner: brandOwner._id }).select('name email');
      const managerHierarchy = await Promise.all(managers.map(async (manager) => {
        // BranchOwners assigned to this Manager
        const branchOwners = await User.find({ role: 'BranchOwner', assignedManager: manager._id }).select('name email');
        return { ...manager.toObject(), branchOwners };
      }));
      return { ...brandOwner.toObject(), managers: managerHierarchy };
    }));
  } else if (user.role === 'BrandOwner') {
    // Brand Owner sees their Managers and their Branch Owners
    const managers = await User.find({ role: 'Manager', assignedBrandOwner: user._id }).select('name email');
    hierarchy = await Promise.all(managers.map(async (manager) => {
      const branchOwners = await User.find({ role: 'BranchOwner', assignedManager: manager._id }).select('name email');
      return { ...manager.toObject(), branchOwners };
    }));
  } else if (user.role === 'Manager') {
    // Manager sees their Branch Owners
    hierarchy = await User.find({ role: 'BranchOwner', assignedManager: user._id }).select('name email');
  }

  res.json(hierarchy);
});


export {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
  assignUser,
  getUserHierarchy,
};