import { Router } from 'express';
import { createRequest, getRequests, approveRequest, rejectRequest } from '../controllers/RequestController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createRequest);
router.get('/', authenticateToken, getRequests);
router.patch('/:id/approve', authenticateToken, approveRequest);
router.patch('/:id/reject', authenticateToken, rejectRequest);

export default router;
