import express from 'express';
const router = express.Router();
import { getExpenses, createExpense, updateExpense, deleteExpense, getExpensesByManagerId, getExpensesByBranchOwnerId, getExpensesByBranchOwners } from '../controllers/expenseController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';


router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getExpenses)
  .post(express.json(), protect, authorizeRoles('Admin', 'BrandOwner', 'BranchOwner'), createExpense);

router.route('/:id')
  .put(express.json(), protect, authorizeRoles('Admin', 'BrandOwner'), updateExpense)
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteExpense);

router.route('/manager/:managerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getExpensesByManagerId);

router.route('/branch-owner/:branchOwnerId')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getExpensesByBranchOwnerId);

router.route('/branch-owners')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getExpensesByBranchOwners);

export default router;