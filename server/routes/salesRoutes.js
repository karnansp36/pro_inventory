const express = require('express');
const router = express.Router();
const { getSales, createSales, deleteSales } = require('../controllers/salesController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getSales)
  .post(protect, authorizeRoles('BranchOwner'), createSales);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteSales);

module.exports = router;