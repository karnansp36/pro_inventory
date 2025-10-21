import express from 'express';
const router = express.Router();
import { getStockRequests, createStockRequest, approveStockRequest, deleteStockRequest, getStockRequestsByBranchId, getStockRequestsByManagerId } from '../controllers/stockRequestController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getStockRequests)
  .post(express.json(), protect, authorizeRoles('Admin', 'BranchOwner'), createStockRequest);

router.route('/:id/approve')
  .put(express.json(), protect, authorizeRoles('Admin', 'BrandOwner'), approveStockRequest);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteStockRequest);

router.route('/branch/:branchId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getStockRequestsByBranchId);
router.route('/manager/:managerId').get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getStockRequestsByManagerId);

export default router