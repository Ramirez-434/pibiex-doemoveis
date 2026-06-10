import { Router } from 'express';
import { prisma } from '../server';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware';

const router = Router();

// Get all users
router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get KPI Stats
router.get('/stats', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({ where: { isActive: true } });
        const totalItems = await prisma.item.count();
        
        // Famílias Ajudadas = Total de Solicitações Aprovadas
        const familiesHelped = await prisma.donationRequest.count({
            where: { status: 'APPROVED' }
        });

        // Taxa de Sucesso = (Aprovadas / Total) * 100
        const totalRequests = await prisma.donationRequest.count();
        const successRate = totalRequests > 0 
            ? Math.round((familiesHelped / totalRequests) * 100) 
            : 0;

        res.json({
            totalUsers,
            totalItems,
            familiesHelped,
            successRate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Delete user
router.delete('/users/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const id = req.params.id as string;
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Soft Delete cascade para itens do doador
        await prisma.item.updateMany({
            where: { donorId: id },
            data: { deletedAt: new Date() }
        });

        // Soft Delete do usuário e ofuscamento do email
        await prisma.user.update({
            where: { id },
            data: {
                isActive: false,
                deletedAt: new Date(),
                email: `inativo_${Date.now()}_${user.email}`
            }
        });

        res.json({ message: 'User and their items deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Delete item
router.delete('/items/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const id = req.params.id as string;
    try {
        await prisma.item.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

export default router;
