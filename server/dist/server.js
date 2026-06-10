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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.prisma = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const itemRoutes_1 = __importDefault(require("./routes/itemRoutes"));
const requestRoutes_1 = __importDefault(require("./routes/requestRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const cronJob_1 = require("./cronJob");
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const prismaClient = new client_1.PrismaClient({
    datasourceUrl: "mysql://marqu668_marques:marques4312@localhost:3306/marqu668_doemaisbr"
});
const prisma = prismaClient.$extends({
    query: {
        user: {
            findUnique(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args }) {
                    return prismaClient.user.findFirst(Object.assign(Object.assign({}, args), { where: Object.assign(Object.assign({}, args.where), { deletedAt: null }) }));
                });
            },
            findFirst(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args, query }) {
                    args.where = Object.assign(Object.assign({}, args.where), { deletedAt: null });
                    return query(args);
                });
            },
            findMany(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args, query }) {
                    args.where = Object.assign(Object.assign({}, args.where), { deletedAt: null });
                    return query(args);
                });
            },
        },
        item: {
            findUnique(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args }) {
                    return prismaClient.item.findFirst(Object.assign(Object.assign({}, args), { where: Object.assign(Object.assign({}, args.where), { deletedAt: null }) }));
                });
            },
            findFirst(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args, query }) {
                    args.where = Object.assign(Object.assign({}, args.where), { deletedAt: null });
                    return query(args);
                });
            },
            findMany(_a) {
                return __awaiter(this, arguments, void 0, function* ({ args, query }) {
                    args.where = Object.assign(Object.assign({}, args.where), { deletedAt: null });
                    return query(args);
                });
            },
        },
    },
});
exports.prisma = prisma;
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://pibiex-doemoveis.vercel.app',
        'https://doebrasil.com.br',
        'https://www.doebrasil.com.br',
        'https://doemaisbr.com.br',
        'https://www.doemaisbr.com.br'
    ],
    credentials: true
}));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
const PORT = process.env.PORT || 3000;
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use('/auth', authRoutes_1.default);
app.use('/items', itemRoutes_1.default);
app.use('/requests', requestRoutes_1.default);
app.use('/upload', uploadRoutes_1.default);
app.use('/chat', chatRoutes_1.default);
app.use('/notifications', notificationRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Permitir todas as origens para o chat
        methods: ['GET', 'POST']
    }
});
exports.io = io;
io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);
    // O usuário entra na "sala" do seu requestId
    socket.on('join_chat', (requestId) => {
        socket.join(requestId);
        console.log(`[SOCKET] User ${socket.id} joined room ${requestId}`);
    });
    socket.on('disconnect', () => {
        console.log(`[SOCKET] User disconnected: ${socket.id}`);
    });
});
(0, cronJob_1.startCronJobs)();
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
