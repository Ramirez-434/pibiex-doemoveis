import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, updateProfile } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/profile', authenticateToken, updateProfile);

export default router;
