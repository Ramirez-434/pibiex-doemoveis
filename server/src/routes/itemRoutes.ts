import { Router } from 'express';
import { getItems, getItemById, createItem, deleteItem, getPublicStats, updateItem, postReceivedPhoto } from '../controllers/ItemController';
import { getComments, createComment, deleteComment } from '../controllers/CommentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getItems);
router.get('/stats/public', getPublicStats);
router.get('/:id', getItemById);
router.post('/', authenticateToken, createItem);
router.put('/:id', authenticateToken, updateItem);
router.delete('/:id', authenticateToken, deleteItem);

// Foto pós-doação
router.patch('/:id/received-photo', authenticateToken, postReceivedPhoto);

// Comentários
router.get('/:itemId/comments', getComments);
router.post('/:itemId/comments', authenticateToken, createComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

export default router;
