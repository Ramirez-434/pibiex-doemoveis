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

// Get Dashboard Summary (BFF Pattern)
router.get('/dashboard/summary', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Inicio do mes de 6 meses atras
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const [
            recentItems,
            itemsByStatus,
            totalUsers,
            totalActiveItems,
            approvedRequests,
            totalRequests
        ] = await prisma.$transaction([
            // 1. Itens para o Gráfico de Barras (últimos 6 meses, ignorando deletados)
            prisma.item.findMany({
                where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
                select: { createdAt: true }
            }),
            // 2. Gráfico de Rosca (Status dos Itens, ignorando deletados)
            prisma.item.groupBy({
                by: ['status'],
                _count: true,
                where: { deletedAt: null },
                orderBy: { status: 'asc' }
            }),
            // 3. Usuários Ativos (Ignorando soft deletes)
            prisma.user.count({ where: { isActive: true } }),
            // 4. Itens Disponíveis (Ignorando deletados)
            prisma.item.count({ where: { deletedAt: null, status: 'AVAILABLE' } }),
            // 5. Famílias Ajudadas (Solicitações Aprovadas)
            prisma.donationRequest.count({ where: { status: 'APPROVED' } }),
            // 6. Total de Solicitações (para cálculo da taxa)
            prisma.donationRequest.count()
        ]);

        // Processar itens por mês para o gráfico de barras
        const monthsStr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const itemsPerMonthMap = new Map<string, number>();

        // Inicializar ultimos 6 meses com 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${monthsStr[d.getMonth()]} ${d.getFullYear()}`;
            itemsPerMonthMap.set(key, 0);
        }

        recentItems.forEach(item => {
            const d = new Date(item.createdAt);
            const key = `${monthsStr[d.getMonth()]} ${d.getFullYear()}`;
            if (itemsPerMonthMap.has(key)) {
                itemsPerMonthMap.set(key, (itemsPerMonthMap.get(key) || 0) + 1);
            }
        });

        const itemsPerMonth = Array.from(itemsPerMonthMap.entries()).map(([month, count]) => ({
            month,
            count
        }));

        // Tratar NaN na taxa de sucesso
        const successRate = totalRequests === 0 
            ? 0 
            : Math.round((approvedRequests / totalRequests) * 100);

        res.json({
            kpis: {
                totalUsers,
                totalActiveItems,
                familiesHelped: approvedRequests,
                successRate
            },
            charts: {
                itemsPerMonth,
                itemsByStatus: itemsByStatus.map(s => ({
                    status: s.status,
                    count: s._count
                }))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
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
