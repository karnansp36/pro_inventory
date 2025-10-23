import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  uploadDailyStoreImage,
  getDailyStoreImagesByBranch,
  getAllDailyStoreImages,
  getDailyStoreImagesForBranchOwner,
  getDailyStoreImagesByManagerId,
  getDailyStoreImagesByBrandOwner,
  
} from '../controllers/dailyStoreImageController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload, compressImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add this to your routes for testing
router.get('/test-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../uploads/dailyStoreImages', filename);
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ message: 'Image not found', path: imagePath });
  }
});

// POST (Branch Owner) - Upload image
// GET (Admin/Manager/BrandOwner) - View all
router
  .route('/')
  .post(
    protect,
    authorizeRoles('Admin', 'BranchOwner'), // Only Admin and BranchOwner can upload
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

router
  .route('/my-images')
  .get(protect, authorizeRoles('BranchOwner'), getDailyStoreImagesForBranchOwner);

// Add route for manager transports
router.route('/manager/:managerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getDailyStoreImagesByManagerId);
// dailyStoreImageRoutes.js - Add this route
router.route('/brandowner/:brandOwnerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner'), getDailyStoreImagesByBrandOwner);
export default router;
