import express from 'express';
const router = express.Router();
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
  assignUser,
  getUserHierarchy
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin'), getUsers);

router.route('/role/:role')
  .get(protect, authorizeRoles('Admin', 'BrandOwner'), getUsersByRole);

router.route('/hierarchy')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getUserHierarchy);

router.route('/:id/assign')
  .put(protect, authorizeRoles('Admin', 'BrandOwner'), assignUser);

router.route('/:id')
  .get(protect, authorizeRoles('Admin'), getUserById)
  .put(protect, authorizeRoles('Admin', 'BrandOwner'), updateUser)
  .delete(protect, authorizeRoles('Admin'), deleteUser);

export default router;