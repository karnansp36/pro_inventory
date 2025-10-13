import express from 'express';
const router = express.Router();
import { getStockRequests, createStockRequest, approveStockRequest, deleteStockRequest, getStockRequestsByBranchOwnerId } from '../controllers/stockRequestController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getStockRequests)
  .post(express.json(), protect, authorizeRoles('Admin', 'BranchOwner'), createStockRequest);

router.route('/:id/approve')
  .put(express.json(), protect, authorizeRoles('Admin', 'BrandOwner'), approveStockRequest);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteStockRequest);

router.route('/branch/:branchOwnerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getStockRequestsByBranchOwnerId);

export default router;