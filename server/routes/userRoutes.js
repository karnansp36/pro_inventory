import express from 'express';
const router = express.Router();
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
  assignUser,
  getUserHierarchy,
  createUserByAdmin,
  updateUserProfile,
  getBranchesByManagerId,
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { combinedUpload } from '../middleware/combinedUploadMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin', 'Manager'), getUsers)
  .post(protect, authorizeRoles('Admin'), combinedUpload, createUserByAdmin);

// Simple and clean profile route
router.route('/profile')
  .put(protect, combinedUpload, updateUserProfile);

router.route('/role/:role')
  .get(protect, authorizeRoles('Admin', 'BrandOwner'), getUsersByRole);

router.route('/hierarchy')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getUserHierarchy);

router.route('/branches-by-manager/:managerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getBranchesByManagerId);

router.route('/:id/assign')
  .put(express.json(), protect, authorizeRoles('Admin', 'BrandOwner'), assignUser);

router.route('/:id')
  .get(protect, authorizeRoles('Admin', 'BranchOwner'), getUserById)
  .put(protect, authorizeRoles('Admin', 'BrandOwner'), updateUser)
  .delete(protect, authorizeRoles('Admin'), deleteUser);

export default router;