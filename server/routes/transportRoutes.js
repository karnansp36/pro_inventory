import express from 'express';
const router = express.Router();
import { getTransports, createTransport, confirmReceivedTransport, deleteTransport } from '../controllers/transportController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getTransports)
  .post(protect, authorizeRoles('Admin', 'BrandOwner'), createTransport);

router.route('/:id/receive')
  .put(protect, authorizeRoles('BranchOwner'), confirmReceivedTransport);

router.route('/:id')
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteTransport);

export default router;