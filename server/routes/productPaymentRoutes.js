import express from 'express';
const router = express.Router();
import { 
  getProductPaymentsByUserId, 
  getMyProductPayments,
  createProductPayment, 
  updateProductPayment, 
  deleteProductPayment
} from '../controllers/productPaymentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

// Get payments for a specific user by user ID from URL parameter
router.route('/user/:userId')
  .get(protect, authorizeRoles('Admin', 'Manager'), getProductPaymentsByUserId);

// Get payments for the logged-in user
router.route('/my-payments')
  .get(protect, authorizeRoles('Admin', 'Manager'), getMyProductPayments);

// Create new payment (always for logged-in user)
router.route('/')
  .post(express.json(), protect, authorizeRoles('Admin', 'Manager'), createProductPayment);

// Update and delete payments (only owned by logged-in user)
router.route('/:id')
  .put(express.json(), protect, authorizeRoles('Admin', 'Manager'), updateProductPayment)
  .delete(protect, authorizeRoles('Admin', 'Manager'), deleteProductPayment);

export default router;