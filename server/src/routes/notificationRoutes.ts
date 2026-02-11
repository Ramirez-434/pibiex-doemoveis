
import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/NotificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);

export default router;
