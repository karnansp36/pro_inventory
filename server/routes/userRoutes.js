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
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { profileImageUpload } from '../middleware/profileImageUploadMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin', 'Manager'), getUsers)
  .post(protect, authorizeRoles('Admin'), profileImageUpload.single('profileImage'), createUserByAdmin);

router.route('/profile')
  .put(protect, profileImageUpload.fields([{ name: 'profileImage', maxCount: 1 }]), updateUserProfile);

router.route('/role/:role')
  .get(protect, authorizeRoles('Admin', 'BrandOwner'), getUsersByRole);

router.route('/hierarchy')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getUserHierarchy);

router.route('/:id/assign')
  .put(express.json(), protect, authorizeRoles('Admin', 'BrandOwner'), assignUser);

router.route('/:id')
  .get(protect, authorizeRoles('Admin', 'BranchOwner'), getUserById)
  .put(protect, authorizeRoles('Admin', 'BrandOwner'), updateUser)
  .delete(protect, authorizeRoles('Admin'), deleteUser);

export default router;