import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const blockUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const blockerId = req.user?.userId;
        const { blockedId } = req.body;

        if (!blockerId || !blockedId) {
            res.status(400).json({ error: 'IDs inválidos' });
            return;
        }

        if (blockerId === blockedId) {
            res.status(400).json({ error: 'Você não pode bloquear a si mesmo' });
            return;
        }

        // Verifica se já existe bloqueio
        const existingBlock = await prisma.blockedUser.findUnique({
            where: {
                blockerId_blockedId: { blockerId, blockedId }
            }
        });

        if (existingBlock) {
            res.status(400).json({ error: 'Usuário já está bloqueado' });
            return;
        }

        await prisma.blockedUser.create({
            data: { blockerId, blockedId }
        });

        res.status(201).json({ message: 'Usuário bloqueado com sucesso' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const unblockUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const blockerId = req.user?.userId;
        const { blockedId } = req.params;

        if (!blockerId || !blockedId) {
            res.status(400).json({ error: 'IDs inválidos' });
            return;
        }

        const existingBlock = await prisma.blockedUser.findUnique({
            where: {
                blockerId_blockedId: { blockerId, blockedId }
            }
        });

        if (!existingBlock) {
            res.status(404).json({ error: 'Bloqueio não encontrado' });
            return;
        }

        await prisma.blockedUser.delete({
            where: {
                blockerId_blockedId: { blockerId, blockedId }
            }
        });

        res.json({ message: 'Usuário desbloqueado com sucesso' });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

export const getBlockedUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const blockerId = req.user?.userId;

        if (!blockerId) {
            res.status(401).json({ error: 'Não autorizado' });
            return;
        }

        const blocks = await prisma.blockedUser.findMany({
            where: { blockerId },
            include: {
                blocked: { select: { id: true, name: true, avatar: true } }
            }
        });

        res.json(blocks);
    } catch (error) {
        console.error('Error fetching blocked users:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
