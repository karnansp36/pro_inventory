import express from 'express';
const router = express.Router();
import { getSales, createSales, deleteSales } from '../controllers/salesController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getSales)
  .post(express.json(), protect, authorizeRoles('Admin', 'BrandOwner', 'BranchOwner'), createSales);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteSales);

export default router;