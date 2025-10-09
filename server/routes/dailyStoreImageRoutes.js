import express from 'express';
const router = express.Router();
import {
  uploadDailyStoreImage,
  getDailyStoreImagesByBranch,
  getAllDailyStoreImages,
} from '../controllers/dailyStoreImageController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js'; // Assuming a generic upload middleware

router.route('/')
  .post(protect, authorizeRoles(['branch-owner']), upload, uploadDailyStoreImage)
  .get(protect, authorizeRoles(['admin', 'brand-owner']), getAllDailyStoreImages);

router.route('/branch/:branchId')
  .get(protect, authorizeRoles(['branch-owner', 'manager', 'brand-owner', 'admin']), getDailyStoreImagesByBranch);

export default router;