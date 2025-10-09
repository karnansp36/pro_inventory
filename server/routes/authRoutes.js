import express from 'express';
const router = express.Router();
import { registerUser, loginUser, getMe, refreshAccessToken, logoutUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', express.json(), loginUser);
router.get('/me', protect, getMe);
router.post('/refresh-token', express.json(), refreshAccessToken);
router.post('/logout', protect, logoutUser);

export default router;