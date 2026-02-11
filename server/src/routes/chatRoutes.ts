
import { Router } from 'express';
import { sendMessage, getMessages, getConversations } from '../controllers/ChatController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, sendMessage);
router.get('/conversations', authenticateToken, getConversations);
router.get('/:requestId', authenticateToken, getMessages);

export default router;
