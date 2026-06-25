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
exports.getBlockedUsers = exports.unblockUser = exports.blockUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const blockerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
        const existingBlock = yield prisma.blockedUser.findUnique({
            where: {
                blockerId_blockedId: { blockerId, blockedId }
            }
        });
        if (existingBlock) {
            res.status(400).json({ error: 'Usuário já está bloqueado' });
            return;
        }
        yield prisma.blockedUser.create({
            data: { blockerId, blockedId }
        });
        res.status(201).json({ message: 'Usuário bloqueado com sucesso' });
    }
    catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.blockUser = blockUser;
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const blockerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const blockedId = req.params.blockedId;
        if (!blockerId || !blockedId) {
            res.status(400).json({ error: 'IDs inválidos' });
            return;
        }
        const existingBlock = yield prisma.blockedUser.findUnique({
            where: {
                blockerId_blockedId: { blockerId, blockedId }
            }
        });
        if (!existingBlock) {
            res.status(404).json({ error: 'Bloqueio não encontrado' });
            return;
        }
        yield prisma.blockedUser.delete({
            where: {
                blockerId_blockedId: { blockerId, blockedId }
            }
        });
        res.json({ message: 'Usuário desbloqueado com sucesso' });
    }
    catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.unblockUser = unblockUser;
const getBlockedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const blockerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!blockerId) {
            res.status(401).json({ error: 'Não autorizado' });
            return;
        }
        const blocks = yield prisma.blockedUser.findMany({
            where: { blockerId },
            include: {
                blocked: { select: { id: true, name: true, avatar: true } }
            }
        });
        res.json(blocks);
    }
    catch (error) {
        console.error('Error fetching blocked users:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
exports.getBlockedUsers = getBlockedUsers;
