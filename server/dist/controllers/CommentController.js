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
exports.deleteComment = exports.createComment = exports.getComments = void 0;
const server_1 = require("../server");
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId } = req.params;
        const comments = yield server_1.prisma.comment.findMany({
            where: { itemId },
            orderBy: { createdAt: 'asc' },
            include: {
                author: { select: { id: true, name: true, avatar: true } }
            }
        });
        res.json(comments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar comentarios' });
    }
});
exports.getComments = getComments;
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { itemId } = req.params;
        const { content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Nao autorizado' });
            return;
        }
        if (!content || !content.trim()) {
            res.status(400).json({ error: 'Comentario nao pode estar vazio' });
            return;
        }
        if (content.trim().length > 500) {
            res.status(400).json({ error: 'Comentario muito longo (max. 500 caracteres)' });
            return;
        }
        const item = yield server_1.prisma.item.findUnique({ where: { id: itemId } });
        if (!item) {
            res.status(404).json({ error: 'Item nao encontrado' });
            return;
        }
        const comment = yield server_1.prisma.comment.create({
            data: { content: content.trim(), itemId, authorId: userId },
            include: { author: { select: { id: true, name: true, avatar: true } } }
        });
        res.status(201).json(comment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar comentario' });
    }
});
exports.createComment = createComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { commentId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Nao autorizado' });
            return;
        }
        const comment = yield server_1.prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) {
            res.status(404).json({ error: 'Comentario nao encontrado' });
            return;
        }
        if (comment.authorId !== userId) {
            res.status(403).json({ error: 'Voce so pode deletar seus proprios comentarios' });
            return;
        }
        yield server_1.prisma.comment.delete({ where: { id: commentId } });
        res.json({ message: 'Comentario deletado' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar comentario' });
    }
});
exports.deleteComment = deleteComment;
