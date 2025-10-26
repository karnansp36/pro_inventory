import express from 'express';
import { createDailyReport, getDailyReportsByBranch } from '../controllers/dailyReportController.js';

const router = express.Router();
router.post('/', createDailyReport);
router.get('/branch/:branchId', getDailyReportsByBranch);

export default router;
