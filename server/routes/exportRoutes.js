import express from 'express';
const router = express.Router();
import {
  exportSalesToExcel,
  exportExpensesToExcel,
  exportSalesToPDF,
  exportToCSV
} from '../controllers/exportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.get('/sales/excel', protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportSalesToExcel);
router.get('/expenses/excel', protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportExpensesToExcel);
router.get('/sales/pdf', protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportSalesToPDF);
router.get('/:type/csv', protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportToCSV);

export default router;