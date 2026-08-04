import { Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/authMiddleware';
import { RequestStatus, ItemStatus } from '../types';
import { sendEmail } from '../services/emailService';

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { itemId } = req.body;
        const beneficiaryId = req.user?.userId;

        if (!beneficiaryId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const item = await prisma.item.findUnique({ where: { id: itemId } });
        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        if (item.status !== ItemStatus.AVAILABLE) {
            res.status(400).json({ error: 'Item not available' });
            return;
        }

        if (item.donorId === beneficiaryId) {
            res.status(400).json({ error: 'Cannot request your own item' });
            return;
        }

        // Controle de Concorrência Otimista (Race Condition)
        const updatedItem = await prisma.item.updateMany({
            where: { 
                id: itemId, 
                status: ItemStatus.AVAILABLE,
                // Assumindo que o item.version está disponível (precisamos buscar na query acima)
            },
            data: { 
                status: ItemStatus.RESERVED,
                version: { increment: 1 }
            },
        });

        if (updatedItem.count === 0) {
            res.status(409).json({ error: 'Infelizmente, outra pessoa acabou de reservar este item.' });
            return;
        }

        const request = await prisma.donationRequest.create({
            data: {
                itemId,
                beneficiaryId,
            },
        });

        // Tentar enviar e-mail para o doador, se ele tiver email cadastrado
        const itemWithDonor = await prisma.item.findUnique({
            where: { id: itemId },
            include: { donor: true }
        });
        if (itemWithDonor && itemWithDonor.donor.email) {
            await sendEmail(
                itemWithDonor.donor.email,
                'Nova Solicitação de Doação',
                `<p>Olá ${itemWithDonor.donor.name},</p><p>Alguém acabou de solicitar o seu móvel: <b>${itemWithDonor.title}</b>!</p><p>Acesse o painel para combinar a retirada.</p>`
            );
        }

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { beneficiaryId, itemId } = req.query;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (beneficiaryId && beneficiaryId === userId) {
            const requests = await prisma.donationRequest.findMany({
                where: { beneficiaryId: String(beneficiaryId) },
                include: {
                    item: {
                        include: {
                            donor: { select: { name: true, phone: true } }
                        }
                    }
                }
            });
            res.json(requests);
            return;
        }

        if (itemId) {
            const item = await prisma.item.findUnique({ where: { id: String(itemId) } });
            if (!item || item.donorId !== userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }

            const requests = await prisma.donationRequest.findMany({
                where: { itemId: String(itemId) },
                include: { beneficiary: { select: { id: true, name: true, city: true, state: true } } }
            });
            res.json(requests);
            return;
        }

        res.status(400).json({ error: 'Missing filters' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const approveRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const request = await prisma.donationRequest.findUnique({
            where: { id },
            include: { item: true },
        });

        if (!request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }

        if (request.item.donorId !== userId) {
            res.status(403).json({ error: 'You are not the donor of this item' });
            return;
        }

        await prisma.donationRequest.update({
            where: { id },
            data: { status: RequestStatus.APPROVED },
        });

        await prisma.donationRequest.updateMany({
            where: { itemId: request.itemId, id: { not: String(id) } },
            data: { status: RequestStatus.REJECTED },
        });

        await prisma.item.update({
            where: { id: request.itemId },
            data: { status: ItemStatus.DONATED },
        });

        // Gerar Mensagem de Sistema para o Aprovado
        await prisma.message.create({
            data: {
                content: "🎉 Doação Concluída! Você foi escolhido para receber este item.",
                type: "SYSTEM",
                requestId: id,
                senderId: userId // Associado à ação do doador
            }
        });

        // Gerar Mensagens de Sistema para os Recusados
        const rejectedRequests = await prisma.donationRequest.findMany({
            where: { itemId: request.itemId, id: { not: String(id) } }
        });

        if (rejectedRequests.length > 0) {
            await prisma.message.createMany({
                data: rejectedRequests.map(req => ({
                    content: "Este item foi doado para outra pessoa. Continue explorando o catálogo!",
                    type: "SYSTEM",
                    requestId: req.id,
                    senderId: userId
                }))
            });
        }

        // Buscar email do beneficiário aprovado para notificar
        const beneficiaryUser = await prisma.user.findUnique({ where: { id: request.beneficiaryId } });
        if (beneficiaryUser && beneficiaryUser.email) {
            await sendEmail(
                beneficiaryUser.email,
                'Doação Aprovada!',
                `<p>Olá ${beneficiaryUser.name},</p><p>Sua solicitação para o móvel <b>${request.item.title}</b> foi aprovada!</p><p>Acesse o painel para entrar no chat com o doador e combinar a retirada.</p>`
            );
        }

        res.json({ message: 'Request approved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const rejectRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const request = await prisma.donationRequest.findUnique({
            where: { id },
            include: { item: true },
        });

        if (!request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }

        if (request.item.donorId !== userId) {
            res.status(403).json({ error: 'You are not the donor of this item' });
            return;
        }

        await prisma.donationRequest.update({
            where: { id },
            data: { status: RequestStatus.REJECTED },
        });

        await prisma.message.create({
            data: {
                content: "Essa foi por pouco, o item solicitado foi doado para outra pessoa.",
                type: "SYSTEM",
                requestId: id,
                senderId: userId
            }
        });

        res.json({ message: 'Request rejected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
