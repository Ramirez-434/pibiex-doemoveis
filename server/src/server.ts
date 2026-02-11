import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import requestRoutes from './routes/requestRoutes';
import uploadRoutes from './routes/uploadRoutes';
import chatRoutes from './routes/chatRoutes';
import notificationRoutes from './routes/notificationRoutes';
import path from 'path';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export { prisma };
