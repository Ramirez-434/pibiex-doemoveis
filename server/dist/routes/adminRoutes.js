"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../server");
const authMiddleware_1 = require("../middleware/authMiddleware");
const sync_1 = require("csv-stringify/sync");
const router = (0, express_1.Router)();
// Get all users
router.get('/users', authMiddleware_1.authenticateToken, authMiddleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield server_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}));
// Get Dashboard Summary (BFF Pattern)
router.get('/dashboard/summary', authMiddleware_1.authenticateToken, authMiddleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Inicio do mes de 6 meses atras
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const [recentItems, itemsByStatus, totalUsers, totalActiveItems, approvedRequests, totalRequests] = yield server_1.prisma.$transaction([
            // 1. Itens para o Gráfico de Barras (últimos 6 meses, ignorando deletados)
            server_1.prisma.item.findMany({
                where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
                select: { createdAt: true }
            }),
            // 2. Gráfico de Rosca (Status dos Itens, ignorando deletados)
            server_1.prisma.item.groupBy({
                by: ['status'],
                _count: true,
                where: { deletedAt: null },
                orderBy: { status: 'asc' }
            }),
            // 3. Usuários Ativos (Ignorando soft deletes)
            server_1.prisma.user.count({ where: { isActive: true } }),
            // 4. Itens Disponíveis (Ignorando deletados)
            server_1.prisma.item.count({ where: { deletedAt: null, status: 'AVAILABLE' } }),
            // 5. Famílias Ajudadas (Solicitações Aprovadas)
            server_1.prisma.donationRequest.count({ where: { status: 'APPROVED' } }),
            // 6. Total de Solicitações (para cálculo da taxa)
            server_1.prisma.donationRequest.count()
        ]);
        // Processar itens por mês para o gráfico de barras
        const monthsStr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const itemsPerMonthMap = new Map();
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
}));
// Delete user
router.delete('/users/:id', authMiddleware_1.authenticateToken, authMiddleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const user = yield server_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Soft Delete cascade para itens do doador
        yield server_1.prisma.item.updateMany({
            where: { donorId: id },
            data: { deletedAt: new Date() }
        });
        // Soft Delete do usuário e ofuscamento do email
        yield server_1.prisma.user.update({
            where: { id },
            data: {
                isActive: false,
                deletedAt: new Date(),
                email: `inativo_${Date.now()}_${user.email}`
            }
        });
        res.json({ message: 'User and their items deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
}));
// Delete item
router.delete('/items/:id', authMiddleware_1.authenticateToken, authMiddleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        yield server_1.prisma.item.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        res.json({ message: 'Item deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
}));
// Export CSV of Donations
router.get('/reports/donations/csv', authMiddleware_1.authenticateToken, authMiddleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio_doacoes.csv"');
        res.write('\uFEFF'); // BOM para Excel reconhecer UTF-8
        // Escreve o cabeçalho
        res.write((0, sync_1.stringify)([['ID', 'Titulo', 'Categoria', 'Status', 'Nome do Doador', 'Email do Doador', 'Recebedor (Aprovado)', 'Data de Criacao']]));
        const batchSize = 500;
        let cursor = null;
        const statusMap = {
            'AVAILABLE': 'Disponível',
            'RESERVED': 'Reservado',
            'DONATED': 'Doado'
        };
        while (true) {
            const items = yield server_1.prisma.item.findMany(Object.assign(Object.assign({ take: batchSize }, (cursor && { cursor: { id: cursor }, skip: 1 })), { where: { deletedAt: null }, include: {
                    donor: true,
                    requests: {
                        where: { status: 'APPROVED' },
                        include: { user: true }
                    }
                }, orderBy: { id: 'asc' } // Necessário para cursor pagination
             }));
            if (items.length === 0)
                break;
            for (const item of items) {
                const receiverName = item.requests && item.requests.length > 0
                    ? item.requests[0].user.name
                    : 'N/A';
                const row = [
                    item.id,
                    item.title,
                    item.category,
                    statusMap[item.status] || item.status,
                    ((_a = item.donor) === null || _a === void 0 ? void 0 : _a.name) || 'Desconhecido',
                    ((_b = item.donor) === null || _b === void 0 ? void 0 : _b.email) || 'Desconhecido',
                    receiverName,
                    item.createdAt.toISOString()
                ];
                res.write((0, sync_1.stringify)([row]));
            }
            cursor = items[items.length - 1].id;
        }
        res.end();
    }
    catch (error) {
        console.error('Error generating CSV stream:', error);
        // Se a stream já começou, é difícil mandar JSON de erro no meio, mas o res.end() encerra
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate CSV' });
        }
        else {
            res.end();
        }
    }
}));
exports.default = router;
