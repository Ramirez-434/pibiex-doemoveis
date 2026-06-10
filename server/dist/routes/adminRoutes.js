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
// Get KPI Stats
router.get('/stats', authMiddleware_1.authenticateToken, authMiddleware_1.authorizeAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield server_1.prisma.user.count({ where: { isActive: true } });
        const totalItems = yield server_1.prisma.item.count();
        // Famílias Ajudadas = Total de Solicitações Aprovadas
        const familiesHelped = yield server_1.prisma.donationRequest.count({
            where: { status: 'APPROVED' }
        });
        // Taxa de Sucesso = (Aprovadas / Total) * 100
        const totalRequests = yield server_1.prisma.donationRequest.count();
        const successRate = totalRequests > 0
            ? Math.round((familiesHelped / totalRequests) * 100)
            : 0;
        res.json({
            totalUsers,
            totalItems,
            familiesHelped,
            successRate
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stats' });
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
exports.default = router;
