"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
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
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://pibiex-doemoveis.vercel.app',
        'https://doebrasil.com.br',
        'https://www.doebrasil.com.br'
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
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
