import express from 'express';
const router = express.Router();
import { registerUser, loginUser, getMe, refreshAccessToken, logoutUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', protect, logoutUser);

export default router;