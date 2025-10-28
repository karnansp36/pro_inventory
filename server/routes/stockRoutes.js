import express from 'express';
const router = express.Router();
import { getStockRequests, createStockRequest, approveStockRequest, deleteStockRequest, getStockRequestsByBranchId, getStockRequestsByManagerId, getStockRequestsByBrandOwner, rejectStockRequest } from '../controllers/stockRequestController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin'), getStockRequests)
  .post(express.json(), protect, authorizeRoles('Admin', 'BranchOwner', 'Manager'), createStockRequest);

router.route('/:id/approve')
  .put(express.json(), protect, authorizeRoles('Admin', 'BrandOwner','Manager'), approveStockRequest);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteStockRequest);

router.route('/:id/reject')
  .put(protect, authorizeRoles('Admin', 'BrandOwner','Manager'), rejectStockRequest);
router.route('/branch/:branchOwnerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getStockRequestsByBranchId);
router.route('/manager/:managerId').get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getStockRequestsByManagerId);

router.route('/brandowner/:brandOwnerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner'), getStockRequestsByBrandOwner);



export default router