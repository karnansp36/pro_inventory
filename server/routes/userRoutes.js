const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUsersByRole, 
  assignUser, 
  getUserHierarchy 
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorizeRoles('Admin'), getUsers);

router.route('/role/:role')
  .get(protect, authorizeRoles('Admin', 'BrandOwner'), getUsersByRole);

router.route('/hierarchy')
  .get(protect, authorizeRoles('Admin', 'BrandOwner', 'Manager'), getUserHierarchy);

router.route('/:id/assign')
  .put(protect, authorizeRoles('Admin', 'BrandOwner'), assignUser);

router.route('/:id')
  .get(protect, authorizeRoles('Admin'), getUserById)
  .put(protect, authorizeRoles('Admin'), updateUser)
  .delete(protect, authorizeRoles('Admin'), deleteUser);

module.exports = router;