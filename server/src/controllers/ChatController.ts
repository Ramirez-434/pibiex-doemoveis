
import { Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/authMiddleware';

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { requestId, content } = req.body;
        const senderId = req.user?.userId;

        if (!senderId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const request = await prisma.donationRequest.findUnique({
            where: { id: requestId },
            include: { item: true },
        });

        if (!request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }

        // Verify that sender is either the beneficiary or the donor
        if (request.beneficiaryId !== senderId && request.item.donorId !== senderId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const message = await prisma.message.create({
            data: {
                content,
                requestId,
                senderId,
            },
        });

        // Determine recipient
        const recipientId = senderId === request.beneficiaryId ? request.item.donorId : request.beneficiaryId;

        // Create notification for recipient
        await prisma.notification.create({
            data: {
                userId: recipientId,
                title: 'Nova Mensagem',
                message: `Você recebeu uma mensagem sobre: ${request.item.title}`,
            },
        });

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { requestId } = req.params as { requestId: string };
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const request = await prisma.donationRequest.findUnique({
            where: { id: requestId },
            include: { item: true },
        });

        if (!request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }

        // Verify participation
        if (request.beneficiaryId !== userId && request.item.donorId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: { requestId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true } } },
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Find requests where user is donor (via item) or beneficiary
        const requests = await prisma.donationRequest.findMany({
            where: {
                OR: [
                    { beneficiaryId: userId },
                    { item: { donorId: userId } }
                ]
            },
            include: {
                item: {
                    include: {
                        donor: { select: { id: true, name: true } }
                    }
                },
                beneficiary: { select: { id: true, name: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                } // Get latest message for preview
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Format for frontend
        const conversations = requests.map(req => {
            const isDonor = req.item.donorId === userId;
            const otherUser = isDonor ? req.beneficiary : req.item.donor;

            return {
                id: req.id,
                itemId: req.item.id,
                item: {
                    title: req.item.title,
                    image: JSON.parse(req.item.images)[0] || null,
                },
                otherUser: {
                    id: otherUser.id,
                    name: otherUser.name
                },
                lastMessage: req.messages[0]?.content || 'Início da conversa',
                lastMessageTime: req.messages[0]?.createdAt || req.createdAt,
            };
        });

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
