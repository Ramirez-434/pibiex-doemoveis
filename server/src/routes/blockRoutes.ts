import express from 'express';
import { blockUser, unblockUser, getBlockedUsers } from '../controllers/BlockController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.post('/', blockUser);
router.delete('/:blockedId', unblockUser);
router.get('/', getBlockedUsers);

export default router;
