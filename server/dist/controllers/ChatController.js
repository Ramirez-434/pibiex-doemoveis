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
exports.getConversations = exports.getMessages = exports.sendMessage = void 0;
const server_1 = require("../server");
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { requestId, content } = req.body;
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!senderId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const request = yield server_1.prisma.donationRequest.findUnique({
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
        const message = yield server_1.prisma.message.create({
            data: {
                content,
                requestId,
                senderId,
            },
        });
        // Determine recipient
        const recipientId = senderId === request.beneficiaryId ? request.item.donorId : request.beneficiaryId;
        // Create notification for recipient
        yield server_1.prisma.notification.create({
            data: {
                userId: recipientId,
                title: 'Nova Mensagem',
                message: `Você recebeu uma mensagem sobre: ${request.item.title}`,
            },
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.sendMessage = sendMessage;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { requestId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const request = yield server_1.prisma.donationRequest.findUnique({
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
        const messages = yield server_1.prisma.message.findMany({
            where: { requestId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true } } },
        });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getMessages = getMessages;
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Find requests where user is donor (via item) or beneficiary
        const requests = yield server_1.prisma.donationRequest.findMany({
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
            var _a, _b;
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
                lastMessage: ((_a = req.messages[0]) === null || _a === void 0 ? void 0 : _a.content) || 'Início da conversa',
                lastMessageTime: ((_b = req.messages[0]) === null || _b === void 0 ? void 0 : _b.createdAt) || req.createdAt,
            };
        });
        res.json(conversations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getConversations = getConversations;
