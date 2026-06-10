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
exports.getPublicStats = exports.deleteItem = exports.createItem = exports.getItemById = exports.getItems = void 0;
const server_1 = require("../server");
const types_1 = require("../types");
const getItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { featured, limit, category, donorId, search } = req.query;
        const where = {
            status: types_1.ItemStatus.AVAILABLE,
        };
        if (category) {
            where.category = category;
        }
        if (req.query.condition) {
            where.condition = req.query.condition;
        }
        if (donorId) {
            where.donorId = String(donorId);
            delete where.status;
        }
        if (search) {
            where.OR = [
                { title: { contains: String(search) } }, // SQLite doesn't support mode: 'insensitive' easily without extension, removing it for now
                { description: { contains: String(search) } },
            ];
        }
        const items = yield server_1.prisma.item.findMany({
            where,
            take: limit ? Number(limit) : undefined,
            orderBy: { createdAt: 'desc' },
            include: { donor: { select: { name: true, city: true, state: true } } }
        });
        // Parse images JSON string back to array
        const parsedItems = items.map(item => (Object.assign(Object.assign({}, item), { images: JSON.parse(item.images) })));
        res.json(parsedItems);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getItems = getItems;
const getItemById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield server_1.prisma.item.findUnique({
            where: { id: String(id) },
            include: { donor: { select: { id: true, name: true, city: true, state: true } } },
        });
        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.json(Object.assign(Object.assign({}, item), { images: JSON.parse(item.images) }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getItemById = getItemById;
const createItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, category, condition, images } = req.body;
        const donorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!donorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const item = yield server_1.prisma.item.create({
            data: {
                title,
                description,
                category: category,
                condition: condition,
                images: JSON.stringify(images || []),
                donorId,
            },
        });
        res.status(201).json(Object.assign(Object.assign({}, item), { images: JSON.parse(item.images) }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createItem = createItem;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const item = yield server_1.prisma.item.findUnique({
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
        yield server_1.prisma.donationRequest.deleteMany({
            where: { itemId: id },
        });
        yield server_1.prisma.item.delete({
            where: { id },
        });
        res.json({ message: 'Item deleted successfully' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteItem = deleteItem;
const getPublicStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemsDonated = yield server_1.prisma.item.count({ where: { status: 'DONATED' } });
        const familiesHelped = yield server_1.prisma.donationRequest.count({ where: { status: 'APPROVED' } });
        const users = yield server_1.prisma.user.findMany({ select: { city: true } });
        const uniqueCities = new Set(users.map(u => { var _a; return (_a = u.city) === null || _a === void 0 ? void 0 : _a.toLowerCase().trim(); }).filter(Boolean));
        const volunteers = yield server_1.prisma.user.count({ where: { isActive: true } });
        res.json({
            itemsDonated,
            familiesHelped,
            cities: uniqueCities.size,
            volunteers
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getPublicStats = getPublicStats;
