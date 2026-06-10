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
exports.approveRequest = exports.getRequests = exports.createRequest = void 0;
const server_1 = require("../server");
const types_1 = require("../types");
const emailService_1 = require("../services/emailService");
const createRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { itemId } = req.body;
        const beneficiaryId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!beneficiaryId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const item = yield server_1.prisma.item.findUnique({ where: { id: itemId } });
        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        if (item.status !== types_1.ItemStatus.AVAILABLE) {
            res.status(400).json({ error: 'Item not available' });
            return;
        }
        if (item.donorId === beneficiaryId) {
            res.status(400).json({ error: 'Cannot request your own item' });
            return;
        }
        // Controle de Concorrência Otimista (Race Condition)
        const updatedItem = yield server_1.prisma.item.updateMany({
            where: {
                id: itemId,
                status: types_1.ItemStatus.AVAILABLE,
                // Assumindo que o item.version está disponível (precisamos buscar na query acima)
            },
            data: {
                status: types_1.ItemStatus.RESERVED,
                version: { increment: 1 }
            },
        });
        if (updatedItem.count === 0) {
            res.status(409).json({ error: 'Infelizmente, outra pessoa acabou de reservar este item.' });
            return;
        }
        const request = yield server_1.prisma.donationRequest.create({
            data: {
                itemId,
                beneficiaryId,
            },
        });
        // Tentar enviar e-mail para o doador, se ele tiver email cadastrado
        const itemWithDonor = yield server_1.prisma.item.findUnique({
            where: { id: itemId },
            include: { donor: true }
        });
        if (itemWithDonor && itemWithDonor.donor.email) {
            yield (0, emailService_1.sendEmail)(itemWithDonor.donor.email, 'Nova Solicitação de Doação', `<p>Olá ${itemWithDonor.donor.name},</p><p>Alguém acabou de solicitar o seu móvel: <b>${itemWithDonor.title}</b>!</p><p>Acesse o painel para combinar a retirada.</p>`);
        }
        res.status(201).json(request);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createRequest = createRequest;
const getRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { beneficiaryId, itemId } = req.query;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (beneficiaryId && beneficiaryId === userId) {
            const requests = yield server_1.prisma.donationRequest.findMany({
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
            const item = yield server_1.prisma.item.findUnique({ where: { id: String(itemId) } });
            if (!item || item.donorId !== userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            const requests = yield server_1.prisma.donationRequest.findMany({
                where: { itemId: String(itemId) },
                include: { beneficiary: { select: { id: true, name: true, city: true, state: true } } }
            });
            res.json(requests);
            return;
        }
        res.status(400).json({ error: 'Missing filters' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getRequests = getRequests;
const approveRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const request = yield server_1.prisma.donationRequest.findUnique({
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
        yield server_1.prisma.donationRequest.update({
            where: { id },
            data: { status: types_1.RequestStatus.APPROVED },
        });
        yield server_1.prisma.donationRequest.updateMany({
            where: { itemId: request.itemId, id: { not: String(id) } },
            data: { status: types_1.RequestStatus.REJECTED },
        });
        yield server_1.prisma.item.update({
            where: { id: request.itemId },
            data: { status: types_1.ItemStatus.DONATED },
        });
        // Buscar email do beneficiário aprovado para notificar
        const beneficiaryUser = yield server_1.prisma.user.findUnique({ where: { id: request.beneficiaryId } });
        if (beneficiaryUser && beneficiaryUser.email) {
            yield (0, emailService_1.sendEmail)(beneficiaryUser.email, 'Doação Aprovada!', `<p>Olá ${beneficiaryUser.name},</p><p>Sua solicitação para o móvel <b>${request.item.title}</b> foi aprovada!</p><p>Acesse o painel para entrar no chat com o doador e combinar a retirada.</p>`);
        }
        res.json({ message: 'Request approved' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.approveRequest = approveRequest;
