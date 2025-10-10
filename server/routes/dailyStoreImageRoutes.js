import express from 'express';
import {
  uploadDailyStoreImage,
  getDailyStoreImagesByBranch,
  getAllDailyStoreImages,
} from '../controllers/dailyStoreImageController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload, compressImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// POST (Branch Owner) - Upload image
// GET (Admin/Manager/BrandOwner) - View all
router
  .route('/')
  .post(
    protect,
    authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'),
    upload,
    compressImage,
    uploadDailyStoreImage
  )
  .get(
    protect,
    authorizeRoles('Admin', 'BrandOwner', 'Manager'),
    getAllDailyStoreImages
  );

// GET by branch
router
  .route('/branch/:branchId')
  .get(
    protect,
    authorizeRoles('BranchOwner', 'Manager', 'BrandOwner', 'Admin'),
    getDailyStoreImagesByBranch
  );

export default router;
