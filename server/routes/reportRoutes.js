import express from 'express';
const router = express.Router();
import { getSalesReport, getExpenseReport, getStockRequestReport } from '../controllers/reportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/sales')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getSalesReport);

router.route('/expenses')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getExpenseReport);

router.route('/stockrequests')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getStockRequestReport);

export default router;