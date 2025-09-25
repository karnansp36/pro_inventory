const express = require('express');
const router = express.Router();
const { getTransports, createTransport, confirmReceivedTransport, deleteTransport } = require('../controllers/transportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getTransports)
  .post(protect, authorizeRoles('Admin', 'BrandOwner'), createTransport);

router.route('/:id/receive')
  .put(protect, authorizeRoles('BranchOwner'), confirmReceivedTransport);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteTransport);

module.exports = router;