import express from 'express';
const router = express.Router();
import { 
  getSales, 
  createSales, 
  deleteSales, 
  updateSales, 
  getSalesByBranchOwnerId,
  getSalesByManagerId,
  getSalesByBrandOwner
} from '../controllers/salesController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin'), getSales)
  .post(express.json(), protect, authorizeRoles('Admin', 'BrandOwner', 'BranchOwner'), createSales);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteSales)
  .put(express.json(), protect, authorizeRoles('Admin', 'BrandOwner'), updateSales);

router.route('/branch/:branchOwnerId')
  .get(protect, authorizeRoles('Admin', 'BranchOwner', 'BrandOwner', 'Manager'), getSalesByBranchOwnerId);

router.route('/manager/:managerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getSalesByManagerId);

router.route('/brandowner/:brandOwnerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner'), getSalesByBrandOwner);

export default router;