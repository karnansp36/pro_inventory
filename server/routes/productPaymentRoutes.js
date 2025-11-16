import express from 'express';
const router = express.Router();
import { 
  getProductPayments, 
  createProductPayment, 
  updateProductPayment, 
  deleteProductPayment,
  getProductPaymentsByUserId 
} from '../controllers/productPaymentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorizeRoles('Admin', 'Manager'), getProductPayments)
  .post(express.json(), protect, authorizeRoles('Admin', 'Manager'), createProductPayment);

router.route('/:id')
  .put(express.json(), protect, authorizeRoles('Admin', 'Manager'), updateProductPayment)
  .delete(protect, authorizeRoles('Admin', 'Manager'), deleteProductPayment);

router.route('/user/:userId')
  .get(protect, authorizeRoles('Admin', 'Manager'), getProductPaymentsByUserId);

export default router;