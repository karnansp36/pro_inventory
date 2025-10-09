import express from 'express';
const router = express.Router();
import {
  exportSalesToExcel,
  exportExpensesToExcel,
  exportSalesToPDF,
  exportToCSV
} from '../controllers/exportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.get('/sales/excel', express.json(), protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportSalesToExcel);
router.get('/expenses/excel', express.json(), protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportExpensesToExcel);
router.get('/sales/pdf', express.json(), protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportSalesToPDF);
router.get('/:type/csv', express.json(), protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportToCSV);

export default router;