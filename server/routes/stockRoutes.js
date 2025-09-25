const express = require('express');
const router = express.Router();
const { getStockRequests, createStockRequest, approveStockRequest, deleteStockRequest } = require('../controllers/stockRequestController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getStockRequests)
  .post(protect, authorizeRoles('BranchOwner'), createStockRequest);

router.route('/:id/approve')
  .put(protect, authorizeRoles('Admin', 'BrandOwner'), approveStockRequest);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteStockRequest);

module.exports = router;