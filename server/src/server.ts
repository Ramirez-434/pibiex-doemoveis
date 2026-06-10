import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import requestRoutes from './routes/requestRoutes';
import uploadRoutes from './routes/uploadRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import { startCronJobs } from './cronJob';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const prismaClient = new PrismaClient({
  datasourceUrl: "mysql://marqu668_marques:marques4312@localhost:3306/marqu668_doemaisbr"
});

const prisma = prismaClient.$extends({
  query: {
    user: {
      async findUnique({ args }) {
        return prismaClient.user.findFirst({ ...args, where: { ...args.where, deletedAt: null } });
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
    item: {
      async findUnique({ args }) {
        return prismaClient.item.findFirst({ ...args, where: { ...args.where, deletedAt: null } });
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
}) as unknown as PrismaClient;

app.use(cors({
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
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/items', itemRoutes);
app.use('/requests', requestRoutes);
app.use('/upload', uploadRoutes);
app.use('/chat', chatRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // Permitir todas as origens para o chat
        methods: ['GET', 'POST']
    }
});

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

startCronJobs();

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export { prisma, io };
