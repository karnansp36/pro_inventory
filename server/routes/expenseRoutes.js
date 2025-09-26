import express from 'express';
const router = express.Router();
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getExpenses)
  .post(protect, authorizeRoles('BranchOwner'), createExpense);

router.route('/:id')
  .put(protect, authorizeRoles('Admin', 'BrandOwner'), updateExpense)
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteExpense);

export default router;