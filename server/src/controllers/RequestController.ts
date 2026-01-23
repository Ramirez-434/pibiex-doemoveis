import { Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/authMiddleware';
import { RequestStatus, ItemStatus } from '../types';

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

        const request = await prisma.donationRequest.create({
            data: {
                itemId,
                beneficiaryId,
            },
        });

        await prisma.item.update({
            where: { id: itemId },
            data: { status: ItemStatus.PENDING },
        });

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

        res.json({ message: 'Request approved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
