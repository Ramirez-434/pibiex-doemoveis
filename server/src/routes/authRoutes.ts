import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, updateProfile, googleLogin } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/profile', authenticateToken, updateProfile);

export default router;
