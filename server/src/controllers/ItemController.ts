import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/authMiddleware';
import { Category, Condition, ItemStatus } from '../types';

export const getItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const { featured, limit, category, donorId } = req.query;

        // Helper: previne arrays no req.query (?state=SP&state=RJ => ['SP','RJ'])
        const safeParam = (p: unknown): string | undefined =>
            Array.isArray(p) ? String(p[0]) : p ? String(p) : undefined;

        const search = safeParam(req.query.search);
        const state  = safeParam(req.query.state);
        const city   = safeParam(req.query.city);

        const where: any = {
            status: ItemStatus.AVAILABLE,
            deletedAt: null,
        };

        if (category) {
            where.category = safeParam(category);
        }

        if (req.query.condition) {
            where.condition = safeParam(req.query.condition);
        }

        if (donorId) {
            where.donorId = safeParam(donorId);
            delete where.status;
        }

        // Busca insensitive — suportado pelo PostgreSQL/Neon
        if (search) {
            where.OR = [
                { title:       { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Filtro geográfico — spread preserva filtros existentes no donor
        if (state || city) {
            where.donor = { ...where.donor };
            if (state) where.donor.state = state;
            if (city)  where.donor.city  = { contains: city, mode: 'insensitive' };
        }

        const items = await prisma.item.findMany({
            where,
            take: limit ? Number(limit) : undefined,
            orderBy: { createdAt: 'desc' },
            include: { donor: { select: { name: true, city: true, state: true } } }
        });

        // Parse images JSON string back to array
        const parsedItems = items.map(item => ({
            ...item,
            images: JSON.parse(item.images)
        }));

        res.json(parsedItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getItemById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const item = await prisma.item.findUnique({
            where: { id: String(id) },
            include: { donor: { select: { id: true, name: true, city: true, state: true } } },
        });

        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        res.json({ ...item, images: JSON.parse(item.images) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, category, condition, images, quantity } = req.body;
        const donorId = req.user?.userId;

        if (!donorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const item = await prisma.item.create({
            data: {
                title,
                description,
                category: category as string,
                condition: condition as string,
                images: JSON.stringify(images || []),
                quantity: quantity ? Number(quantity) : 1,
                donorId,
            },
        });

        res.status(201).json({ ...item, images: JSON.parse(item.images) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const userId = req.user?.userId;

        const item = await prisma.item.findUnique({
            where: { id },
        });

        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        if (item.donorId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }

        // Manually delete related requests first to avoid foreign key constraints
        await prisma.donationRequest.deleteMany({
            where: { itemId: id },
        });

        await prisma.item.delete({
            where: { id },
        });

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPublicStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const itemsDonated = await prisma.item.count({ where: { status: 'DONATED' } });
        const familiesHelped = await prisma.donationRequest.count({ where: { status: 'APPROVED' } });
        
        const users = await prisma.user.findMany({ select: { city: true } });
        const uniqueCities = new Set(users.map(u => u.city?.toLowerCase().trim()).filter(Boolean));
        
        const volunteers = await prisma.user.count({ where: { isActive: true } });

        res.json({
            itemsDonated,
            familiesHelped,
            cities: uniqueCities.size,
            volunteers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { title, description, category, condition, images, quantity } = req.body;
        const donorId = req.user?.userId;

        if (!donorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const item = await prisma.item.findUnique({ where: { id } });

        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        if (item.donorId !== donorId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        if (!title || !description || !category || !condition || !images) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const updatedItem = await prisma.item.update({
            where: { id },
            data: {
                title,
                description,
                category,
                condition,
                images: JSON.stringify(images),
                quantity: quantity ? Number(quantity) : item.quantity,
            },
        });

        res.json({ ...updatedItem, images: JSON.parse(updatedItem.images) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const postReceivedPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { photoUrl } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!photoUrl) {
            res.status(400).json({ error: 'photoUrl é obrigatório' });
            return;
        }

        const item = await prisma.item.findUnique({ where: { id } });
        if (!item) {
            res.status(404).json({ error: 'Item não encontrado' });
            return;
        }

        // Apenas o beneficiário aprovado pode postar a foto
        const approvedRequest = await (prisma as any).donationRequest.findFirst({
            where: { itemId: id, beneficiaryId: userId, status: 'APPROVED' },
        });
        if (!approvedRequest) {
            res.status(403).json({ error: 'Apenas o beneficiário aprovado pode postar a foto' });
            return;
        }

        const updated = await prisma.item.update({
            where: { id },
            data: { receivedPhoto: photoUrl },
        });

        res.json({ receivedPhoto: updated.receivedPhoto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar foto' });
    }
};
