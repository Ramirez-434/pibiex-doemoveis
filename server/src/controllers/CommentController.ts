import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/authMiddleware';

export const getComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { itemId } = req.params as { itemId: string };
        const comments = await (prisma as any).comment.findMany({
            where: { itemId },
            orderBy: { createdAt: 'asc' },
            include: {
                author: { select: { id: true, name: true, avatar: true } }
            }
        });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar comentarios' });
    }
};

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { itemId } = req.params as { itemId: string };
        const { content } = req.body;
        const userId = req.user?.userId;

        if (!userId) { res.status(401).json({ error: 'Nao autorizado' }); return; }
        if (!content || !content.trim()) { res.status(400).json({ error: 'Comentario nao pode estar vazio' }); return; }
        if (content.trim().length > 500) { res.status(400).json({ error: 'Comentario muito longo (max. 500 caracteres)' }); return; }

        const item = await prisma.item.findUnique({ where: { id: itemId } });
        if (!item) { res.status(404).json({ error: 'Item nao encontrado' }); return; }

        const comment = await (prisma as any).comment.create({
            data: { content: content.trim(), itemId, authorId: userId },
            include: { author: { select: { id: true, name: true, avatar: true } } }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar comentario' });
    }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { commentId } = req.params as { commentId: string };
        const userId = req.user?.userId;

        if (!userId) { res.status(401).json({ error: 'Nao autorizado' }); return; }

        const comment = await (prisma as any).comment.findUnique({ where: { id: commentId } });
        if (!comment) { res.status(404).json({ error: 'Comentario nao encontrado' }); return; }
        if (comment.authorId !== userId) { res.status(403).json({ error: 'Voce so pode deletar seus proprios comentarios' }); return; }

        await (prisma as any).comment.delete({ where: { id: commentId } });
        res.json({ message: 'Comentario deletado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar comentario' });
    }
};
