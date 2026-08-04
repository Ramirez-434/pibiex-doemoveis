"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ItemController_1 = require("../controllers/ItemController");
const CommentController_1 = require("../controllers/CommentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', ItemController_1.getItems);
router.get('/stats/public', ItemController_1.getPublicStats);
router.get('/:id', ItemController_1.getItemById);
router.post('/', authMiddleware_1.authenticateToken, ItemController_1.createItem);
router.put('/:id', authMiddleware_1.authenticateToken, ItemController_1.updateItem);
router.delete('/:id', authMiddleware_1.authenticateToken, ItemController_1.deleteItem);
// Foto pós-doação
router.patch('/:id/received-photo', authMiddleware_1.authenticateToken, ItemController_1.postReceivedPhoto);
// Comentários
router.get('/:itemId/comments', CommentController_1.getComments);
router.post('/:itemId/comments', authMiddleware_1.authenticateToken, CommentController_1.createComment);
router.delete('/comments/:commentId', authMiddleware_1.authenticateToken, CommentController_1.deleteComment);
exports.default = router;
