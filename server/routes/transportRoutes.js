import express from 'express';
const router = express.Router();
import { getTransports, createTransport, confirmReceivedTransport, deleteTransport, getTransportsByBranchOwnerId } from '../controllers/transportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getTransports)
  .post(express.json(), protect, authorizeRoles('Admin', 'BrandOwner'), createTransport);

router.route('/:id/receive')
  .put(express.json(), protect, authorizeRoles('BranchOwner'), confirmReceivedTransport);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteTransport);

router.route('/branch/:branchOwnerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getTransportsByBranchOwnerId);

export default router;