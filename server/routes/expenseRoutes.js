const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager', 'BranchOwner'), getExpenses)
  .post(protect, authorizeRoles('BranchOwner'), createExpense);

router.route('/:id')
  .put(protect, authorizeRoles('Admin', 'BrandOwner'), updateExpense)
  .delete(protect, authorizeRoles('Admin', 'BrandOwner'), deleteExpense);

module.exports = router;