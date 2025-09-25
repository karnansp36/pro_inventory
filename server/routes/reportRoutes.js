const express = require('express');
const router = express.Router();
const { getSalesReport, getExpenseReport, getStockRequestReport } = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/sales')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getSalesReport);

router.route('/expenses')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getExpenseReport);

router.route('/stockrequests')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getStockRequestReport);

module.exports = router;