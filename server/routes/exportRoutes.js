const express = require('express');
const router = express.Router();
const { 
  exportSalesToExcel, 
  exportExpensesToExcel, 
  exportSalesToPDF, 
  exportToCSV 
} = require('../controllers/exportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/sales/excel', protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportSalesToExcel);
router.get('/expenses/excel', protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportExpensesToExcel);
router.get('/sales/pdf', protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportSalesToPDF);
router.get('/:type/csv', protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), exportToCSV);

module.exports = router;