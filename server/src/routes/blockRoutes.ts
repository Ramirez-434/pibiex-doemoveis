import express from 'express';
import { blockUser, unblockUser, getBlockedUsers } from '../controllers/BlockController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', blockUser);
router.delete('/:blockedId', unblockUser);
router.get('/', getBlockedUsers);

export default router;
