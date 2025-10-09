import express from 'express';
const router = express.Router();
import { getActivityLogs } from '../controllers/activityLogController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.get('/', express.json(), protect, authorizeRoles('Admin', 'BrandOwner'), getActivityLogs);

export default router;