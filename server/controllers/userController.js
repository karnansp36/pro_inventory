import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

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
    assignedManager: role === 'BranchOwner' ? normalizeId(assignedManager) : undefined,
    assignedBrandOwner: (role === 'Manager' || role === 'BranchOwner') ? normalizeId(assignedBrandOwner) : undefined,
    assignedManagers: role === 'BrandOwner' ? [] : undefined, // Initialize for BrandOwner
    assignedBranchOwners: role === 'Manager' ? [] : undefined, // Initialize for Manager
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
  const users = await User.find({})
    .select('-password')
    .populate({ path: 'assignedManager', select: 'name email' })
    .populate({ path: 'assignedBrandOwner', select: 'name email' })
    .populate({ path: 'assignedManagers', select: 'name email assignedBranchOwners' })
    .populate({ path: 'assignedBranchOwners', select: 'name email' });
  res.json(users);
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
const updateUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  const currentUser = req.user; // User making the request

  if (!targetUser) {
    res.status(404);
    throw new Error('User not found');
  }

  // Admin can update any field
  if (currentUser.role === 'Admin') {
    targetUser.name = req.body.name || targetUser.name;
    targetUser.email = req.body.email || targetUser.email;
    targetUser.role = req.body.role || targetUser.role;

    // Normalize assignment fields to avoid setting empty strings
    if (req.body.assignedManager !== undefined) {
      targetUser.assignedManager = normalizeId(req.body.assignedManager);
    }
    if (req.body.assignedBrandOwner !== undefined) {
      targetUser.assignedBrandOwner = normalizeId(req.body.assignedBrandOwner);
    }
    if (req.body.assignedManagers !== undefined) {
      // ensure it's an array (or set to undefined)
      targetUser.assignedManagers = Array.isArray(req.body.assignedManagers) ? req.body.assignedManagers : targetUser.assignedManagers;
    }
    if (req.body.assignedBranchOwners !== undefined) {
      targetUser.assignedBranchOwners = Array.isArray(req.body.assignedBranchOwners) ? req.body.assignedBranchOwners : targetUser.assignedBranchOwners;
    }
  }
  // Brand Owner can manage Managers and Branch Owners under their hierarchy
  else if (currentUser.role === 'BrandOwner') {
    // Brand Owner can only update users they manage
    const isManagedUser =
      (targetUser.role === 'Manager' && targetUser.assignedBrandOwner?.toString() === currentUser._id.toString()) ||
      (targetUser.role === 'BranchOwner' && targetUser.assignedBrandOwner?.toString() === currentUser._id.toString());

    if (!isManagedUser && targetUser._id.toString() !== currentUser._id.toString()) { // Allow BrandOwner to update their own profile
      res.status(403);
      throw new Error('Not authorized to update this user');
    }

    targetUser.name = req.body.name || targetUser.name;
    targetUser.email = req.body.email || targetUser.email;

    // Brand Owner can update their own role or assign Manager/BranchOwner roles
    if (targetUser._id.toString() === currentUser._id.toString()) {
      // Brand Owner can update their own profile, but not change their role
      if (req.body.role && req.body.role !== targetUser.role) {
        res.status(403);
        throw new Error('Brand Owners cannot change their own role.');
      }
    } else {
      // Brand Owner can update roles of Manager/BranchOwner
      if (req.body.role && ['Manager', 'BranchOwner'].includes(req.body.role)) {
        targetUser.role = req.body.role;
      } else if (req.body.role && !['Manager', 'BranchOwner'].includes(req.body.role)) {
        res.status(403);
        throw new Error('Brand Owners can only manage Manager and Branch Owner roles.');
      }
    }

    // Automatically assign BrandOwner to the current BrandOwner if creating/updating Manager/BranchOwner
    if (targetUser.role === 'Manager' || targetUser.role === 'BranchOwner') {
      targetUser.assignedBrandOwner = currentUser._id;
    }

    // If updating a Manager, allow assigning/unassigning Branch Owners
    if (targetUser.role === 'Manager' && req.body.assignedBranchOwners !== undefined) {
      const branchOwners = await User.find({ _id: { $in: req.body.assignedBranchOwners } });
      const validBranchOwners = branchOwners.filter(bo => bo.role === 'BranchOwner' && bo.assignedBrandOwner?.toString() === currentUser._id.toString());

      if (validBranchOwners.length !== req.body.assignedBranchOwners.length) {
        res.status(400);
        throw new Error('Invalid Branch Owner assignment for Manager');
      }
      targetUser.assignedBranchOwners = req.body.assignedBranchOwners;
    }

    // If updating a BranchOwner, allow assigning/unassigning a Manager
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
    assignedManager: updatedUser.assignedManager,
    assignedBrandOwner: updatedUser.assignedBrandOwner,
  });
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
const createUserByAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role, assignedManager, assignedBrandOwner } = req.body;

  if (!name || !email || !role) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user; password will be hashed in pre-save hook
  const user = await User.create({
    name,
    email,
    password: password || Math.random().toString(36).slice(-8),
    role,
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
};