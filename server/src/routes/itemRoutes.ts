import { Router } from 'express';
import { getItems, getItemById, createItem, deleteItem } from '../controllers/ItemController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', authenticateToken, createItem);
router.delete('/:id', authenticateToken, deleteItem);

export default router;
