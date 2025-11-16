import express from 'express';
import { 
  createDailyReport, 
  getDailyReportsByBranch, 
  updateDailyReport, 
  deleteDailyReport, 
  getDailyReportById 
} from '../controllers/dailyReportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createDailyReport);
router.get('/branch/:branchId', protect, getDailyReportsByBranch);
router.get('/:id', protect, getDailyReportById);
router.put('/:id', protect, updateDailyReport);
router.delete('/:id', protect, deleteDailyReport);

export default router;