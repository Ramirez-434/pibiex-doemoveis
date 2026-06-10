import { Router } from 'express';
import { getItems, getItemById, createItem, deleteItem, getPublicStats } from '../controllers/ItemController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getItems);
router.get('/stats/public', getPublicStats);
router.get('/:id', getItemById);
router.post('/', authenticateToken, createItem);
router.delete('/:id', authenticateToken, deleteItem);

export default router;
